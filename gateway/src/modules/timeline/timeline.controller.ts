import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Transaction Timeline')
@ApiSecurity('ApiKey')
@Controller({ path: 'timeline', version: '1' })
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get(':reference')
  @ApiOperation({
    summary: 'Get transaction timeline',
    description: 'Retrieve the complete event history for a transaction. This shows every state change from creation to completion, including webhook delivery attempts and dispute events.',
  })
  async getTimeline(
    @CurrentMerchant('id') merchantId: string,
    @Param('reference') reference: string,
  ) {
    const data = await this.timelineService.getTimeline(merchantId, reference);
    return { status: true, message: 'Timeline retrieved', data };
  }

  @Get()
  @ApiOperation({ summary: 'List timeline events', description: 'Paginated list of all timeline events.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  @ApiQuery({ name: 'reference', required: false, description: 'Filter by transaction reference' })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filter by event type' })
  async list(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: any,
  ) {
    return this.timelineService.list(merchantId, query);
  }
}
