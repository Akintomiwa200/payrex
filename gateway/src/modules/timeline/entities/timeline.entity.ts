import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TimelineEventType {
  CREATED = 'created',
  INITIALIZED = 'initialized',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  REFUND_PENDING = 'refund_pending',
  DISPUTE_OPENED = 'dispute_opened',
  DISPUTE_RESOLVED = 'dispute_resolved',
  WEBHOOK_SENT = 'webhook_sent',
  WEBHOOK_DELIVERED = 'webhook_delivered',
  WEBHOOK_FAILED = 'webhook_failed',
  PAYOUT_INITIATED = 'payout_initiated',
  PAYOUT_COMPLETED = 'payout_completed',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  CARD_ADDED = 'card_added',
  CARD_REMOVED = 'card_removed',
}

@Entity('transaction_timeline')
export class TransactionTimeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'reference' })
  @Index()
  @ApiProperty({ example: 'REF-001', description: 'Transaction or resource reference' })
  reference: string;

  @Column({ name: 'event_type' })
  @ApiProperty({ enum: TimelineEventType, example: 'success' })
  eventType: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Event-specific data payload' })
  data?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ required: false, description: 'Human-readable description' })
  description?: string;

  @Column({ nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt: Date;
}
