import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  API_CALL = 'api_call',
  PAYMENT = 'payment',
  REFUND = 'refund',
  TRANSFER = 'transfer',
  KYC_UPDATE = 'kyc_update',
  COMPLIANCE_CHECK = 'compliance_check',
  SETTLEMENT = 'settlement',
  WEBHOOK_SEND = 'webhook_send',
  EXPORT = 'export',
  SETTINGS_CHANGE = 'settings_change',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id', nullable: true })
  @Index()
  merchantId?: string;

  @Column({ name: 'api_key_id', nullable: true })
  apiKeyId?: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditSeverity, default: AuditSeverity.LOW })
  severity: AuditSeverity;

  @Column()
  resource: string;

  @Column({ name: 'resource_id', nullable: true })
  resourceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  changes?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true, name: 'request_path' })
  requestPath?: string;

  @Column({ nullable: true })
  duration?: number;

  @Column({ default: true })
  success: boolean;

  @Column({ nullable: true, type: 'text' })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
