import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'a1b2c3d4-...', description: 'Unique identifier' })
  id: string;

  @Column({ name: 'merchant_id', nullable: true })
  merchantId?: string;

  @Column({ unique: true })
  @ApiProperty({ example: 'sk_live_abc123...', description: 'The API key value' })
  key: string;

  @Column()
  @ApiProperty({ example: 'Production Key', description: 'Human-readable label' })
  label: string;

  @Column({ name: 'key_type', default: 'test' })
  @ApiProperty({ enum: ['test', 'live'], example: 'test', description: 'Key environment' })
  keyType: string;

  @Column({ name: 'is_active', default: true })
  @ApiProperty({ description: 'Whether the key is active' })
  isActive: boolean;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @ManyToOne('Merchant', 'apiKeys')
  @JoinColumn({ name: 'merchant_id' })
  merchant: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
