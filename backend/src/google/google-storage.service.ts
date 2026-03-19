import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GoogleStorageService {
  private readonly logger = new Logger(GoogleStorageService.name);
  private readonly storage: Storage;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    this.storage = new Storage();
    this.bucket = this.configService.get<string>('google.storage.bucket');
  }

  async uploadAudio(audioBuffer: Buffer, originalKey: string): Promise<string> {
    const fileName = `speech-tmp/${uuidv4()}-${originalKey.split('/').pop()}`;
    const file = this.storage.bucket(this.bucket).file(fileName);

    await file.save(audioBuffer, {
      metadata: { contentType: 'audio/mpeg' },
    });

    const gcsUri = `gs://${this.bucket}/${fileName}`;
    this.logger.log(`Uploaded audio to GCS: ${gcsUri}`);
    return gcsUri;
  }

  async deleteAudio(gcsUri: string): Promise<void> {
    const fileName = gcsUri.replace(`gs://${this.bucket}/`, '');
    await this.storage.bucket(this.bucket).file(fileName).delete({ ignoreNotFound: true });
    this.logger.log(`Deleted audio from GCS: ${gcsUri}`);
  }
}
