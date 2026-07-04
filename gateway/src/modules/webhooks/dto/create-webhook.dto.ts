import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({ example: 'https://api.myapp.com/webhooks/payments' })
  @IsUrl({ require_tld: false })
  url: string;

  @ApiProperty({
    example: ['charge.success', 'charge.failed', 'transfer.success'],
    description: 'Array of event types to subscribe to',
  })
  @IsArray()
  @IsString({ each: true })
  events: string[];

  @ApiPropertyOptional({ example: 'whsec_abc123', description: 'Secret for HMAC signature verification' })
  @IsOptional()
  @IsString()
  secret?: string;
}

export class WebhookEventQueryDto {
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 50 })
  perPage?: number;

  @ApiPropertyOptional({ example: 'charge.success' })
  event?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  to?: string;
}
