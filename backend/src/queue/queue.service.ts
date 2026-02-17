import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { AudioJobData } from './interfaces/job-data.interface';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly audioQueue: Queue;

  constructor(private configService: ConfigService) {
    // Setup audio processing queue with connection config
    this.audioQueue = new Queue('audio-processing', {
      connection: {
        host: this.configService.get<string>('redis.host'),
        port: this.configService.get<number>('redis.port'),
        password: this.configService.get<string>('redis.password'),
        maxRetriesPerRequest: null, // Required for BullMQ
      },
      defaultJobOptions: {
        attempts: this.configService.get<number>('queue.maxRetries', 3),
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2s delay
        },
        removeOnComplete: {
          count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
          count: 500, // Keep last 500 failed jobs for debugging
        },
      },
    });

    this.logger.log('Queue service initialized');
  }

  /**
   * Add a new audio processing job to the queue
   */
  async addProcessingJob(
    messageId: string,
    projectId: string,
  ): Promise<string> {
    try {
      const job = await this.audioQueue.add(
        'process-audio',
        {
          messageId,
          projectId,
        } as AudioJobData,
        {
          jobId: `audio-${messageId}`, // Unique job ID prevents duplicates
        },
      );

      this.logger.log(`Added processing job for message ${messageId}`);
      return job.id || '';
    } catch (error) {
      this.logger.error(
        `Failed to add processing job for message ${messageId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string) {
    const job = await this.audioQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      id: job.id,
      state,
      progress,
      attemptsMade: job.attemptsMade,
      data: job.data,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    };
  }

  /**
   * Retry a failed job
   */
  async retryJob(messageId: string): Promise<void> {
    const jobId = `audio-${messageId}`;
    const job = await this.audioQueue.getJob(jobId);

    if (!job) {
      this.logger.warn(`Job ${jobId} not found - cannot determine projectId for retry`);
      return;
    }

    const state = await job.getState();

    if (state === 'failed') {
      await job.retry();
      this.logger.log(`Retrying job ${jobId}`);
    } else if (state === 'completed') {
      this.logger.warn(`Job ${jobId} already completed`);
    } else {
      this.logger.warn(`Job ${jobId} is in state ${state}, cannot retry`);
    }
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.audioQueue.getWaitingCount(),
      this.audioQueue.getActiveCount(),
      this.audioQueue.getCompletedCount(),
      this.audioQueue.getFailedCount(),
      this.audioQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Clean up on module destroy
   */
  async onModuleDestroy() {
    await this.audioQueue.close();
    this.logger.log('Queue service destroyed');
  }
}
