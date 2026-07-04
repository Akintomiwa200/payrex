import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../transactions/entities/transaction.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id', unique: true })
  @Index()
  merchantId: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  @ApiProperty({ example: 1500000.00, description: 'Available balance' })
  balance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0, name: 'pending_balance' })
  @ApiProperty({ example: 50000.00, description: 'Pending/unsettled balance' })
  pendingBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0, name: 'total_volume' })
  @ApiProperty({ description: 'Lifetime transaction volume' })
  totalVolume: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.NGN })
  @ApiProperty({ enum: Currency, example: 'NGN' })
  currency: Currency;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
