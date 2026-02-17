import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { MessagesController } from './messages.controller.js';
import { QueueModule } from '../queue/queue.module.js';

@Module({
  imports: [QueueModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
