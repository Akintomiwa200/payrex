import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNumber, IsOptional, IsEnum, IsObject, Min, IsIBAN, IsCreditCard, ValidateIf,
} from 'class-validator';
import { Currency, PaymentChannel } from '../entities/transaction.entity';

export class CardChargeDto {
  @ApiProperty({ example: 'REF-001' })
  @IsString()
  reference: string;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: Currency, example: 'NGN' })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ example: '4084084084084081' })
  @IsString()
  cardNumber: string;

  @ApiProperty({ example: '12' })
  @IsString()
  expMonth: string;

  @ApiProperty({ example: '25' })
  @IsString()
  expYear: string;

  @ApiProperty({ example: '123' })
  @IsString()
  cvv: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class BankTransferChargeDto {
  @ApiProperty({ example: 'REF-002' })
  @IsString()
  reference: string;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: Currency, example: 'NGN' })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UssdChargeDto {
  @ApiProperty({ example: 'REF-003' })
  @IsString()
  reference: string;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: Currency, example: 'NGN' })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '058', description: 'Bank code (e.g., 058 for GTBank)' })
  @IsString()
  bankCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
