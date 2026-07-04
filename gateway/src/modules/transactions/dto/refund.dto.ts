import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class RefundTransactionDto {
  @ApiProperty({ example: 'REF-001', description: 'Original transaction reference' })
  @IsString()
  reference: string;

  @ApiPropertyOptional({ example: 5000.00, description: 'Partial refund amount (refund all if omitted)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({ example: 'Customer requested refund' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RefundResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 'Refund processed' })
  message: string;

  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    refundedAt: Date;
  };
}
