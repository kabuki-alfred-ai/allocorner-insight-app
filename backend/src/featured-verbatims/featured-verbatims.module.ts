import { Module } from '@nestjs/common';
import { FeaturedVerbatimsController } from './featured-verbatims.controller.js';
import { FeaturedVerbatimsService } from './featured-verbatims.service.js';

@Module({
  controllers: [FeaturedVerbatimsController],
  providers: [FeaturedVerbatimsService],
  exports: [FeaturedVerbatimsService],
})
export class FeaturedVerbatimsModule {}
