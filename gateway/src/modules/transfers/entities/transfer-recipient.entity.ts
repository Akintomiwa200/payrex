import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('transfer_recipients')
export class TransferRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'recipient_code', unique: true })
  @ApiProperty({ example: 'RCP_abc123' })
  recipientCode: string;

  @Column({ name: 'bank_code' })
  bankCode: string;

  @Column({ name: 'bank_name' })
  @ApiProperty({ example: 'GTBank' })
  bankName: string;

  @Column({ name: 'account_number' })
  accountNumber: string;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
