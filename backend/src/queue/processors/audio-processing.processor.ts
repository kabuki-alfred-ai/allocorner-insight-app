import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { AudioJobData } from '../interfaces/job-data.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { GoogleSpeechService } from '../../google/google-speech.service';
import { GoogleLanguageService } from '../../google/google-language.service';

@Processor('audio-processing', {
  concurrency: 5, // Process 5 jobs simultaneously
})
export class AudioProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(AudioProcessingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly googleSpeech: GoogleSpeechService,
    private readonly googleLanguage: GoogleLanguageService,
  ) {
    super();
  }

  async process(job: Job<AudioJobData>): Promise<void> {
    const { messageId, projectId } = job.data;

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

      // Step 2: Fetch message and audio from Minio
      await job.updateProgress(20);
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new Error(`Message ${messageId} not found`);
      }

      if (!message.audioKey) {
        throw new Error(`Message ${messageId} has no audio file`);
      }

      this.logger.log(`Fetching audio from Minio: ${message.audioKey}`);
      const audioStream = await this.storage.getAudioStream(message.audioKey);

      // Step 3: Transcription + Speaker Diarization (Google Speech)
      await job.updateProgress(30);
      this.logger.log(`Transcribing audio for message ${messageId}`);
      const transcriptionResult = await this.googleSpeech.transcribe(
        audioStream,
        {
          language: 'fr-FR',
          enableDiarization: true,
        },
      );

      // Step 4: Save intermediate results
      await job.updateProgress(60);
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          transcriptTxt: transcriptionResult.text,
          speaker: transcriptionResult.primarySpeaker,
          duration: transcriptionResult.duration,
        },
      });

      this.logger.log(
        `Transcription saved for message ${messageId}: ${transcriptionResult.text.substring(0, 50)}...`,
      );

      // Step 5: Analyze sentiment (Google Language)
      await job.updateProgress(80);
      this.logger.log(`Analyzing sentiment for message ${messageId}`);
      const sentiment = await this.googleLanguage.analyzeSentiment(
        transcriptionResult.text,
      );

      // Step 6: Finalize
      await job.updateProgress(100);
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          processingStatus: 'COMPLETED',
          tone: sentiment.tone,
          processedAt: new Date(),
          gcpJobId: job.id,
          gcpDuration: job.processedOn ? Date.now() - job.processedOn : null,
        },
      });

      this.logger.log(
        `Completed audio processing for message ${messageId} - Tone: ${sentiment.tone}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process audio for message ${messageId}`,
        error.stack,
      );

      // Update message with error
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          processingStatus: 'FAILED',
          processingError: error.message || 'Unknown error',
          retryCount: job.attemptsMade,
        },
      });

      throw error; // BullMQ will handle retry
    }
  }
}
