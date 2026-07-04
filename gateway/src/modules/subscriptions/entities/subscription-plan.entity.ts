import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PlanInterval {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'plan_abc123...' })
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'plan_code', unique: true })
  @ApiProperty({ example: 'PLN_monthly_pro' })
  planCode: string;

  @Column()
  @ApiProperty({ example: 'Monthly Pro' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  @ApiProperty({ example: 29900.00 })
  amount: number;

  @Column({ type: 'enum', enum: PlanInterval })
  @ApiProperty({ enum: PlanInterval, example: 'monthly' })
  interval: PlanInterval;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ required: false, description: 'Billing cycles and trial config' })
  billingConfig?: Record<string, any>;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
