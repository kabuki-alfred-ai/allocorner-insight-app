import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service.js';
import { ResourcesController } from './resources.controller.js';
import { ResourceGeneratorService } from './resource-generator.service.js';

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService, ResourceGeneratorService],
})
export class ResourcesModule {}
