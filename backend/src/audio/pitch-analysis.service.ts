import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegStatic = require('ffmpeg-static');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pitchfinder = require('pitchfinder');

export type VoiceGender = 'MALE' | 'FEMALE' | 'CHILD' | 'UNKNOWN';

export interface PitchAnalysisResult {
  medianPitch: number | null;
  voiceGender: VoiceGender;
  pitchDescription: string;
}

@Injectable()
export class PitchAnalysisService {
  private readonly logger = new Logger(PitchAnalysisService.name);
  private readonly SAMPLE_RATE = 16000;
  private readonly FRAME_SIZE = 2048;

  // Fundamental frequency thresholds (Hz)
  // Male speech: ~85-180 Hz
  // Female speech: ~165-255 Hz
  // Child speech: ~250-400 Hz
  private readonly MALE_MAX_HZ = 165;
  private readonly FEMALE_MAX_HZ = 255;

  async analyzeStream(audioStream: Readable): Promise<PitchAnalysisResult> {
    try {
      const pcmBuffer = await this.streamToPcm(audioStream);
      const samples = this.bufferToFloat32(pcmBuffer);
      const medianPitch = this.estimateMedianPitch(samples);

      if (medianPitch === null) {
        return { medianPitch: null, voiceGender: 'UNKNOWN', pitchDescription: 'Impossible de détecter le pitch' };
      }

      const voiceGender = this.pitchToGender(medianPitch);
      const pitchDescription = this.buildDescription(medianPitch, voiceGender);

      this.logger.log(`Pitch analysis: ${medianPitch.toFixed(1)} Hz → ${voiceGender}`);
      return { medianPitch, voiceGender, pitchDescription };
    } catch (error) {
      this.logger.warn(`Pitch analysis failed: ${error.message}`);
      return { medianPitch: null, voiceGender: 'UNKNOWN', pitchDescription: 'Analyse du pitch échouée' };
    }
  }

  private streamToPcm(input: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      Ffmpeg.setFfmpegPath(ffmpegStatic);

      Ffmpeg(input)
        .inputFormat('mp3')
        .audioFrequency(this.SAMPLE_RATE)
        .audioChannels(1)
        .audioCodec('pcm_s16le')
        .format('s16le')
        .on('error', (err) => reject(new Error(`ffmpeg error: ${err.message}`)))
        .pipe()
        .on('data', (chunk: Buffer) => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', (err: Error) => reject(err));
    });
  }

  private bufferToFloat32(buf: Buffer): Float32Array {
    const samples = new Float32Array(buf.length / 2);
    for (let i = 0; i < samples.length; i++) {
      samples[i] = buf.readInt16LE(i * 2) / 32768;
    }
    return samples;
  }

  private estimateMedianPitch(samples: Float32Array): number | null {
    const detector = pitchfinder.YIN({ sampleRate: this.SAMPLE_RATE });
    const pitches: number[] = [];

    for (let i = 0; i + this.FRAME_SIZE <= samples.length; i += this.FRAME_SIZE) {
      const frame = samples.slice(i, i + this.FRAME_SIZE);
      const pitch = detector(frame);
      if (pitch !== null && pitch > 50 && pitch < 500) {
        pitches.push(pitch);
      }
    }

    if (pitches.length === 0) return null;

    pitches.sort((a, b) => a - b);
    const mid = Math.floor(pitches.length / 2);
    return pitches.length % 2 === 0
      ? (pitches[mid - 1] + pitches[mid]) / 2
      : pitches[mid];
  }

  private pitchToGender(hz: number): VoiceGender {
    if (hz < this.MALE_MAX_HZ) return 'MALE';
    if (hz < this.FEMALE_MAX_HZ) return 'FEMALE';
    return 'CHILD';
  }

  private buildDescription(hz: number, gender: VoiceGender): string {
    const labels: Record<VoiceGender, string> = {
      MALE: 'voix masculine',
      FEMALE: 'voix féminine',
      CHILD: 'voix enfantine',
      UNKNOWN: 'genre indéterminé',
    };
    return `Fréquence fondamentale détectée : ${hz.toFixed(1)} Hz (${labels[gender]})`;
  }
}
