import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiKey } from './entities/api-key.entity';
import { Merchant } from './entities/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, Merchant])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
