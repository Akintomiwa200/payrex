import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { TransactionsModule } from './modules/transactions/transaction.module';
import { CustomersModule } from './modules/customers/customer.module';
import { SubscriptionsModule } from './modules/subscriptions/subscription.module';
import { SplitsModule } from './modules/splits/split.module';
import { WebhooksModule } from './modules/webhooks/webhook.module';
import { BalanceModule } from './modules/balance/balance.module';
import { SettlementsModule } from './modules/settlements/settlement.module';
import { TokensModule } from './modules/tokens/token.module';
import { TransfersModule } from './modules/transfers/transfer.module';
import { DisputesModule } from './modules/disputes/dispute.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { MiscModule } from './modules/misc/misc.module';
import { ProviderModule } from './modules/providers/provider.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
import { QueueModule } from './modules/queue/queue.module';
import { ThreeDSModule } from './modules/threeds/threeds.module';
import { KYCModel } from './modules/kyc/kyc.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { StorageModule } from './modules/storage/storage.module';
import { EncryptionModule } from './common/encryption/encryption.module';
import { AuditModule } from './common/audit/audit.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { ApiKey } from './modules/auth/entities/api-key.entity';
import { IdempotencyKey } from './modules/idempotency/idempotency.entity';
import { IdempotencyMiddleware } from './modules/idempotency/idempotency.middleware';
import { IpFilterMiddleware } from './common/middleware/ip-filter.middleware';
import { RequestValidationMiddleware } from './common/middleware/request-validation.middleware';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { DataMaskingInterceptor } from './common/interceptors/masking.interceptor';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('throttle.ttl') || 60000,
            limit: config.get<number>('throttle.limit') || 10,
          },
        ],
      }),
    }),
    TypeOrmModule.forFeature([ApiKey, IdempotencyKey]),
    ProviderModule,
    IdempotencyModule,
    QueueModule,
    DatabaseModule,
    EncryptionModule,
    AuditModule,
    AuthModule,
    TransactionsModule,
    CustomersModule,
    SubscriptionsModule,
    SplitsModule,
    WebhooksModule,
    BalanceModule,
    SettlementsModule,
    TokensModule,
    TransfersModule,
    DisputesModule,
    TimelineModule,
    MiscModule,
    ThreeDSModule,
    KYCModel,
    ComplianceModule,
    StorageModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    ApiKeyGuard,
    { provide: APP_GUARD, useExisting: ApiKeyGuard },
    { provide: APP_INTERCEPTOR, useClass: DataMaskingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(IpFilterMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(RequestValidationMiddleware)
      .forRoutes({ path: 'api/v1/*', method: RequestMethod.POST });
    consumer
      .apply(IdempotencyMiddleware)
      .forRoutes({ path: 'api/v1/*', method: RequestMethod.POST });
  }
}
