import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpeechClient } from '@google-cloud/speech';
import { Readable } from 'stream';

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
  private readonly client: SpeechClient;

  constructor(private configService: ConfigService) {
    const credentialsPath = this.configService.get<string>(
      'google.credentialsPath',
    );

    this.client = new SpeechClient({
      keyFilename: credentialsPath,
    });
  }

  /**
   * Transcribe audio with speaker diarization
   */
  async transcribe(
    audioStream: Readable,
    options: {
      language?: string;
      enableDiarization?: boolean;
    } = {},
  ): Promise<TranscriptionResult> {
    const language =
      options.language || this.configService.get<string>('google.speech.language');
    const enableDiarization =
      options.enableDiarization ??
      this.configService.get<boolean>('google.speech.enableDiarization');

    this.logger.log('Starting audio transcription with Google Speech-to-Text');

    try {
      // Convert stream to buffer
      const audioBuffer = await this.streamToBuffer(audioStream);

      // Prepare request
      const request = {
        audio: {
          content: audioBuffer.toString('base64'),
        },
        config: {
          encoding: 'MP3' as const,
          sampleRateHertz: 16000,
          languageCode: language,
          model: this.configService.get<string>('google.speech.model') || 'latest_long',
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
          diarizationConfig: enableDiarization
            ? {
                enableSpeakerDiarization: true,
                minSpeakerCount: 1,
                maxSpeakerCount: 6,
              }
            : undefined,
        },
      };

      // Call Google Speech-to-Text API
      const [response] = await this.client.recognize(request);

      if (!response.results || response.results.length === 0) {
        throw new Error('No transcription results from Google Speech API');
      }

      // Extract transcription
      const transcription = response.results
        .map((result) => result.alternatives?.[0]?.transcript || '')
        .join(' ')
        .trim();

      // Extract speaker information from diarization
      const speakers = new Set<string>();
      let primarySpeaker = 'Unknown';

      if (enableDiarization && response.results.length > 0) {
        const wordsInfo = response.results
          .flatMap((result) => result.alternatives?.[0]?.words || []);

        wordsInfo.forEach((wordInfo) => {
          if (wordInfo.speakerTag !== undefined) {
            speakers.add(`Speaker ${wordInfo.speakerTag}`);
          }
        });

        // Primary speaker is the one with most words
        const speakerCounts = new Map<string, number>();
        wordsInfo.forEach((wordInfo) => {
          if (wordInfo.speakerTag !== undefined) {
            const speaker = `Speaker ${wordInfo.speakerTag}`;
            speakerCounts.set(speaker, (speakerCounts.get(speaker) || 0) + 1);
          }
        });

        if (speakerCounts.size > 0) {
          primarySpeaker = Array.from(speakerCounts.entries()).sort(
            (a, b) => b[1] - a[1],
          )[0][0];
        }
      }

      // Calculate audio duration (approximate from word timestamps)
      let duration = 0;
      const lastResult = response.results[response.results.length - 1];
      const lastWord =
        lastResult?.alternatives?.[0]?.words?.[
          lastResult.alternatives[0].words.length - 1
        ];

      if (lastWord?.endTime) {
        duration =
          Number(lastWord.endTime.seconds || 0) +
          Number(lastWord.endTime.nanos || 0) / 1e9;
      }

      // Get average confidence
      const confidence =
        response.results.reduce(
          (sum, result) => sum + (result.alternatives?.[0]?.confidence || 0),
          0,
        ) / response.results.length;

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
    } catch (error) {
      this.logger.error('Failed to transcribe audio', error.stack);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
