import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreeDSController } from './threeds.controller';
import { ThreeDSService } from './threeds.service';
import { ThreeDSAuthentication } from './entities/threeds-authentication.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionTimeline } from '../timeline/entities/timeline.entity';
import { TimelineService } from '../timeline/timeline.service';
import { InternalProvider } from '../providers/process-all-provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThreeDSAuthentication, Transaction, TransactionTimeline]),
  ],
  controllers: [ThreeDSController],
  providers: [ThreeDSService, TimelineService, InternalProvider],
  exports: [ThreeDSService],
})
export class ThreeDSModule {}
