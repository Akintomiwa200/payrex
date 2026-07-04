import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdempotencyKey } from './idempotency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IdempotencyKey])],
  exports: [TypeOrmModule],
})
export class IdempotencyModule {}
