import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { AudioProcessingProcessor } from './processors/audio-processing.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { GoogleModule } from '../google/google.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    StorageModule,
    GoogleModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'audio-processing',
    }),
  ],
  providers: [QueueService, AudioProcessingProcessor],
  exports: [QueueService],
})
export class QueueModule {}
