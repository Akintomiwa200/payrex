import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { PaymentToken } from './entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentToken])],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokensModule {}
