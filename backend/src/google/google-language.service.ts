import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LanguageServiceClient } from '@google-cloud/language';

export interface SentimentResult {
  score: number; // -1 to 1
  magnitude: number; // 0 to infinity
  tone: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

@Injectable()
export class GoogleLanguageService {
  private readonly logger = new Logger(GoogleLanguageService.name);
  private readonly client: LanguageServiceClient;

  constructor(private configService: ConfigService) {
    const credentialsPath = this.configService.get<string>(
      'google.credentialsPath',
    );

    this.client = new LanguageServiceClient({
      keyFilename: credentialsPath,
    });
  }

  /**
   * Analyze sentiment of text and convert to Tone
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!text || text.trim().length === 0) {
      this.logger.warn('Empty text provided for sentiment analysis');
      return {
        score: 0,
        magnitude: 0,
        tone: 'NEUTRAL',
      };
    }

    this.logger.log(
      `Analyzing sentiment for text of length ${text.length} chars`,
    );

    try {
      const document = {
        content: text,
        type: 'PLAIN_TEXT' as const,
      };

      const [result] = await this.client.analyzeSentiment({ document });

      if (!result.documentSentiment) {
        throw new Error('No sentiment analysis result from Google Language API');
      }

      const score = result.documentSentiment.score || 0;
      const magnitude = result.documentSentiment.magnitude || 0;

      // Map Google sentiment score to Tone enum
      // Score ranges from -1 (negative) to 1 (positive)
      // Thresholds: < -0.25 = NEGATIVE, > 0.25 = POSITIVE, else NEUTRAL
      let tone: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

      if (score < -0.25) {
        tone = 'NEGATIVE';
      } else if (score > 0.25) {
        tone = 'POSITIVE';
      } else {
        tone = 'NEUTRAL';
      }

      this.logger.log(
        `Sentiment analysis completed: score=${score.toFixed(2)}, magnitude=${magnitude.toFixed(2)}, tone=${tone}`,
      );

      return {
        score,
        magnitude,
        tone,
      };
    } catch (error) {
      this.logger.error('Failed to analyze sentiment', error.stack);
      throw new Error(`Sentiment analysis failed: ${error.message}`);
    }
  }
}
