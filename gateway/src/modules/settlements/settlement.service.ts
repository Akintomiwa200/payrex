import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Settlement, SettlementStatus } from './entities/settlement.entity';
import { Wallet } from '../balance/entities/wallet.entity';
import { BalanceLedger, LedgerEntryType } from '../balance/entities/balance-ledger.entity';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(Settlement)
    private settlementRepo: Repository<Settlement>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(BalanceLedger)
    private ledgerRepo: Repository<BalanceLedger>,
  ) {}

  async initiate(merchantId: string, dto: any): Promise<any> {
    const wallet = await this.walletRepo.findOne({ where: { merchantId } });

    if (!wallet || Number(wallet.balance) <= 0) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    const amount = dto.amount || Number(wallet.balance);
    if (amount > Number(wallet.balance)) {
      throw new HttpException('Insufficient balance for settlement', HttpStatus.BAD_REQUEST);
    }

    const fee = amount * 0.01;
    const netAmount = amount - fee;

    const settlement = this.settlementRepo.create({
      merchantId,
      settlementCode: `SET_${uuidv4().slice(0, 8).toUpperCase()}`,
      amount,
      fee,
      netAmount,
      status: SettlementStatus.PENDING,
      settlementBank: dto.bank,
      settlementAccount: dto.accountNumber,
      metadata: { accountName: dto.accountName },
    });

    await this.settlementRepo.save(settlement);

    wallet.balance = Number(wallet.balance) - amount;
    await this.walletRepo.save(wallet);

    const ledgerEntry = this.ledgerRepo.create({
      merchantId,
      transactionReference: settlement.settlementCode,
      type: LedgerEntryType.SETTLEMENT,
      amount,
      balanceBefore: Number(wallet.balance) + amount,
      balanceAfter: Number(wallet.balance),
      currency: wallet.currency,
      description: `Settlement to ${dto.bank} - ${dto.accountNumber}`,
    });
    await this.ledgerRepo.save(ledgerEntry);

    return {
      settlementCode: settlement.settlementCode,
      amount,
      fee,
      netAmount,
      status: 'pending',
      bank: dto.bank,
      accountNumber: dto.accountNumber,
    };
  }

  async list(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const where: any = { merchantId };
    if (query.status) where.status = query.status;

    const [settlements, total] = await this.settlementRepo.findAndCount({
      where,
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
    });

    return {
      data: settlements,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }
}
