import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SplitRecipient } from './split-recipient.entity';

export enum SplitType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
  MIXED = 'mixed',
}

@Entity('split_payments')
export class SplitPayment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'spl_abc123...' })
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'split_code', unique: true })
  @ApiProperty({ example: 'SPL_abc123' })
  splitCode: string;

  @Column({ name: 'transaction_reference', nullable: true })
  transactionReference?: string;

  @Column({ type: 'enum', enum: SplitType })
  @ApiProperty({ enum: SplitType, example: 'percentage' })
  type: SplitType;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  @ApiProperty({ example: 5000.00, description: 'Total amount split' })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  @ApiProperty({ example: 0, description: 'Platform/processor fee' })
  commission: number;

  @Column({ name: 'is_processed', default: false })
  isProcessed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => SplitRecipient, (recipient) => recipient.splitPayment, { cascade: true })
  recipients: SplitRecipient[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
