import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Subscription } from './entities/subscription.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, Subscription, Transaction]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionsModule {}
