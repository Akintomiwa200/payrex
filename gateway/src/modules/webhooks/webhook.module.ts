import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookEvent } from './entities/webhook-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEndpoint, WebhookEvent])],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhooksModule {}
