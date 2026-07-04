import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KYCController } from './kyc.controller';
import { KYCService } from './kyc.service';
import { KYCRecord, BVNRecord } from './entities/kyc.entity';
import { Merchant } from '../auth/entities/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KYCRecord, BVNRecord, Merchant])],
  controllers: [KYCController],
  providers: [KYCService],
  exports: [KYCService],
})
export class KYCModel {}
