import { Module } from '@nestjs/common';
import { ObjectivesService } from './objectives.service.js';
import { ObjectivesController } from './objectives.controller.js';

@Module({
  controllers: [ObjectivesController],
  providers: [ObjectivesService],
})
export class ObjectivesModule {}
