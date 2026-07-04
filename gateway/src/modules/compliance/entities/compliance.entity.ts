import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ScreeningStatus {
  PENDING = 'pending',
  CLEAR = 'clear',
  FLAGGED = 'flagged',
  REVIEWED = 'reviewed',
  ESCALATED = 'escalated',
}

export enum SanctionList {
  UN = 'un_sanctions',
  OFAC = 'ofac_sdn',
  EU = 'eu_sanctions',
  UK = 'uk_sanctions',
  INTERPOL = 'interpol',
  LOCAL = 'local_blacklist',
  PEP = 'politically_exposed_persons',
}

@Entity('compliance_screenings')
export class ComplianceScreening {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'subject_type' })
  @ApiProperty({ enum: ['merchant', 'customer', 'director', 'signatory'], example: 'merchant' })
  subjectType: string;

  @Column({ name: 'subject_id' })
  @ApiProperty({ example: 'm_abc123' })
  subjectId: string;

  @Column({ name: 'subject_name', nullable: true })
  subjectName?: string;

  @Column({ name: 'subject_country', nullable: true })
  subjectCountry?: string;

  @Column({ type: 'jsonb', name: 'screened_lists' })
  @ApiProperty({ description: 'Lists this subject was screened against' })
  screenedLists: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'matches' })
  @ApiProperty({ description: 'Any matches found during screening' })
  matches?: Array<{
    list: string;
    matchType: string;
    matchName: string;
    confidence: number;
    details: string;
  }>;

  @Column({ type: 'enum', enum: ScreeningStatus, default: ScreeningStatus.PENDING })
  @ApiProperty({ enum: ScreeningStatus })
  status: ScreeningStatus;

  @Column({ default: 0, name: 'risk_score' })
  @ApiProperty({ description: 'Overall risk score 0-100' })
  riskScore: number;

  @Column({ nullable: true, name: 'reviewed_by' })
  reviewedBy?: string;

  @Column({ nullable: true, name: 'reviewed_at' })
  reviewedAt?: Date;

  @Column({ nullable: true, type: 'text', name: 'review_notes' })
  reviewNotes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('transaction_monitoring')
export class TransactionMonitoring {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'transaction_reference' })
  @Index()
  transactionReference: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ nullable: true, name: 'sender_name' })
  senderName?: string;

  @Column({ nullable: true, name: 'recipient_name' })
  recipientName?: string;

  @Column({ nullable: true, name: 'sender_country' })
  senderCountry?: string;

  @Column({ nullable: true, name: 'recipient_country' })
  recipientCountry?: string;

  @Column({ nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @Column({ nullable: true, name: 'device_fingerprint' })
  deviceFingerprint?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'risk_factors' })
  riskFactors?: Record<string, any>;

  @Column({ default: false, name: 'is_suspicious' })
  isSuspicious: boolean;

  @Column({ nullable: true, name: 'flagged_reason' })
  flaggedReason?: string;

  @Column({ default: false, name: 'requires_manual_review' })
  requiresManualReview: boolean;

  @Column({ default: false, name: 'is_reviewed' })
  isReviewed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
