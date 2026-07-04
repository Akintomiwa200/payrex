import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  WON = 'won',
  LOST = 'lost',
}

export enum DisputeReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  PRODUCT_NOT_RECEIVED = 'product_not_received',
  PRODUCT_UNSATISFACTORY = 'product_unsatisfactory',
  REFUND_NOT_PROCESSED = 'refund_not_processed',
  UNAUTHORIZED_CHARGE = 'unauthorized_charge',
  OTHER = 'other',
}

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'transaction_reference' })
  @Index()
  transactionReference: string;

  @Column({ name: 'customer_email', nullable: true })
  customerEmail?: string;

  @Column({ name: 'dispute_code', unique: true })
  @ApiProperty({ example: 'DIS_abc123' })
  disputeCode: string;

  @Column({ type: 'enum', enum: DisputeReason })
  @ApiProperty({ enum: DisputeReason, example: 'unauthorized_charge' })
  reason: DisputeReason;

  @Column({ type: 'text' })
  @ApiProperty({ example: 'Customer claims they did not authorize this payment' })
  description: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  @ApiProperty({ example: 5000.00 })
  amount: number;

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
  @ApiProperty({ enum: DisputeStatus, example: 'open' })
  status: DisputeStatus;

  @Column({ type: 'jsonb', nullable: true })
  evidence?: Record<string, any>;

  @Column({ nullable: true, name: 'resolved_at' })
  resolvedAt?: Date;

  @Column({ nullable: true, name: 'resolved_by' })
  resolvedBy?: string;

  @Column({ nullable: true, type: 'text', name: 'resolution_note' })
  resolutionNote?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
