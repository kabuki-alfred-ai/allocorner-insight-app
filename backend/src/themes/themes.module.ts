import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ThemesController } from './themes.controller.js';
import { ThemesService } from './themes.service.js';
import { ThemesMessagesController } from './themes-messages.controller.js';
import { ThemesMessagesService } from './themes-messages.service.js';
import { ThemeKeywordsController } from './theme-keywords.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [ThemesController, ThemesMessagesController, ThemeKeywordsController],
  providers: [ThemesService, ThemesMessagesService],
  exports: [ThemesService, ThemesMessagesService],
})
export class ThemesModule {}
