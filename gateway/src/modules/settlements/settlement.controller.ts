import { Controller, Post, Get, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { SettlementService } from './settlement.service';
import { InitiateSettlementDto, SettlementQueryDto } from './dto/settlement.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Settlements')
@ApiSecurity('ApiKey')
@Controller({ path: 'settlements', version: '1' })
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate a settlement',
    description: 'Withdraw funds from your wallet balance to your bank account. A 1% processing fee applies. You can settle the full balance or a specific amount.',
  })
  @ApiResponse({ status: 201, description: 'Settlement initiated' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  async initiate(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: InitiateSettlementDto,
  ) {
    const data = await this.settlementService.initiate(merchantId, dto);
    return { status: true, message: 'Settlement initiated', data };
  }

  @Get()
  @ApiOperation({ summary: 'List settlements', description: 'Retrieve a paginated list of all settlements.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed'] })
  async list(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: SettlementQueryDto,
  ) {
    return this.settlementService.list(merchantId, query);
  }
}
