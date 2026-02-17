import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { GoogleSpeechService } from './google-speech.service';
import { GoogleLanguageService } from './google-language.service';

@Module({
  imports: [ConfigModule],
  providers: [GoogleAuthService, GoogleSpeechService, GoogleLanguageService],
  exports: [GoogleAuthService, GoogleSpeechService, GoogleLanguageService],
})
export class GoogleModule {}
