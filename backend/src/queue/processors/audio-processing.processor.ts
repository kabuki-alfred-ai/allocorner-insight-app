import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Readable } from 'stream';
import { AudioJobData } from '../interfaces/job-data.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { GoogleSpeechService } from '../../google/google-speech.service';
import { ClaudeService } from '../../claude/claude.service';
import { PitchAnalysisService } from '../../audio/pitch-analysis.service';

@Processor('audio-processing', {
  concurrency: 5,
})
export class AudioProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(AudioProcessingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly googleSpeech: GoogleSpeechService,
    private readonly gemini: ClaudeService,
    private readonly pitchAnalysis: PitchAnalysisService,
  ) {
    super();
  }

  async process(job: Job<AudioJobData>): Promise<void> {
    const { messageId } = job.data;

    this.logger.log(
      `Starting audio processing for message ${messageId} (attempt ${job.attemptsMade + 1})`,
    );

    try {
      // Step 1: Mark as PROCESSING
      await job.updateProgress(10);
      await this.prisma.message.update({
        where: { id: messageId },
        data: { processingStatus: 'PROCESSING' },
      });

      // Step 2: Fetch audio from MinIO and buffer it
      // (we need the same data for both pitch analysis and transcription)
      await job.updateProgress(20);
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) throw new Error(`Message ${messageId} not found`);
      if (!message.audioKey) throw new Error(`Message ${messageId} has no audio file`);

      this.logger.log(`Fetching audio from Minio: ${message.audioKey}`);
      const audioStream = await this.storage.getAudioStream(message.audioKey);
      const audioBuffer = await this.streamToBuffer(audioStream);

      // Step 3: Pitch analysis + Transcription in parallel
      await job.updateProgress(30);
      this.logger.log(`Running pitch analysis + transcription in parallel for ${messageId}`);

      const [pitchResult, transcriptionResult] = await Promise.all([
        this.pitchAnalysis.analyzeStream(Readable.from(audioBuffer)),
        this.googleSpeech.transcribe(Readable.from(audioBuffer), {
          language: 'fr-FR',
          enableDiarization: true,
        }),
      ]);

      this.logger.log(
        `Pitch: ${pitchResult.pitchDescription} | Transcription: ${transcriptionResult.text.substring(0, 50)}...`,
      );

      // Step 4: Save transcription
      await job.updateProgress(60);
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          transcriptTxt: transcriptionResult.text,
          speaker: transcriptionResult.primarySpeaker,
          duration: transcriptionResult.duration,
        },
      });

      // Step 5: Analyze tone + speaker profile with Gemini (pitch-informed)
      await job.updateProgress(80);
      this.logger.log(`Running Gemini analysis for message ${messageId} (voice: ${pitchResult.voiceGender})`);
      const analysis = await this.gemini.analyzeTranscription(
        transcriptionResult.text,
        pitchResult.voiceGender,
      );

      // Step 6: Finalize
      await job.updateProgress(100);
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          processingStatus: 'COMPLETED',
          tone: analysis.tone,
          speakerProfile: analysis.speakerProfile,
          processedAt: new Date(),
          gcpJobId: job.id,
          gcpDuration: job.processedOn ? Date.now() - job.processedOn : null,
        },
      });

      this.logger.log(
        `Completed processing for message ${messageId} — tone: ${analysis.tone}, speaker: ${analysis.speakerProfile}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process audio for message ${messageId}`,
        error.stack,
      );

      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          processingStatus: 'FAILED',
          processingError: error.message || 'Unknown error',
          retryCount: job.attemptsMade,
        },
      });

      throw error;
    }
  }

  private streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
