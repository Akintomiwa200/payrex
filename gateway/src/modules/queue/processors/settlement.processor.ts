import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Settlement, SettlementStatus } from '../../settlements/entities/settlement.entity';
import { Transaction, TransactionStatus } from '../../transactions/entities/transaction.entity';
import { Wallet } from '../../balance/entities/wallet.entity';
import { BalanceLedger, LedgerEntryType } from '../../balance/entities/balance-ledger.entity';
import { InternalProvider } from '../../providers/process-all-provider';
import { QueueService } from '../queue.service';

export interface BatchSettlementJobData {
  merchantId: string;
  settlementIds: string[];
  batchReference: string;
}

export interface ReconciliationJobData {
  merchantId?: string;
  batchReference?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class SettlementProcessor {
  private readonly logger = new Logger(SettlementProcessor.name);

  constructor(
    @InjectRepository(Settlement) private settlementRepo: Repository<Settlement>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(BalanceLedger) private ledgerRepo: Repository<BalanceLedger>,
    private provider: InternalProvider,
    private dataSource: DataSource,
  ) {}

  async processBatchSettlement(job: Job<BatchSettlementJobData>): Promise<any> {
    const { merchantId, settlementIds } = job.data;
    this.logger.log(`Processing batch settlement for merchant ${merchantId}: ${settlementIds.length} settlements`);

    const results: Array<{ settlementCode: string; status: string; amount: number; fee: number }> = [];

    for (const settlementId of settlementIds) {
      const settlement = await this.settlementRepo.findOne({ where: { id: settlementId, merchantId } });
      if (!settlement || settlement.status !== SettlementStatus.PENDING) continue;

      settlement.status = SettlementStatus.PROCESSING;
      await this.settlementRepo.save(settlement);

      const wallet = await this.walletRepo.findOne({ where: { merchantId } });
      if (!wallet || Number(wallet.balance) < Number(settlement.amount)) {
        settlement.status = SettlementStatus.FAILED;
        await this.settlementRepo.save(settlement);
        results.push({ settlementCode: settlement.settlementCode, status: 'failed', amount: Number(settlement.amount), fee: Number(settlement.fee) });
        continue;
      }

      const result = await this.provider.transfer({
        reference: settlement.settlementCode,
        amount: Number(settlement.amount),
        currency: settlement.currency,
        bankCode: settlement.settlementBank || '',
        accountNumber: settlement.settlementAccount || '',
        accountName: 'Merchant Settlement',
        narration: `Settlement ${settlement.settlementCode}`,
      });

      if (result.success) {
        settlement.status = SettlementStatus.COMPLETED;
        settlement.settledAt = new Date();
        await this.settlementRepo.save(settlement);

        wallet.balance = Number(wallet.balance) - Number(settlement.amount);
        wallet.totalVolume = wallet.totalVolume;
        await this.walletRepo.save(wallet);

        const ledgerEntry = this.ledgerRepo.create({
          merchantId, transactionReference: settlement.settlementCode,
          type: LedgerEntryType.SETTLEMENT, amount: Number(settlement.amount),
          balanceBefore: Number(wallet.balance) + Number(settlement.amount),
          balanceAfter: Number(wallet.balance),
          currency: settlement.currency,
          description: `Settlement completed: ${settlement.settlementCode}`,
        });
        await this.ledgerRepo.save(ledgerEntry);

        results.push({ settlementCode: settlement.settlementCode, status: 'completed', amount: Number(settlement.amount), fee: Number(settlement.fee) });
      } else {
        settlement.status = SettlementStatus.FAILED;
        await this.settlementRepo.save(settlement);
        results.push({ settlementCode: settlement.settlementCode, status: 'failed', amount: Number(settlement.amount), fee: Number(settlement.fee) });
      }
    }

    return { merchantId, processed: results.length, results };
  }

  async reconcile(job: Job<ReconciliationJobData>): Promise<any> {
    this.logger.log('Running settlement reconciliation...');

    const pendingTransactions = await this.transactionRepo.find({
      where: { status: TransactionStatus.SUCCESS, paidAt: LessThan(new Date(Date.now() - 24 * 60 * 60 * 1000)) },
    });

    this.logger.log(`Found ${pendingTransactions.length} transactions pending settlement`);

    const merchantGroups = new Map<string, { transactions: Transaction[]; totalAmount: number }>();

    for (const txn of pendingTransactions) {
      const group = merchantGroups.get(txn.merchantId) || { transactions: [], totalAmount: 0 };
      group.transactions.push(txn);
      group.totalAmount += Number(txn.amount);
      merchantGroups.set(txn.merchantId, group);
    }

    const settlements: Settlement[] = [];

    for (const [merchantId, group] of merchantGroups) {
      const fee = group.totalAmount * 0.01;
      const netAmount = group.totalAmount - fee;

      const settlement = this.settlementRepo.create({
        merchantId,
        settlementCode: `SET-${Date.now().toString(36).toUpperCase()}`,
        amount: group.totalAmount,
        fee,
        netAmount,
        status: SettlementStatus.PENDING,
        metadata: { reconciledTransactions: group.transactions.map((t) => t.reference) },
      });
      await this.settlementRepo.save(settlement);
      settlements.push(settlement);
    }

    return {
      merchantsProcessed: merchantGroups.size,
      settlementsCreated: settlements.length,
      totalReconciled: pendingTransactions.length,
      timestamp: new Date().toISOString(),
    };
  }
}
