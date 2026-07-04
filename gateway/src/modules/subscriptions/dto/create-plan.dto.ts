import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, Min } from 'class-validator';
import { PlanInterval } from '../entities/subscription-plan.entity';

export class CreatePlanDto {
  @ApiProperty({ example: 'Monthly Pro' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Premium monthly subscription' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 29900.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: PlanInterval, example: 'monthly' })
  @IsEnum(PlanInterval)
  interval: PlanInterval;

  @ApiPropertyOptional({
    example: { trialDays: 7, maxCycles: 12 },
  })
  @IsOptional()
  @IsObject()
  billingConfig?: Record<string, any>;
}

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'cus_abc123' })
  @IsString()
  customer: string;

  @ApiProperty({ example: 'plan_abc123' })
  @IsString()
  plan: string;

  @ApiPropertyOptional({ example: { promoCode: 'WELCOME20' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
