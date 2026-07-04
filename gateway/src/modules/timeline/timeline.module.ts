import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { TransactionTimeline } from './entities/timeline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionTimeline])],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}
