import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TransferStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ unique: true })
  @Index()
  @ApiProperty({ example: 'TRF-001' })
  reference: string;

  @Column({ nullable: true, name: 'recipient_code' })
  recipientCode?: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  @ApiProperty({ example: 50000.00 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  fee: number;

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.PENDING })
  @ApiProperty({ enum: TransferStatus, example: 'success' })
  status: TransferStatus;

  @Column({ name: 'bank_code', nullable: true })
  bankCode?: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName?: string;

  @Column({ name: 'account_number', nullable: true })
  accountNumber?: string;

  @Column({ name: 'account_name', nullable: true })
  accountName?: string;

  @Column({ nullable: true })
  narration?: string;

  @Column({ nullable: true, name: 'processor_reference' })
  processorReference?: string;

  @Column({ nullable: true, name: 'failed_reason' })
  failedReason?: string;

  @Column({ nullable: true, name: 'processed_at' })
  processedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
