import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Currency } from '../../transactions/entities/transaction.entity';
import { LedgerEntryType } from '../entities/balance-ledger.entity';

export class BalanceResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 'Balance retrieved' })
  message: string;

  data: {
    balance: number;
    pendingBalance: number;
    totalVolume: number;
    currency: string;
  };
}

export class LedgerQueryDto {
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 50 })
  perPage?: number;

  @ApiPropertyOptional({ enum: LedgerEntryType })
  @IsOptional()
  @IsEnum(LedgerEntryType)
  type?: LedgerEntryType;

  @ApiPropertyOptional({ example: '2024-01-01' })
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  to?: string;
}
