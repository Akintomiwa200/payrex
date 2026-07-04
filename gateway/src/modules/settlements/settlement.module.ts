import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';
import { Settlement } from './entities/settlement.entity';
import { Wallet } from '../balance/entities/wallet.entity';
import { BalanceLedger } from '../balance/entities/balance-ledger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Settlement, Wallet, BalanceLedger])],
  controllers: [SettlementController],
  providers: [SettlementService],
  exports: [SettlementService],
})
export class SettlementsModule {}
