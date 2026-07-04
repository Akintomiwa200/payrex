import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly MAX_RETRIES = 5;
  private readonly BASE_DELAY_MS = 1000;

  constructor(
    @InjectRepository(WebhookEndpoint)
    private endpointRepo: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookEvent)
    private eventRepo: Repository<WebhookEvent>,
  ) {}

  async createEndpoint(merchantId: string, dto: CreateWebhookDto): Promise<any> {
    const endpoint = this.endpointRepo.create({
      merchantId,
      ...dto,
    });
    await this.endpointRepo.save(endpoint);
    return endpoint;
  }

  async listEndpoints(merchantId: string): Promise<any> {
    return this.endpointRepo.find({ where: { merchantId } });
  }

  async updateEndpoint(
    merchantId: string,
    endpointId: string,
    dto: Partial<CreateWebhookDto>,
  ): Promise<any> {
    const endpoint = await this.findEndpointOrFail(merchantId, endpointId);
    Object.assign(endpoint, dto);
    await this.endpointRepo.save(endpoint);
    return endpoint;
  }

  async deleteEndpoint(merchantId: string, endpointId: string): Promise<any> {
    const endpoint = await this.findEndpointOrFail(merchantId, endpointId);
    await this.endpointRepo.remove(endpoint);
    return { message: 'Webhook endpoint deleted' };
  }

  async dispatch(merchantId: string, event: string, payload: any): Promise<void> {
    const endpoints = await this.endpointRepo.find({
      where: { merchantId, isActive: true },
    });

    for (const endpoint of endpoints) {
      const matchesEvent =
        endpoint.events.includes(event) || endpoint.events.includes('*');
      if (!matchesEvent) continue;

      const secret = endpoint.secret || 'whsec_default';
      const signature = this.signPayload(payload, secret);

      const webhookEvent = this.eventRepo.create({
        endpointId: endpoint.id,
        event,
        payload: { event, data: payload },
        isDelivered: false,
        retryCount: 0,
      });
      await this.eventRepo.save(webhookEvent);

      this.deliverWithRetry(webhookEvent, endpoint, payload, signature);
    }
  }

  private async deliverWithRetry(
    webhookEvent: WebhookEvent,
    endpoint: WebhookEndpoint,
    payload: any,
    signature: string,
    attempt: number = 0,
  ): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutMs = 10000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': webhookEvent.event,
          'X-Webhook-Signature': signature,
          'X-Webhook-Delivery-Attempt': String(attempt + 1),
          'User-Agent': 'FinanceGateway/1.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      webhookEvent.response = {
        statusCode: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text().catch(() => ''),
      };

      if (response.ok) {
        webhookEvent.isDelivered = true;
        webhookEvent.deliveredAt = new Date();
        webhookEvent.retryCount = attempt;
        await this.eventRepo.save(webhookEvent);

        endpoint.lastSentAt = new Date();
        endpoint.failureCount = 0;
        await this.endpointRepo.save(endpoint);

        this.logger.log(`Webhook delivered: ${webhookEvent.event} -> ${endpoint.url}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      webhookEvent.retryCount = attempt + 1;
      webhookEvent.response = {
        ...(webhookEvent.response || {}),
        error: error.message,
        attempt,
      };
      await this.eventRepo.save(webhookEvent);

      if (attempt < this.MAX_RETRIES - 1) {
        const delay = this.BASE_DELAY_MS * Math.pow(2, attempt);
        const jitter = Math.random() * 1000;
        this.logger.warn(
          `Webhook delivery failed (attempt ${attempt + 1}/${this.MAX_RETRIES}), ` +
          `retrying in ${delay + jitter}ms: ${endpoint.url} - ${error.message}`,
        );

        setTimeout(
          () => this.deliverWithRetry(webhookEvent, endpoint, payload, signature, attempt + 1),
          delay + jitter,
        );
      } else {
        webhookEvent.isDelivered = false;
        await this.eventRepo.save(webhookEvent);

        endpoint.failureCount = (endpoint.failureCount || 0) + 1;
        if (endpoint.failureCount >= 10) {
          endpoint.isActive = false;
          this.logger.warn(`Webhook endpoint deactivated after ${endpoint.failureCount} failures: ${endpoint.url}`);
        }
        await this.endpointRepo.save(endpoint);

        this.logger.error(
          `Webhook delivery failed after ${this.MAX_RETRIES} attempts: ${endpoint.url} - ${error.message}`,
        );
      }
    }
  }

  async retryEvent(merchantId: string, eventId: string): Promise<any> {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: { endpoint: true },
    });

    if (!event || event.endpoint.merchantId !== merchantId) {
      throw new HttpException('Webhook event not found', HttpStatus.NOT_FOUND);
    }

    event.retryCount = 0;
    event.isDelivered = false;
    event.response = undefined as any;
    await this.eventRepo.save(event);

    const secret = event.endpoint.secret || 'whsec_default';
    const signature = this.signPayload(event.payload, secret);

    this.deliverWithRetry(event, event.endpoint, event.payload, signature);
    return { message: 'Webhook event queued for retry' };
  }

  async listEvents(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const endpoints = await this.endpointRepo.find({
      where: { merchantId },
      select: { id: true },
    });
    const endpointIds = endpoints.map((e) => e.id);

    if (endpointIds.length === 0) {
      return { data: [], meta: { page, perPage, total: 0, totalPages: 0 } };
    }

    const where: any = {};
    if (query.event) where.event = query.event;
    if (query.isDelivered !== undefined) where.isDelivered = query.isDelivered === 'true';

    const [events, total] = await this.eventRepo.findAndCount({
      where: { endpointId: { $in: endpointIds } as any, ...where },
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
    });

    return {
      data: events,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    const computed = crypto.createHmac('sha512', secret).update(payload).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  private signPayload(payload: any, secret: string): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(raw).digest('hex');
  }

  private async findEndpointOrFail(
    merchantId: string,
    endpointId: string,
  ): Promise<WebhookEndpoint> {
    const endpoint = await this.endpointRepo.findOne({
      where: { id: endpointId, merchantId },
    });
    if (!endpoint) {
      throw new HttpException('Webhook endpoint not found', HttpStatus.NOT_FOUND);
    }
    return endpoint;
  }
}
