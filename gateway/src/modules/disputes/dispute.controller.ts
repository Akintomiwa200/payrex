import { Controller, Post, Get, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto, ResolveDisputeDto, SubmitEvidenceDto } from './dto/dispute.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Disputes')
@ApiSecurity('ApiKey')
@Controller({ path: 'disputes', version: '1' })
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a dispute',
    description: 'Open a dispute/chargeback against a transaction. This is typically used when a customer claims a transaction was unauthorized or unsatisfactory.',
  })
  @ApiResponse({ status: 201, description: 'Dispute created' })
  async create(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CreateDisputeDto,
  ) {
    const data = await this.disputeService.create(merchantId, dto);
    return { status: true, message: 'Dispute created', data };
  }

  @Get()
  @ApiOperation({ summary: 'List disputes', description: 'Retrieve all disputes with filtering and pagination.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'under_review', 'resolved', 'won', 'lost'] })
  @ApiQuery({ name: 'transactionReference', required: false })
  async list(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: any,
  ) {
    return this.disputeService.list(merchantId, query);
  }

  @Post(':disputeCode/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resolve a dispute',
    description: 'Resolve a dispute with outcome (won/lost). Include evidence to support your case.',
  })
  @ApiResponse({ status: 200, description: 'Dispute resolved' })
  async resolve(
    @CurrentMerchant('id') merchantId: string,
    @Param('disputeCode') disputeCode: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    const data = await this.disputeService.resolve(merchantId, disputeCode, dto);
    return { status: true, message: 'Dispute resolved', data };
  }

  @Post(':disputeCode/evidence')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit evidence',
    description: 'Submit supporting evidence for an open dispute. Evidence helps prove your case and can result in a favourable resolution.',
  })
  @ApiResponse({ status: 200, description: 'Evidence submitted' })
  async submitEvidence(
    @CurrentMerchant('id') merchantId: string,
    @Param('disputeCode') disputeCode: string,
    @Body() dto: SubmitEvidenceDto,
  ) {
    const data = await this.disputeService.submitEvidence(merchantId, disputeCode, dto);
    return { status: true, message: 'Evidence submitted', data };
  }
}
