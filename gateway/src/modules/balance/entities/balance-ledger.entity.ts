import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../transactions/entities/transaction.entity';

export enum LedgerEntryType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  REVERSAL = 'reversal',
  FEE = 'fee',
  SETTLEMENT = 'settlement',
  REFUND = 'refund',
}

@Entity('balance_ledger')
export class BalanceLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'transaction_reference', nullable: true })
  @Index()
  transactionReference?: string;

  @Column({
    type: 'enum',
    enum: LedgerEntryType,
  })
  @ApiProperty({ enum: LedgerEntryType, example: 'credit' })
  type: LedgerEntryType;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  @ApiProperty({ example: 5000.00 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, name: 'balance_before' })
  @ApiProperty({ description: 'Balance before this entry' })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, name: 'balance_after' })
  @ApiProperty({ description: 'Balance after this entry' })
  balanceAfter: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.NGN })
  currency: Currency;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
