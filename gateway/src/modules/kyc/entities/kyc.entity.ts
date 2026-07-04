import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum KYCDocumentType {
  INTERNATIONAL_PASSPORT = 'international_passport',
  NATIONAL_ID = 'national_id',
  DRIVERS_LICENSE = 'drivers_license',
  VOTERS_CARD = 'voters_card',
  BVN = 'bvn',
  NIN = 'nin',
  CAC = 'cac_registration',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  TAX_CERTIFICATE = 'tax_certificate',
}

export enum KYCVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export enum KYCLevel {
  LEVEL_0 = 0,
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
}

@Entity('kyc_records')
export class KYCRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId?: string;

  @Column({ type: 'enum', enum: KYCDocumentType })
  @ApiProperty({ enum: KYCDocumentType })
  documentType: KYCDocumentType;

  @Column({ name: 'document_number', nullable: true })
  @ApiProperty({ example: 'A12345678', description: 'Document identifier (e.g., BVN number, passport number)' })
  documentNumber?: string;

  @Column({ name: 'document_url', nullable: true })
  @ApiProperty({ description: 'URL or path to uploaded document image' })
  documentUrl?: string;

  @Column({ name: 'document_data', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Extracted data from document (name, DOB, etc.)' })
  documentData?: Record<string, any>;

  @Column({ type: 'enum', enum: KYCVerificationStatus, default: KYCVerificationStatus.UNVERIFIED })
  @ApiProperty({ enum: KYCVerificationStatus, example: 'verified' })
  status: KYCVerificationStatus;

  @Column({ type: 'enum', enum: KYCLevel, default: KYCLevel.LEVEL_0 })
  @ApiProperty({ enum: KYCLevel, example: 2 })
  kycLevel: KYCLevel;

  @Column({ nullable: true, name: 'verified_at' })
  verifiedAt?: Date;

  @Column({ nullable: true, name: 'expires_at' })
  expiresAt?: Date;

  @Column({ nullable: true, name: 'verification_provider' })
  @ApiProperty({ example: 'dojah', description: 'Third-party verification service used' })
  verificationProvider?: string;

  @Column({ nullable: true, name: 'verification_reference' })
  verificationReference?: string;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('bvn_records')
export class BVNRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'bvn', unique: true })
  @ApiProperty({ example: '22222222222' })
  bvn: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'date_of_birth', nullable: true })
  dateOfBirth?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true, name: 'middle_name' })
  middleName?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true, name: 'photo_url' })
  photoUrl?: string;

  @Column({ nullable: true, name: 'email' })
  email?: string;

  @Column({ nullable: true, name: 'address' })
  address?: string;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ nullable: true, name: 'verified_at' })
  verifiedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  rawResponse?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
