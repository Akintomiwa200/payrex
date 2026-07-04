import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Wallet } from '../balance/entities/wallet.entity';
import { BalanceLedger } from '../balance/entities/balance-ledger.entity';
import { WebhookEvent } from '../webhooks/entities/webhook-event.entity';
import { WebhookEndpoint } from '../webhooks/entities/webhook-endpoint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Customer,
      Wallet,
      BalanceLedger,
      WebhookEvent,
      WebhookEndpoint,
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionsModule {}
