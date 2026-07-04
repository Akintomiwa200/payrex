import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsObject } from 'class-validator';

export class TokenizeCardDto {
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

  @ApiPropertyOptional({ example: 'cus_abc123' })
  @IsOptional()
  @IsString()
  customerId?: string;
}

export class ChargeTokenDto {
  @ApiProperty({ example: 'tok_abc123...' })
  @IsString()
  token: string;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
