import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Bull, { Queue, Job, QueueOptions } from 'bull';

interface WorkerOptions {
  concurrency?: number;
  limiter?: { max: number; duration: number };
  [key: string]: any;
}

export enum QueueName {
  PAYMENTS = 'payments',
  WEBHOOKS = 'webhooks',
  SETTLEMENTS = 'settlements',
  REFUNDS = 'refunds',
  TRANSFERS = 'transfers',
  DISPUTES = 'disputes',
  COMPLIANCE = 'compliance',
  EMAIL = 'email',
  RECONCILIATION = 'reconciliation',
}

export enum PaymentJobType {
  PROCESS_CARD = 'process_card',
  PROCESS_BANK_TRANSFER = 'process_bank_transfer',
  PROCESS_USSD = 'process_ussd',
  VERIFY_BANK_TRANSFER = 'verify_bank_transfer',
  CHARGE_TOKEN = 'charge_token',
  PROCESS_3DS = 'process_3ds',
  CAPTURE = 'capture',
  VOID = 'void',
  REFUND = 'refund',
}

export enum WebhookJobType {
  DELIVER = 'deliver_webhook',
  RETRY = 'retry_webhook',
  CLEANUP = 'cleanup_webhook_logs',
}

export enum SettlementJobType {
  PROCESS_BATCH = 'process_batch',
  RECONCILE = 'reconcile',
  GENERATE_REPORT = 'generate_report',
}

export enum ComplianceJobType {
  SCREEN_MERCHANT = 'screen_merchant',
  MONITOR_TRANSACTION = 'monitor_transaction',
  SANCTION_CHECK = 'sanction_check',
  PEP_CHECK = 'pep_check',
  PERIODIC_REVIEW = 'periodic_review',
}

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private queues: Map<QueueName, Queue> = new Map();
  private workers: Bull.Queue[] = [];
  private readonly defaultOptions: QueueOptions;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('redis.url') || 'redis://localhost:6379';
    this.defaultOptions = {
      redis: redisUrl,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    };
  }

  getQueue(name: QueueName): Queue {
    if (!this.queues.has(name)) {
      const queue = new Bull(name, this.defaultOptions);

      queue.on('error', (err) => this.logger.error(`Queue ${name} error:`, err));
      queue.on('failed', (job, err) =>
        this.logger.warn(`Job ${job.id} (${job.name}) failed in ${name}: ${err.message}`),
      );
      queue.on('completed', (job) =>
        this.logger.debug(`Job ${job.id} (${job.name}) completed in ${name}`),
      );

      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  async add<T = any>(
    queueName: QueueName,
    jobName: string,
    data: T,
    options?: Bull.JobOptions,
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(jobName, data, {
      ...options,

    });
    this.logger.log(`Job ${job.id} (${jobName}) added to ${queueName}`);
    return job;
  }

  async addBulk<T = any>(
    queueName: QueueName,
    jobs: Array<{ name: string; data: T; opts?: Bull.JobOptions }>,
  ): Promise<Job<T>[]> {
    const queue = this.getQueue(queueName);
    const results = await queue.addBulk(
      jobs.map((j) => ({
        name: j.name,
        data: j.data,
        opts: { ...j.opts },
      })),
    );
    this.logger.log(`${results.length} jobs added to ${queueName}`);
    return results;
  }

  async scheduleRecurring<T = any>(
    queueName: QueueName,
    jobName: string,
    data: T,
    cron: string,
    options?: Bull.JobOptions,
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, {
      ...options,
      repeat: { cron },
      removeOnComplete: true,
    });
  }

  registerWorker(
    queueName: QueueName,
    processor: (job: Job) => Promise<any>,
    options?: WorkerOptions,
  ): Bull.Queue {
    const worker = new Bull(queueName, this.defaultOptions) as any;

    worker.process(
      options?.concurrency || 5,
      async (job: Job) => {
        const startTime = Date.now();
        try {
          const result = await processor(job);
          const duration = Date.now() - startTime;
          this.logger.log(`Worker processed ${job.id} (${job.name}) in ${duration}ms`);
          return result;
        } catch (error: any) {
          const duration = Date.now() - startTime;
          this.logger.error(`Worker failed ${job.id} (${job.name}) after ${duration}ms: ${error.message}`);
          throw error;
        }
      },
    );

    worker.on('error', (err: any) => this.logger.error(`Worker ${queueName} error:`, err));
    worker.on('completed', (job: Job) => this.logger.debug(`Worker completed ${job.id} in ${queueName}`));
    worker.on('failed', (job: Job, err: any) => this.logger.warn(`Worker ${queueName} job ${job?.id} failed: ${err.message}`));

    this.workers.push(worker);
    this.logger.log(`Worker registered for queue: ${queueName}`);
    return worker;
  }

  async getJobCounts(queueName: QueueName): Promise<Bull.JobCounts> {
    const queue = this.getQueue(queueName);
    return queue.getJobCounts();
  }

  async pauseQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    this.logger.warn(`Queue ${queueName} paused`);
  }

  async resumeQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
    this.logger.log(`Queue ${queueName} resumed`);
  }

  async getQueueMetrics(): Promise<Record<string, Bull.JobCounts>> {
    const metrics: Record<string, Bull.JobCounts> = {};
    for (const [name] of this.queues) {
      metrics[name] = await this.getJobCounts(name);
    }
    return metrics;
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down queues and workers...');
    for (const worker of this.workers) {
      await worker.close();
    }
    for (const [, queue] of this.queues) {
      await queue.close();
    }
    this.logger.log('Queues and workers shut down');
  }
}
