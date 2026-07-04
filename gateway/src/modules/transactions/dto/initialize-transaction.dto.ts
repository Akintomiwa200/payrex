import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNumber, IsOptional, IsEnum, IsObject, Min,
} from 'class-validator';
import { Currency, PaymentChannel } from '../entities/transaction.entity';

export class InitializeTransactionDto {
  @ApiProperty({ example: 5000.00, description: 'Amount in kobo/smallest unit' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ enum: Currency, example: 'NGN' })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  email: string;

  @ApiPropertyOptional({ example: 'CUS_abc123', description: 'Your customer reference' })
  @IsOptional()
  @IsString()
  customerCode?: string;

  @ApiPropertyOptional({ example: 'Payment for Invoice #1234' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://myapp.com/callback' })
  @IsOptional()
  @IsString()
  callbackUrl?: string;

  @ApiPropertyOptional({ enum: PaymentChannel, description: 'Preferred payment channel' })
  @IsOptional()
  @IsEnum(PaymentChannel)
  channel?: PaymentChannel;

  @ApiPropertyOptional({
    example: { invoiceId: 'INV-1234', customerName: 'John Doe' },
    description: 'Custom metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class InitializeTransactionResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 'Authorization URL created' })
  message: string;

  @ApiProperty({
    example: {
      reference: 'REF-001',
      authorizationUrl: 'https://api.finance-gateway.dev/pay/REF-001',
      accessCode: 'ac_abc123',
    },
  })
  data: {
    reference: string;
    authorizationUrl: string;
    accessCode?: string;
  };
}
