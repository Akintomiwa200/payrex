import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WebhookEndpoint } from './webhook-endpoint.entity';

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'endpoint_id' })
  endpointId: string;

  @Column()
  @ApiProperty({ example: 'charge.success' })
  event: string;

  @Column({ type: 'jsonb' })
  @ApiProperty({ description: 'Event payload' })
  payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'HTTP response from the endpoint', required: false })
  response?: Record<string, any>;

  @Column({ default: false, name: 'is_delivered' })
  isDelivered: boolean;

  @Column({ default: 0, name: 'retry_count' })
  retryCount: number;

  @Column({ nullable: true, name: 'delivered_at' })
  deliveredAt?: Date;

  @ManyToOne(() => WebhookEndpoint, (ep) => ep.events_log)
  @JoinColumn({ name: 'endpoint_id' })
  endpoint: WebhookEndpoint;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
