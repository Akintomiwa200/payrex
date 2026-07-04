import { Controller, Post, Get, Param, Patch, Delete, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto, WebhookEventQueryDto } from './dto/create-webhook.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Webhooks')
@Controller({ path: 'webhooks', version: '1' })
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('endpoints')
  @ApiSecurity('ApiKey')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a webhook endpoint',
    description: 'Register a URL to receive webhook events. Specify which events you want to receive. The gateway will send POST requests to this URL with event payloads.',
  })
  @ApiResponse({ status: 201, description: 'Webhook endpoint created' })
  async createEndpoint(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CreateWebhookDto,
  ) {
    const data = await this.webhookService.createEndpoint(merchantId, dto);
    return { status: true, message: 'Webhook endpoint created', data };
  }

  @Get('endpoints')
  @ApiSecurity('ApiKey')
  @ApiOperation({ summary: 'List webhook endpoints', description: 'Retrieve all registered webhook endpoints.' })
  async listEndpoints(@CurrentMerchant('id') merchantId: string) {
    const data = await this.webhookService.listEndpoints(merchantId);
    return { status: true, message: 'Webhook endpoints retrieved', data };
  }

  @Patch('endpoints/:id')
  @ApiSecurity('ApiKey')
  @ApiOperation({ summary: 'Update webhook endpoint', description: 'Update the URL or subscribed events for a webhook endpoint.' })
  async updateEndpoint(
    @CurrentMerchant('id') merchantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateWebhookDto>,
  ) {
    const data = await this.webhookService.updateEndpoint(merchantId, id, dto);
    return { status: true, message: 'Webhook endpoint updated', data };
  }

  @Delete('endpoints/:id')
  @ApiSecurity('ApiKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete webhook endpoint', description: 'Remove a webhook endpoint. No further events will be sent.' })
  async deleteEndpoint(
    @CurrentMerchant('id') merchantId: string,
    @Param('id') id: string,
  ) {
    const data = await this.webhookService.deleteEndpoint(merchantId, id);
    return { status: true, message: 'Webhook endpoint deleted', data };
  }

  @Get('events')
  @ApiSecurity('ApiKey')
  @ApiOperation({ summary: 'List webhook events', description: 'Retrieve a paginated log of all webhook events sent.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  @ApiQuery({ name: 'event', required: false, example: 'charge.success' })
  @ApiQuery({ name: 'isDelivered', required: false, example: 'true' })
  async listEvents(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: WebhookEventQueryDto,
  ) {
    return this.webhookService.listEvents(merchantId, query);
  }

  @Post('events/:id/retry')
  @ApiSecurity('ApiKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry webhook event',
    description: 'Manually retry a failed webhook delivery. The event will be resent with exponential backoff.',
  })
  @ApiResponse({ status: 200, description: 'Webhook queued for retry' })
  async retryEvent(
    @CurrentMerchant('id') merchantId: string,
    @Param('id') eventId: string,
  ) {
    return this.webhookService.retryEvent(merchantId, eventId);
  }
}
