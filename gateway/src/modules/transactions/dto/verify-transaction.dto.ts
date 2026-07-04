import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyTransactionDto {
  @ApiProperty({ example: 'REF-001' })
  @IsString()
  reference: string;
}

export class TransactionResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 'Transaction retrieved' })
  message: string;

  data: {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    channel: string;
    cardType?: string;
    last4?: string;
    fee: number;
    paidAt?: Date;
    customer?: any;
    metadata?: any;
    createdAt: Date;
  };
}
