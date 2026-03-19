import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { GoogleSpeechService } from './google-speech.service';
import { GoogleStorageService } from './google-storage.service';
import { GoogleLanguageService } from './google-language.service';

@Module({
  imports: [ConfigModule],
  providers: [GoogleAuthService, GoogleSpeechService, GoogleStorageService, GoogleLanguageService],
  exports: [GoogleAuthService, GoogleSpeechService, GoogleStorageService, GoogleLanguageService],
})
export class GoogleModule {}
