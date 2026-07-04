import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { BalanceLedger } from './entities/balance-ledger.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(BalanceLedger)
    private ledgerRepo: Repository<BalanceLedger>,
  ) {}

  async getBalance(merchantId: string): Promise<any> {
    let wallet = await this.walletRepo.findOne({ where: { merchantId } });

    if (!wallet) {
      wallet = this.walletRepo.create({ merchantId });
      await this.walletRepo.save(wallet);
    }

    return {
      balance: Number(wallet.balance),
      pendingBalance: Number(wallet.pendingBalance),
      totalVolume: Number(wallet.totalVolume),
      currency: wallet.currency,
    };
  }

  async getLedger(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const where: any = { merchantId };
    if (query.type) where.type = query.type;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [entries, total] = await this.ledgerRepo.findAndCount({
      where,
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
    });

    return {
      data: entries,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }
}
