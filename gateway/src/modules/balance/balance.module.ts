import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { Wallet } from './entities/wallet.entity';
import { BalanceLedger } from './entities/balance-ledger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, BalanceLedger])],
  controllers: [BalanceController],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
