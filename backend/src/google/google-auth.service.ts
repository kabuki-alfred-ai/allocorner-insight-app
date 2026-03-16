import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private credentials: any;

  constructor(private configService: ConfigService) {
    this.loadCredentials();
  }

  /**
   * Load credentials and, if found via base64, write them to a temp file
   * and set GOOGLE_APPLICATION_CREDENTIALS so all Google Cloud SDKs pick it up.
   */
  private loadCredentials() {
    // If GOOGLE_APPLICATION_CREDENTIALS already points to a valid file, use it as-is
    const existingPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (existingPath && fs.existsSync(existingPath)) {
      try {
        this.credentials = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
        this.logger.log(`Google Cloud credentials loaded from ${existingPath}`);
        return;
      } catch (error) {
        this.logger.error('Failed to read GOOGLE_APPLICATION_CREDENTIALS file', error.message);
      }
    }

    // Decode from GOOGLE_CREDENTIALS_BASE64 and write to a temp file
    const base64Credentials = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (base64Credentials) {
      try {
        const trimmed = base64Credentials.trim();
        const json = Buffer.from(trimmed, 'base64').toString('utf-8');

        // Validate JSON before writing
        this.credentials = JSON.parse(json);

        // Write to temp file so all Google Cloud SDKs (gRPC included) find it via ADC
        const tmpFile = path.join(os.tmpdir(), 'google-credentials.json');
        fs.writeFileSync(tmpFile, json, { encoding: 'utf-8', mode: 0o600 });
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpFile;

        this.logger.log(
          `Google Cloud credentials loaded (project: ${this.credentials.project_id}) → ${tmpFile}`,
        );
        return;
      } catch (error) {
        this.logger.error(
          `Failed to parse GOOGLE_CREDENTIALS_BASE64: ${error.message}`,
        );
        // Log first/last chars to help debug truncation issues
        const b64 = base64Credentials.trim();
        this.logger.debug(
          `Base64 length=${b64.length}, starts="${b64.slice(0, 20)}", ends="${b64.slice(-20)}"`,
        );
      }
    }

    // Fall back to path from config
    const credentialsPath = this.configService.get<string>('google.credentialsPath');
    if (!credentialsPath) {
      this.logger.warn('No Google credentials found — Google Cloud features will be disabled');
      return;
    }

    const fullPath = path.isAbsolute(credentialsPath)
      ? credentialsPath
      : path.join(process.cwd(), credentialsPath);

    if (!fs.existsSync(fullPath)) {
      this.logger.warn(`Credentials file not found at ${fullPath}`);
      return;
    }

    try {
      this.credentials = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      process.env.GOOGLE_APPLICATION_CREDENTIALS = fullPath;
      this.logger.log(`Google Cloud credentials loaded from ${fullPath}`);
    } catch (error) {
      this.logger.error('Failed to read credentials file', error.message);
      throw error;
    }
  }

  getProjectId(): string {
    return (
      this.configService.get<string>('google.projectId') ||
      this.credentials?.project_id
    );
  }

  isConfigured(): boolean {
    return !!this.credentials;
  }

  getCredentials() {
    return this.credentials;
  }
}
