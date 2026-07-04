import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { BalanceResponseDto, LedgerQueryDto } from './dto/balance.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Balance')
@ApiSecurity('ApiKey')
@Controller({ path: 'balance', version: '1' })
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @ApiOperation({
    summary: 'Get balance',
    description: 'Retrieve the current wallet balance, pending balance, and lifetime transaction volume for the authenticated merchant.',
  })
  @ApiResponse({ status: 200, description: 'Balance retrieved', type: BalanceResponseDto })
  async getBalance(@CurrentMerchant('id') merchantId: string) {
    const data = await this.balanceService.getBalance(merchantId);
    return { status: true, message: 'Balance retrieved', data };
  }

  @Get('ledger')
  @ApiOperation({
    summary: 'Get ledger entries',
    description: 'Retrieve a paginated list of all balance ledger entries (credits, debits, fees, refunds, settlements). This is the audit trail for all financial movements.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  @ApiQuery({ name: 'type', required: false, enum: ['credit', 'debit', 'reversal', 'fee', 'settlement', 'refund'] })
  @ApiQuery({ name: 'from', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2024-12-31' })
  async getLedger(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: LedgerQueryDto,
  ) {
    return this.balanceService.getLedger(merchantId, query);
  }
}
