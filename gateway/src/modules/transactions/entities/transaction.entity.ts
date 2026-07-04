import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionStatus {
  PENDING = 'pending',
  INITIALIZED = 'initialized',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REVERSED = 'reversed',
  REFUNDED = 'refunded',
}

export enum PaymentChannel {
  CARD = 'card',
  USSD = 'ussd',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  QR = 'qr',
  DIRECT_DEBIT = 'direct_debit',
}

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
  KES = 'KES',
  GHS = 'GHS',
  ZAR = 'ZAR',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'txn_abc123...' })
  id: string;

  @Column({ unique: true })
  @Index()
  @ApiProperty({ example: 'REF-001', description: 'Unique transaction reference' })
  reference: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId?: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  @ApiProperty({ example: 5000.00, description: 'Transaction amount' })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  @ApiProperty({ example: 0, description: 'Amount charged (after fees)' })
  amountCharged: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  @ApiProperty({ example: 0, description: 'Processing fee' })
  fee: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.NGN })
  @ApiProperty({ enum: Currency, example: 'NGN' })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @Index()
  @ApiProperty({ enum: TransactionStatus, example: 'success' })
  status: TransactionStatus;

  @Column({ type: 'enum', enum: PaymentChannel, nullable: true })
  @ApiProperty({ enum: PaymentChannel, example: 'card', required: false })
  channel?: PaymentChannel;

  @Column({ nullable: true })
  @ApiProperty({ example: 'visa', required: false })
  cardType?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: '408408******4081', required: false })
  last4?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: '506104', required: false })
  bankCode?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'GTBank', required: false })
  bankName?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'ussd_code', required: false })
  ussdCode?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'https://pay.url/ref-001', required: false })
  authorizationUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({
    example: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' },
    required: false,
  })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ required: false, description: 'Raw gateway response' })
  gatewayResponse?: Record<string, any>;

  @Column({ name: 'paid_at', nullable: true })
  paidAt?: Date;

  @Column({ name: 'refunded_at', nullable: true })
  refundedAt?: Date;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ required: false, description: 'Failure reason if applicable' })
  failureReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
