import { Module } from '@nestjs/common';
import { TransversalController } from './transversal.controller.js';
import { TransversalService } from './transversal.service.js';

@Module({
  controllers: [TransversalController],
  providers: [TransversalService],
  exports: [TransversalService],
})
export class TransversalModule {}
