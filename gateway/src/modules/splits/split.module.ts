import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SplitController } from './split.controller';
import { SplitService } from './split.service';
import { SplitPayment } from './entities/split-payment.entity';
import { SplitRecipient } from './entities/split-recipient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SplitPayment, SplitRecipient])],
  controllers: [SplitController],
  providers: [SplitService],
  exports: [SplitService],
})
export class SplitsModule {}
