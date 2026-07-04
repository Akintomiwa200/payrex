import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Transfer, TransferStatus } from './entities/transfer.entity';
import { TransferRecipient } from './entities/transfer-recipient.entity';
import { BulkTransfer, BulkTransferStatus } from './entities/bulk-transfer.entity';
import { InternalProvider } from '../providers/process-all-provider';
import { ErrorCodes, throwPaymentError } from '../../common/errors/error-codes';
import { Wallet } from '../balance/entities/wallet.entity';
import { BalanceLedger, LedgerEntryType } from '../balance/entities/balance-ledger.entity';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(
    @InjectRepository(Transfer)
    private transferRepo: Repository<Transfer>,
    @InjectRepository(TransferRecipient)
    private recipientRepo: Repository<TransferRecipient>,
    @InjectRepository(BulkTransfer)
    private bulkTransferRepo: Repository<BulkTransfer>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(BalanceLedger)
    private ledgerRepo: Repository<BalanceLedger>,
    private provider: InternalProvider,
    private timelineService: TimelineService,
    private dataSource: DataSource,
  ) {}

  private generateReference(): string {
    return `TRF-${uuidv4().slice(0, 8).toUpperCase()}`;
  }

  async createRecipient(
    merchantId: string,
    dto: any,
  ): Promise<any> {
    const recipientCode = `RCP_${uuidv4().slice(0, 8).toUpperCase()}`;

    const recipient = this.recipientRepo.create({
      merchantId,
      recipientCode,
      ...dto,
    });

    await this.recipientRepo.save(recipient);

    return recipient;
  }

  async listRecipients(merchantId: string): Promise<any> {
    return this.recipientRepo.find({ where: { merchantId, isActive: true } });
  }

  async initiateTransfer(
    merchantId: string,
    dto: any,
  ): Promise<any> {
    const reference = this.generateReference();
    const recipient = await this.recipientRepo.findOne({
      where: { recipientCode: dto.recipient, merchantId },
    });

    if (!recipient) throwPaymentError(ErrorCodes.RECIPIENT_NOT_FOUND);

    const wallet = await this.walletRepo.findOne({ where: { merchantId } });
    if (!wallet || Number(wallet.balance) < dto.amount) {
      throwPaymentError(ErrorCodes.INSUFFICIENT_BALANCE);
    }

    const transfer = this.transferRepo.create({
      reference,
      merchantId,
      recipientCode: dto.recipient,
      amount: dto.amount,
      currency: dto.currency || 'NGN',
      status: TransferStatus.PROCESSING,
      bankCode: recipient.bankCode,
      bankName: recipient.bankName,
      accountNumber: recipient.accountNumber,
      accountName: recipient.accountName,
      narration: dto.narration || undefined,
      metadata: dto.metadata,
    });
    await this.transferRepo.save(transfer);

    await this.timelineService.record(
      merchantId, reference, 'payout_initiated',
      { amount: dto.amount, bank: recipient.bankName },
      `Transfer initiated to ${recipient.accountName} - ${recipient.bankName}`,
    );

    const providerResult = await this.provider.transfer({
      reference,
      amount: dto.amount,
      currency: dto.currency || 'NGN',
      bankCode: recipient.bankCode,
      accountNumber: recipient.accountNumber,
      accountName: recipient.accountName,
      narration: dto.narration,
    });

    const ledger = this.ledgerRepo.create({
      merchantId,
      transactionReference: reference,
      type: LedgerEntryType.DEBIT,
      amount: dto.amount + providerResult.fee,
      balanceBefore: Number(wallet.balance),
      balanceAfter: Number(wallet.balance) - dto.amount - providerResult.fee,
      currency: dto.currency || 'NGN',
      description: `Transfer to ${recipient.accountName} - ${recipient.bankName}`,
    });
    await this.ledgerRepo.save(ledger);

    wallet.balance = Number(wallet.balance) - dto.amount - providerResult.fee;
    await this.walletRepo.save(wallet);

    transfer.status = providerResult.success ? TransferStatus.SUCCESS : TransferStatus.FAILED;
    transfer.processorReference = providerResult.processorReference;
    transfer.fee = providerResult.fee;
    transfer.processedAt = providerResult.success ? new Date() : undefined;
    transfer.failedReason = providerResult.success ? undefined : 'Processing failed';
    await this.transferRepo.save(transfer);

    await this.timelineService.record(
      merchantId, reference, 'payout_completed',
      { status: transfer.status, processorReference: providerResult.processorReference },
      `Transfer ${transfer.status}`,
    );

    return {
      reference: transfer.reference,
      amount: transfer.amount,
      fee: transfer.fee,
      status: transfer.status,
      recipient: recipient.accountName,
      bank: recipient.bankName,
      accountNumber: recipient.accountNumber,
    };
  }

  async initiateBulkTransfer(
    merchantId: string,
    dto: any,
  ): Promise<any> {
    const batchCode = `BAT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const transferRefs: string[] = [];
    let totalAmount = 0;

    for (const item of dto.transfers) {
      const ref = this.generateReference();
      transferRefs.push(ref);
      totalAmount += item.amount;

      const transfer = this.transferRepo.create({
        reference: ref,
        merchantId,
        recipientCode: item.recipient,
        amount: item.amount,
        currency: item.currency || 'NGN',
        status: TransferStatus.PENDING,
        narration: item.narration,
        metadata: { batchCode },
      });
      await this.transferRepo.save(transfer);
    }

    const bulk = this.bulkTransferRepo.create({
      merchantId,
      batchCode,
      transferReferences: transferRefs,
      totalAmount,
      status: BulkTransferStatus.PROCESSING,
      metadata: dto.metadata,
    });
    await this.bulkTransferRepo.save(bulk);

    let successCount = 0;
    let failedCount = 0;

    for (const ref of transferRefs) {
      const transfer = await this.transferRepo.findOne({ where: { reference: ref } });
      if (!transfer) continue;

      const recipient = await this.recipientRepo.findOne({
        where: { recipientCode: transfer.recipientCode, merchantId },
      });

      const result = await this.provider.transfer({
        reference: ref,
        amount: Number(transfer.amount),
        currency: transfer.currency,
        bankCode: recipient?.bankCode || '',
        accountNumber: recipient?.accountNumber || '',
        accountName: recipient?.accountName || '',
      });

      transfer.status = result.success ? TransferStatus.SUCCESS : TransferStatus.FAILED;
      transfer.processorReference = result.processorReference;
      transfer.processedAt = result.success ? new Date() : undefined;
      transfer.fee = result.fee;
      await this.transferRepo.save(transfer);

      if (result.success) successCount++;
      else failedCount++;
    }

    bulk.successCount = successCount;
    bulk.failedCount = failedCount;
    bulk.status = failedCount === 0
      ? BulkTransferStatus.COMPLETED
      : successCount > 0
        ? BulkTransferStatus.PARTIALLY_COMPLETED
        : BulkTransferStatus.FAILED;
    await this.bulkTransferRepo.save(bulk);

    return {
      batchCode: bulk.batchCode,
      totalAmount: bulk.totalAmount,
      totalTransfers: transferRefs.length,
      successCount,
      failedCount,
      status: bulk.status,
    };
  }

  async listTransfers(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const where: any = { merchantId };
    if (query.status) where.status = query.status;

    const [transfers, total] = await this.transferRepo.findAndCount({
      where,
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
    });

    return {
      data: transfers,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  async listBulkTransfers(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const [batches, total] = await this.bulkTransferRepo.findAndCount({
      where: { merchantId },
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
    });

    return {
      data: batches,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }
}
