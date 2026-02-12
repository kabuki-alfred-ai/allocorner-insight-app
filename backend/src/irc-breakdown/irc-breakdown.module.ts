import { Module } from '@nestjs/common';
import { IrcBreakdownService } from './irc-breakdown.service.js';
import { IrcBreakdownController } from './irc-breakdown.controller.js';

@Module({
  controllers: [IrcBreakdownController],
  providers: [IrcBreakdownService],
})
export class IrcBreakdownModule {}
