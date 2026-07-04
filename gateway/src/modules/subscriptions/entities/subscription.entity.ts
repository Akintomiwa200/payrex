import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'sub_abc123...' })
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'plan_id' })
  planId: string;

  @Column({ name: 'subscription_code', unique: true })
  @ApiProperty({ example: 'SUB_abc123' })
  subscriptionCode: string;

  @Column({ name: 'transaction_reference', unique: true })
  transactionReference: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  @ApiProperty({ enum: SubscriptionStatus, example: 'active' })
  status: SubscriptionStatus;

  @Column({ name: 'next_charge_date' })
  nextChargeDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate?: Date;

  @Column({ default: 0, name: 'charge_count' })
  chargeCount: number;

  @Column({ nullable: true, name: 'cancelled_at' })
  cancelledAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne('SubscriptionPlan')
  @JoinColumn({ name: 'plan_id' })
  plan: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
