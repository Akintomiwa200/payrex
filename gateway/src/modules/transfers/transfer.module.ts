import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { Transfer } from './entities/transfer.entity';
import { TransferRecipient } from './entities/transfer-recipient.entity';
import { BulkTransfer } from './entities/bulk-transfer.entity';
import { Wallet } from '../balance/entities/wallet.entity';
import { BalanceLedger } from '../balance/entities/balance-ledger.entity';
import { TimelineService } from '../timeline/timeline.service';
import { TransactionTimeline } from '../timeline/entities/timeline.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transfer,
      TransferRecipient,
      BulkTransfer,
      Wallet,
      BalanceLedger,
      TransactionTimeline,
    ]),
  ],
  controllers: [TransferController],
  providers: [TransferService, TimelineService],
  exports: [TransferService],
})
export class TransfersModule {}
