import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../transactions/entities/transaction.entity';

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('settlements')
export class Settlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'settlement_code', unique: true })
  @ApiProperty({ example: 'SET_abc123' })
  settlementCode: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  @ApiProperty({ example: 500000.00 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  @ApiProperty({ description: 'Processing fee deducted' })
  fee: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0, name: 'net_amount' })
  @ApiProperty({ description: 'Amount after fees' })
  netAmount: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.NGN })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
  })
  @ApiProperty({ enum: SettlementStatus })
  status: SettlementStatus;

  @Column({ name: 'settlement_bank', nullable: true })
  settlementBank?: string;

  @Column({ name: 'settlement_account', nullable: true })
  settlementAccount?: string;

  @Column({ nullable: true, name: 'settled_at' })
  settledAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
