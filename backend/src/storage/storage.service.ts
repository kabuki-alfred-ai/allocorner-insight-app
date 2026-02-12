import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client;
  private audioBucket: string;
  private logosBucket: string;

  constructor(private config: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.config.get<string>('minio.endpoint')!,
      port: this.config.get<number>('minio.port'),
      useSSL: this.config.get<boolean>('minio.useSSL'),
      accessKey: this.config.get<string>('minio.accessKey')!,
      secretKey: this.config.get<string>('minio.secretKey')!,
    });
    this.audioBucket = this.config.get<string>('minio.audioBucket')!;
    this.logosBucket = this.config.get<string>('minio.logosBucket')!;
  }

  async onModuleInit() {
    for (const bucket of [this.audioBucket, this.logosBucket]) {
      const exists = await this.client.bucketExists(bucket);
      if (!exists) {
        await this.client.makeBucket(bucket);
        this.logger.log(`Created bucket "${bucket}"`);
      }
    }
    this.logger.log('Storage service initialised');
  }

  async uploadAudio(
    projectId: string,
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const key = `${projectId}/${uuid()}-${filename}`;
    await this.client.putObject(this.audioBucket, key, buffer, buffer.length, {
      'Content-Type': mimetype,
    });
    return key;
  }

  async uploadLogo(
    projectId: string,
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const key = `${projectId}/${uuid()}-${filename}`;
    await this.client.putObject(this.logosBucket, key, buffer, buffer.length, {
      'Content-Type': mimetype,
    });
    return key;
  }

  async getPresignedAudioUrl(
    key: string,
    expirySeconds = 3600,
  ): Promise<string> {
    return this.client.presignedGetObject(
      this.audioBucket,
      key,
      expirySeconds,
    );
  }

  async getPresignedLogoUrl(
    key: string,
    expirySeconds = 3600,
  ): Promise<string> {
    return this.client.presignedGetObject(
      this.logosBucket,
      key,
      expirySeconds,
    );
  }

  async deleteAudio(key: string): Promise<void> {
    await this.client.removeObject(this.audioBucket, key);
  }

  async deleteLogo(key: string): Promise<void> {
    await this.client.removeObject(this.logosBucket, key);
  }

  async getAudioStream(key: string) {
    return this.client.getObject(this.audioBucket, key);
  }
}
