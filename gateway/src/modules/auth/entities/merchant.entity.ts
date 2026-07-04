import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ApiKey } from './api-key.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'm_abc123...', description: 'Merchant ID' })
  id: string;

  @Column()
  @ApiProperty({ example: 'Acme Corp', description: 'Business name' })
  businessName: string;

  @Column({ unique: true })
  @ApiProperty({ example: 'admin@acme.com' })
  email: string;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @OneToMany(() => ApiKey, (key) => key.merchant)
  apiKeys: ApiKey[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
