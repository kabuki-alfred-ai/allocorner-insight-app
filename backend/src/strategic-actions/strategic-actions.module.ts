import { Module } from '@nestjs/common';
import { StrategicActionsService } from './strategic-actions.service.js';
import { StrategicActionsController } from './strategic-actions.controller.js';

@Module({
  controllers: [StrategicActionsController],
  providers: [StrategicActionsService],
})
export class StrategicActionsModule {}
