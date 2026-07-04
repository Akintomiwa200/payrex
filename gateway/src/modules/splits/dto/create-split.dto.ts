import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { SplitType } from '../entities/split-payment.entity';

export class SplitRecipientDto {
  @ApiProperty({ example: 'RCP_abc123' })
  @IsString()
  recipientCode: string;

  @ApiPropertyOptional({ example: 70.00, description: 'Percentage (for percentage splits)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number;

  @ApiPropertyOptional({ example: 3500.00, description: 'Flat amount (for flat splits)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  flatAmount?: number;
}

export class CreateSplitDto {
  @ApiProperty({ enum: SplitType, example: 'percentage' })
  @IsEnum(SplitType)
  type: SplitType;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ type: [SplitRecipientDto], description: 'List of recipients' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitRecipientDto)
  recipients: SplitRecipientDto[];

  @ApiPropertyOptional({ example: { orderId: 'ORD-123' } })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class InitializeSplitTransactionDto {
  @ApiProperty({ example: 'SPL_abc123' })
  @IsString()
  splitCode: string;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}
