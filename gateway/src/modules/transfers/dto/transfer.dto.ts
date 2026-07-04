import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipientDto {
  @ApiProperty({ example: '058' })
  @IsString()
  bankCode: string;

  @ApiProperty({ example: 'GTBank' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  accountName: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Salary payments' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class InitiateTransferDto {
  @ApiProperty({ example: 'RCP_abc123' })
  @IsString()
  recipient: string;

  @ApiProperty({ example: 50000.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Payment for services' })
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

class BulkTransferItem {
  @ApiProperty({ example: 'RCP_abc123' })
  @IsString()
  recipient: string;

  @ApiProperty({ example: 50000.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Payment for invoice #123' })
  @IsOptional()
  @IsString()
  narration?: string;
}

export class InitiateBulkTransferDto {
  @ApiProperty({ type: [BulkTransferItem], description: 'List of transfers to process' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkTransferItem)
  transfers: BulkTransferItem[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
