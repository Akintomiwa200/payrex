import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TokenType {
  CARD = 'card',
  BANK = 'bank',
}

@Entity('payment_tokens')
export class PaymentToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId?: string;

  @Column({ name: 'token', unique: true })
  @ApiProperty({ example: 'tok_abc123...' })
  token: string;

  @Column({ type: 'enum', enum: TokenType })
  @ApiProperty({ enum: TokenType, example: 'card' })
  type: TokenType;

  @Column({ nullable: true, name: 'card_type' })
  @ApiProperty({ example: 'visa', required: false })
  cardType?: string;

  @Column({ nullable: true, name: 'last4' })
  @ApiProperty({ example: '4081', required: false })
  last4?: string;

  @Column({ nullable: true, name: 'exp_month' })
  expMonth?: string;

  @Column({ nullable: true, name: 'exp_year' })
  expYear?: string;

  @Column({ nullable: true, name: 'bank_name' })
  bankName?: string;

  @Column({ nullable: true, name: 'account_number' })
  accountNumber?: string;

  @Column({ nullable: true, name: 'auth_code' })
  authCode?: string;

  @Column({ nullable: true })
  signature?: string;

  @Column({ default: true, name: 'is_reusable' })
  isReusable: boolean;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ nullable: true, name: 'used_at' })
  usedAt?: Date;

  @Column({ nullable: true, name: 'expires_at' })
  expiresAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
