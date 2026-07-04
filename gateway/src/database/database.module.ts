import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { Transaction } from '../modules/transactions/entities/transaction.entity';
import { Customer } from '../modules/customers/entities/customer.entity';
import { Subscription } from '../modules/subscriptions/entities/subscription.entity';
import { SubscriptionPlan } from '../modules/subscriptions/entities/subscription-plan.entity';
import { SplitPayment } from '../modules/splits/entities/split-payment.entity';
import { SplitRecipient } from '../modules/splits/entities/split-recipient.entity';
import { WebhookEndpoint } from '../modules/webhooks/entities/webhook-endpoint.entity';
import { WebhookEvent } from '../modules/webhooks/entities/webhook-event.entity';
import { BalanceLedger } from '../modules/balance/entities/balance-ledger.entity';
import { Wallet } from '../modules/balance/entities/wallet.entity';
import { Settlement } from '../modules/settlements/entities/settlement.entity';
import { ApiKey } from '../modules/auth/entities/api-key.entity';
import { Merchant } from '../modules/auth/entities/merchant.entity';
import { KYCRecord, BVNRecord } from '../modules/kyc/entities/kyc.entity';
import { PaymentToken } from '../modules/tokens/entities/token.entity';
import { Transfer } from '../modules/transfers/entities/transfer.entity';
import { BulkTransfer } from '../modules/transfers/entities/bulk-transfer.entity';
import { TransferRecipient } from '../modules/transfers/entities/transfer-recipient.entity';
import { Dispute } from '../modules/disputes/entities/dispute.entity';
import { TransactionTimeline } from '../modules/timeline/entities/timeline.entity';
import { ThreeDSAuthentication } from '../modules/threeds/entities/threeds-authentication.entity';
import { ComplianceScreening, TransactionMonitoring } from '../modules/compliance/entities/compliance.entity';
import { IdempotencyKey } from '../modules/idempotency/idempotency.entity';
import { AuditLog } from '../common/audit/audit.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const isProd = config.get<string>('env') === 'production';
        return {
          type: 'postgres',
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.name'),
          autoLoadEntities: true,
          synchronize: !isProd,
          logging: config.get<string>('env') === 'development' ? ['error', 'warn'] : ['error'],
          ssl: isProd ? { rejectUnauthorized: false } : false,
          poolSize: config.get<number>('database.poolSize') || 20,
          extra: {
            max: config.get<number>('database.poolSize') || 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            query_timeout: 15000,
            statement_timeout: 30000,
          },
          retryAttempts: 5,
          retryDelay: 3000,
          keepConnectionAlive: true,
        };
      },
    }),
    TypeOrmModule.forFeature([
      Transaction, Customer, Subscription, SubscriptionPlan,
      SplitPayment, SplitRecipient, WebhookEndpoint, WebhookEvent,
      BalanceLedger, Wallet, Settlement, ApiKey, Merchant,
      KYCRecord, BVNRecord, PaymentToken, Transfer, BulkTransfer,
      TransferRecipient, Dispute, TransactionTimeline, ThreeDSAuthentication,
      ComplianceScreening, TransactionMonitoring, IdempotencyKey, AuditLog,
    ]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}
