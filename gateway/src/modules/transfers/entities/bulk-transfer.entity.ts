import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum BulkTransferStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PARTIALLY_COMPLETED = 'partially_completed',
  FAILED = 'failed',
}

@Entity('bulk_transfers')
export class BulkTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'batch_code', unique: true })
  @ApiProperty({ example: 'BAT_abc123' })
  batchCode: string;

  @Column({ type: 'simple-json' })
  @ApiProperty({ description: 'Array of transfer references in this batch' })
  transferReferences: string[];

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  totalAmount: number;

  @Column({ default: 0, name: 'success_count' })
  successCount: number;

  @Column({ default: 0, name: 'failed_count' })
  failedCount: number;

  @Column({
    type: 'enum',
    enum: BulkTransferStatus,
    default: BulkTransferStatus.PENDING,
  })
  @ApiProperty({ enum: BulkTransferStatus })
  status: BulkTransferStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
