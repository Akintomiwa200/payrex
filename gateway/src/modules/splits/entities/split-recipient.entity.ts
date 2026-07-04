import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SplitPayment } from './split-payment.entity';

@Entity('split_recipients')
export class SplitRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'split_id' })
  splitId: string;

  @Column({ name: 'recipient_code' })
  @ApiProperty({ example: 'RCP_abc123' })
  recipientCode: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @ApiProperty({ example: 70.00, description: 'Percentage share (for percentage splits)' })
  percentage?: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  @ApiProperty({ example: 3500.00, description: 'Flat amount share (for flat splits)' })
  flatAmount?: number;

  @Column({ default: false, name: 'is_settled' })
  isSettled: boolean;

  @ManyToOne(() => SplitPayment, (split) => split.recipients)
  @JoinColumn({ name: 'split_id' })
  splitPayment: SplitPayment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
