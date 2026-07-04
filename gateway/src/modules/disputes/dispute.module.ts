import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisputeController } from './dispute.controller';
import { DisputeService } from './dispute.service';
import { Dispute } from './entities/dispute.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionTimeline } from '../timeline/entities/timeline.entity';
import { TimelineService } from '../timeline/timeline.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispute, Transaction, TransactionTimeline]),
  ],
  controllers: [DisputeController],
  providers: [DisputeService, TimelineService],
  exports: [DisputeService],
})
export class DisputesModule {}
