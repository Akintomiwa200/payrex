import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ThreeDSStatus {
  INITIATED = 'initiated',
  CHALLENGE_REQUIRED = 'challenge_required',
  CHALLENGE_COMPLETE = 'challenge_complete',
  AUTHENTICATED = 'authenticated',
  FAILED = 'failed',
  DECLINED = 'declined',
  ERROR = 'error',
}

export enum ThreeDSVersion {
  V1 = '1.0',
  V2 = '2.0',
  V2_1 = '2.1',
  V2_2 = '2.2',
}

@Entity('threeds_authentications')
export class ThreeDSAuthentication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'transaction_reference', unique: true })
  @Index()
  @ApiProperty({ example: 'REF-001' })
  transactionReference: string;

  @Column({ name: 'threeds_server_transaction_id', unique: true })
  @ApiProperty({ example: '3ds-abc123...' })
  threeDSServerTransId: string;

  @Column({ type: 'enum', enum: ThreeDSVersion, default: ThreeDSVersion.V2 })
  @ApiProperty({ enum: ThreeDSVersion, example: '2.0' })
  version: ThreeDSVersion;

  @Column({ type: 'enum', enum: ThreeDSStatus, default: ThreeDSStatus.INITIATED })
  @ApiProperty({ enum: ThreeDSStatus, example: 'authenticated' })
  status: ThreeDSStatus;

  @Column({ type: 'jsonb', nullable: true, name: 'authentication_data' })
  @ApiProperty({ description: 'Full 3DS authentication response from ACS' })
  authenticationData?: Record<string, any>;

  @Column({ nullable: true, name: 'acs_url' })
  @ApiProperty({ description: 'ACS challenge URL for browser redirect', required: false })
  acsUrl?: string;

  @Column({ nullable: true, name: 'acs_reference_number' })
  acsReferenceNumber?: string;

  @Column({ nullable: true, name: 'acs_signed_content' })
  acsSignedContent?: string;

  @Column({ nullable: true, name: 'authentication_value' })
  authenticationValue?: string;

  @Column({ nullable: true, name: 'ds_transaction_id' })
  dsTransactionId?: string;

  @Column({ nullable: true, name: 'eci' })
  @ApiProperty({ description: 'Electronic Commerce Indicator', example: '05' })
  eci?: string;

  @Column({ nullable: true, name: 'xid' })
  xid?: string;

  @Column({ nullable: true, name: 'cavv' })
  @ApiProperty({ description: 'Cardholder Authentication Verification Value' })
  cavv?: string;

  @Column({ nullable: true, name: 'status_reason' })
  statusReason?: string;

  @Column({ nullable: true, name: 'authenticated_at' })
  authenticatedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
