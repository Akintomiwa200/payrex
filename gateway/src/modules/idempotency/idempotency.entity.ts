import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'idempotency_key', unique: true })
  @Index()
  key: string;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column({ type: 'jsonb' })
  requestBody: Record<string, any>;

  @Column({ type: 'jsonb' })
  responseBody: Record<string, any>;

  @Column()
  statusCode: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at' })
  expiresAt: Date;
}
