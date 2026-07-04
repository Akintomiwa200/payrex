import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../../transactions/entities/transaction.entity';
import { InternalProvider } from '../../providers/process-all-provider';
import { Wallet } from '../../balance/entities/wallet.entity';
import { BalanceLedger, LedgerEntryType } from '../../balance/entities/balance-ledger.entity';
import { WebhookService } from '../../webhooks/webhook.service';
import { TimelineService } from '../../timeline/timeline.service';
import { QueueService } from '../queue.service';

export interface CardPaymentJobData {
  merchantId: string;
  reference: string;
  amount: number;
  currency: string;
  card?: { number: string; expMonth: string; expYear: string; cvv: string };
  email: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface TokenChargeJobData {
  merchantId: string;
  token: string;
  amount: number;
  currency: string;
  reference: string;
  metadata?: Record<string, any>;
}

export interface BankTransferVerificationJobData {
  merchantId: string;
  reference: string;
  amount: number;
  currency: string;
}

@Injectable()
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(BalanceLedger) private ledgerRepo: Repository<BalanceLedger>,
    private provider: InternalProvider,
    private webhookService: WebhookService,
    private timelineService: TimelineService,
  ) {}

  async processCardCharge(job: Job<CardPaymentJobData>): Promise<any> {
    const { merchantId, reference, amount, currency, card, email, metadata } = job.data;
    this.logger.log(`Processing card charge: ${reference}`);

    const transaction = await this.transactionRepo.findOne({ where: { reference, merchantId } });
    if (!transaction) throw new Error(`Transaction ${reference} not found`);

    transaction.status = TransactionStatus.PROCESSING;
    await this.transactionRepo.save(transaction);

    await this.timelineService.record(merchantId, reference, 'processing', {}, 'Processing card payment via queue');

    const result = await this.provider.charge({ reference, amount, currency, card, email, metadata });

    transaction.status = result.success ? TransactionStatus.SUCCESS : TransactionStatus.FAILED;
    transaction.amountCharged = result.amount;
    transaction.fee = result.fee;
    transaction.cardType = result.cardType;
    transaction.last4 = result.last4;
    transaction.gatewayResponse = result.gatewayResponse;
    transaction.paidAt = result.success ? new Date() : undefined;
    transaction.failureReason = result.success ? undefined : 'Card declined';
    await this.transactionRepo.save(transaction);

    await this.timelineService.record(
      merchantId, reference, result.success ? 'success' : 'failed',
      { fee: result.fee, processorReference: result.processorReference },
      result.success ? 'Payment successful' : 'Payment failed',
    );

    if (result.success) {
      await this.creditWallet(merchantId, reference, amount, result.fee, currency);
    }

    await this.webhookService.dispatch(
      merchantId,
      result.success ? 'charge.success' : 'charge.failed',
      { event: result.success ? 'charge.success' : 'charge.failed', data: { reference, amount, currency, status: result.status, fee: result.fee, cardType: result.cardType, last4: result.last4, processorReference: result.processorReference, paidAt: transaction.paidAt, failureReason: transaction.failureReason } },
    );

    return { success: result.success, reference, status: transaction.status };
  }

  async processTokenCharge(job: Job<TokenChargeJobData>): Promise<any> {
    this.logger.log(`Processing token charge: ${job.data.reference}`);
    // Token charge logic
    return { success: true, reference: job.data.reference };
  }

  async verifyBankTransfer(job: Job<BankTransferVerificationJobData>): Promise<any> {
    const { merchantId, reference } = job.data;
    this.logger.log(`Verifying bank transfer: ${reference}`);

    const transaction = await this.transactionRepo.findOne({ where: { reference, merchantId } });
    if (!transaction) throw new Error(`Transaction ${reference} not found`);

    // Simulated verification — in production, poll bank API or listen for webhook
    transaction.status = TransactionStatus.SUCCESS;
    transaction.paidAt = new Date();
    await this.transactionRepo.save(transaction);

    await this.timelineService.record(merchantId, reference, 'success', {}, 'Bank transfer verified');
    await this.webhookService.dispatch(merchantId, 'charge.success', {
      event: 'charge.success',
      data: { reference, amount: transaction.amount, status: 'success' },
    });

    return { success: true, reference };
  }

  private async creditWallet(merchantId: string, reference: string, amount: number, fee: number, currency: string) {
    let wallet = await this.walletRepo.findOne({ where: { merchantId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ merchantId, currency: currency as any });
      await this.walletRepo.save(wallet);
    }

    const netAmount = amount - fee;
    const balanceBefore = Number(wallet.balance);
    wallet.balance = balanceBefore + netAmount;
    wallet.totalVolume = Number(wallet.totalVolume) + amount;
    await this.walletRepo.save(wallet);

    const ledgerEntry = this.ledgerRepo.create({
      merchantId, transactionReference: reference, type: LedgerEntryType.CREDIT,
      amount: netAmount, balanceBefore, balanceAfter: Number(wallet.balance),
      currency: currency as any, description: `Payment received: ${reference}`,
    });
    await this.ledgerRepo.save(ledgerEntry);
  }
}
