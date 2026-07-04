import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min, IsObject } from 'class-validator';
import { DisputeReason, DisputeStatus } from '../entities/dispute.entity';

export class CreateDisputeDto {
  @ApiProperty({ example: 'REF-001' })
  @IsString()
  transactionReference: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiProperty({ enum: DisputeReason, example: 'unauthorized_charge' })
  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @ApiProperty({ example: 'Customer claims they did not authorize this transaction' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 5000.00 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ResolveDisputeDto {
  @ApiProperty({ enum: ['won', 'lost'], example: 'won' })
  @IsEnum(['won', 'lost'])
  status: 'won' | 'lost';

  @ApiPropertyOptional({ example: 'Evidence submitted by merchant proves transaction was authorized' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'merchant@example.com' })
  @IsOptional()
  @IsString()
  resolvedBy?: string;

  @ApiPropertyOptional({ description: 'Evidence documents' })
  @IsOptional()
  @IsObject()
  evidence?: Record<string, any>;
}

export class SubmitEvidenceDto {
  @ApiPropertyOptional({ example: 'https://evidence.example.com/receipt.pdf' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional({ example: 'https://evidence.example.com/shipping.pdf' })
  @IsOptional()
  @IsString()
  shippingProofUrl?: string;

  @ApiPropertyOptional({ example: 'Customer communication logs showing acknowledgment' })
  @IsOptional()
  @IsString()
  customerCommunication?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  additionalEvidence?: Record<string, any>;
}
