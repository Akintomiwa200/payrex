import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WebhookEvent } from './webhook-event.entity';

@Entity('webhook_endpoints')
export class WebhookEndpoint {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'wh_abc123...' })
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column()
  @ApiProperty({ example: 'https://api.myapp.com/webhooks/payments' })
  url: string;

  @Column({ type: 'simple-array' })
  @ApiProperty({ example: ['charge.success', 'charge.failed', 'transfer.success'], description: 'Subscribed events' })
  events: string[];

  @Column({ nullable: true })
  @ApiProperty({ example: 'sk_test_xxx', required: false, description: 'Optional secret for signature verification' })
  secret?: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: 0, name: 'failure_count' })
  failureCount: number;

  @Column({ nullable: true, name: 'last_sent_at' })
  lastSentAt?: Date;

  @OneToMany(() => WebhookEvent, (event) => event.endpoint)
  events_log: WebhookEvent[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
