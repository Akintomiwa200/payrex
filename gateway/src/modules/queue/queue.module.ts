import { Global, Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueService } from './queue.service';
import { PaymentProcessor } from './processors/payment.processor';
import { SettlementProcessor } from './processors/settlement.processor';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Wallet } from '../balance/entities/wallet.entity';
import { BalanceLedger } from '../balance/entities/balance-ledger.entity';
import { Settlement } from '../settlements/entities/settlement.entity';
import { InternalProvider } from '../providers/process-all-provider';
import { WebhookService } from '../webhooks/webhook.service';
import { TimelineService } from '../timeline/timeline.service';
import { WebhookEndpoint } from '../webhooks/entities/webhook-endpoint.entity';
import { WebhookEvent } from '../webhooks/entities/webhook-event.entity';
import { TransactionTimeline } from '../timeline/entities/timeline.entity';
import { QueueName } from './queue.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction, Wallet, BalanceLedger, Settlement,
      WebhookEndpoint, WebhookEvent, TransactionTimeline,
    ]),
  ],
  providers: [
    QueueService, PaymentProcessor, SettlementProcessor,
    InternalProvider, WebhookService, TimelineService,
  ],
  exports: [QueueService, PaymentProcessor, SettlementProcessor],
})
export class QueueModule implements OnModuleInit {
  private readonly logger = new Logger(QueueModule.name);

  constructor(
    private queueService: QueueService,
    private paymentProcessor: PaymentProcessor,
    private settlementProcessor: SettlementProcessor,
  ) {}

  onModuleInit(): void {
    this.logger.log('Registering queue workers...');

    this.queueService.registerWorker(
      QueueName.PAYMENTS,
      async (job) => {
        switch (job.name) {
          case 'process_card': return this.paymentProcessor.processCardCharge(job);
          case 'verify_bank_transfer': return this.paymentProcessor.verifyBankTransfer(job);
          default: throw new Error(`Unknown payment job: ${job.name}`);
        }
      },
      { concurrency: 10 },
    );

    this.queueService.registerWorker(
      QueueName.SETTLEMENTS,
      async (job) => {
        switch (job.name) {
          case 'process_batch': return this.settlementProcessor.processBatchSettlement(job);
          case 'reconcile': return this.settlementProcessor.reconcile(job);
          default: throw new Error(`Unknown settlement job: ${job.name}`);
        }
      },
      { concurrency: 5 },
    );

    this.queueService.registerWorker(
      QueueName.RECONCILIATION,
      async (job) => this.settlementProcessor.reconcile(job),
      { concurrency: 2 },
    );

    this.queueService.scheduleRecurring(
      QueueName.RECONCILIATION,
      'auto_reconcile',
      {},
      '0 */6 * * *',
    );

    this.logger.log('Queue workers registered and recurring jobs scheduled');
  }
}
