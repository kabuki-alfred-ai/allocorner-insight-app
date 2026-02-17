import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GoogleAuthService implements OnModuleInit {
  private readonly logger = new Logger(GoogleAuthService.name);
  private credentials: any;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.loadCredentials();
  }

  /**
   * Load Google Cloud credentials from file or environment
   */
  private async loadCredentials() {
    const credentialsPath = this.configService.get<string>(
      'google.credentialsPath',
    );

    if (!credentialsPath) {
      this.logger.warn(
        'GOOGLE_APPLICATION_CREDENTIALS not set - Google Cloud features will be disabled',
      );
      return;
    }

    // Resolve path relative to project root
    const fullPath = path.isAbsolute(credentialsPath)
      ? credentialsPath
      : path.join(process.cwd(), credentialsPath);

    if (!fs.existsSync(fullPath)) {
      this.logger.warn(
        `Google credentials file not found at ${fullPath} - Google Cloud features will be disabled`,
      );
      return;
    }

    try {
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      this.credentials = JSON.parse(fileContent);
      this.logger.log('Google Cloud credentials loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load Google Cloud credentials', error.stack);
      throw error;
    }
  }

  /**
   * Get Google Cloud project ID
   */
  getProjectId(): string {
    return (
      this.configService.get<string>('google.projectId') ||
      this.credentials?.project_id
    );
  }

  /**
   * Check if Google Cloud is configured
   */
  isConfigured(): boolean {
    return !!this.credentials || !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  /**
   * Get auth client for Google Cloud APIs
   */
  getCredentials() {
    return this.credentials;
  }
}
