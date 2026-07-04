import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { ComplianceScreening, TransactionMonitoring } from './entities/compliance.entity';
import { Merchant } from '../auth/entities/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceScreening, TransactionMonitoring, Merchant])],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
