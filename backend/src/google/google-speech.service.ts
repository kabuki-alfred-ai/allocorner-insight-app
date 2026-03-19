import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 } from '@google-cloud/speech';
import { Readable } from 'stream';
import { GoogleAuthService } from './google-auth.service';
import { GoogleStorageService } from './google-storage.service';

export interface TranscriptionResult {
  text: string;
  primarySpeaker: string;
  allSpeakers: string[];
  duration: number;
  confidence: number;
}

@Injectable()
export class GoogleSpeechService {
  private readonly logger = new Logger(GoogleSpeechService.name);
  private readonly client: v2.SpeechClient;

  constructor(
    private configService: ConfigService,
    private googleAuthService: GoogleAuthService,
    private googleStorage: GoogleStorageService,
  ) {
    this.client = new v2.SpeechClient();
  }

  /**
   * Transcribe audio with speaker diarization using Speech-to-Text v2.
   * Audio is temporarily uploaded to GCS to support files longer than 60 seconds.
   */
  async transcribe(
    audioStream: Readable,
    options: {
      audioKey?: string;
      enableDiarization?: boolean;
    } = {},
  ): Promise<TranscriptionResult> {
    const enableDiarization =
      options.enableDiarization ??
      this.configService.get<boolean>('google.speech.enableDiarization');

    const projectId = this.configService.get<string>('google.projectId');
    const languages = this.configService.get<string[]>('google.speech.languages');

    this.logger.log('Starting audio transcription with Google Speech-to-Text v2');

    const audioBuffer = await this.streamToBuffer(audioStream);
    const audioKey = options.audioKey ?? `audio-${Date.now()}`;
    let gcsUri: string | null = null;

    try {
      gcsUri = await this.googleStorage.uploadAudio(audioBuffer, audioKey);

      const request = {
        recognizer: `projects/${projectId}/locations/global/recognizers/_`,
        config: {
          autoDecodingConfig: {},
          languageCodes: languages,
          model: 'long',
          features: {
            enableAutomaticPunctuation: true,
            enableWordTimeOffsets: true,
            ...(enableDiarization && {
              diarizationConfig: {
                minSpeakerCount: 1,
                maxSpeakerCount: 6,
              },
            }),
          },
        },
        files: [{ uri: gcsUri }],
        recognitionOutputConfig: {
          inlineResponseConfig: {},
        },
      };

      const [operation] = await this.client.batchRecognize(request);
      const [response] = await operation.promise();

      const fileResult = response.results?.[gcsUri];
      if (!fileResult?.transcript?.results?.length) {
        throw new Error('No transcription results from Google Speech API');
      }

      const results = fileResult.transcript.results;

      // Extract transcription
      const transcription = results
        .map((result) => result.alternatives?.[0]?.transcript || '')
        .join(' ')
        .trim();

      // Extract speaker information from diarization (v2 uses speakerLabel)
      const speakers = new Set<string>();
      const speakerCounts = new Map<string, number>();

      if (enableDiarization) {
        const wordsInfo = results.flatMap((result) => result.alternatives?.[0]?.words || []);

        wordsInfo.forEach((wordInfo) => {
          const label = wordInfo.speakerLabel;
          if (label) {
            speakers.add(label);
            speakerCounts.set(label, (speakerCounts.get(label) || 0) + 1);
          }
        });
      }

      const primarySpeaker =
        speakerCounts.size > 0
          ? Array.from(speakerCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
          : 'Unknown';

      // Duration from last word timestamp
      let duration = 0;
      const lastResult = results[results.length - 1];
      const lastWords = lastResult?.alternatives?.[0]?.words;
      const lastWord = lastWords?.[lastWords.length - 1];
      if (lastWord?.endOffset) {
        duration =
          Number((lastWord.endOffset as any).seconds || 0) +
          Number((lastWord.endOffset as any).nanos || 0) / 1e9;
      }

      // Average confidence
      const confidence =
        results.reduce((sum, result) => sum + (result.alternatives?.[0]?.confidence || 0), 0) /
        results.length;

      this.logger.log(
        `Transcription completed: ${transcription.length} chars, ${speakers.size} speakers, ${duration.toFixed(2)}s`,
      );

      return {
        text: transcription,
        primarySpeaker,
        allSpeakers: Array.from(speakers),
        duration,
        confidence,
      };
    } finally {
      if (gcsUri) {
        await this.googleStorage.deleteAudio(gcsUri).catch((err) =>
          this.logger.warn(`Failed to delete GCS temp file: ${err.message}`),
        );
      }
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
