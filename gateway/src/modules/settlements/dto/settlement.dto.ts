import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class InitiateSettlementDto {
  @ApiProperty({ example: 'GTBank' })
  bank: string;

  @ApiProperty({ example: '0123456789' })
  accountNumber: string;

  @ApiProperty({ example: 'John Doe' })
  accountName: string;

  @ApiPropertyOptional({ description: 'Amount to settle (null = full balance)' })
  amount?: number;
}

export class SettlementQueryDto {
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 50 })
  perPage?: number;

  @ApiPropertyOptional({ enum: ['pending', 'processing', 'completed', 'failed'] })
  status?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  to?: string;
}
