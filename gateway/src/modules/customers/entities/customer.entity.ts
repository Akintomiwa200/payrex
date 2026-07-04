import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'cus_abc123...' })
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ unique: true, name: 'customer_code' })
  @ApiProperty({ example: 'CUS_abc123', description: 'Unique customer code' })
  customerCode: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'john@example.com', required: false })
  email?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'John Doe', required: false })
  firstName?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Doe', required: false })
  lastName?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: '+2348123456789', required: false })
  phone?: string;

  @Column({ nullable: true, type: 'text' })
  @ApiProperty({ required: false })
  address?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Lagos', required: false })
  city?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'NG', required: false })
  country?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ required: false, description: 'Custom metadata' })
  metadata?: Record<string, any>;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
