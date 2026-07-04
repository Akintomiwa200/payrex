import { Controller, Post, Get, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { SplitService } from './split.service';
import { CreateSplitDto, InitializeSplitTransactionDto } from './dto/create-split.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Splits')
@ApiSecurity('ApiKey')
@Controller({ path: 'splits', version: '1' })
export class SplitController {
  constructor(private readonly splitService: SplitService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a split',
    description: 'Create a split payment configuration. Define how a transaction amount should be shared among multiple recipients. Supports percentage and flat splits for marketplace-style platforms.',
  })
  @ApiResponse({ status: 201, description: 'Split created' })
  async create(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CreateSplitDto,
  ) {
    const data = await this.splitService.create(merchantId, dto);
    return { status: true, message: 'Split created', data };
  }

  @Get()
  @ApiOperation({ summary: 'List splits', description: 'Retrieve all split configurations.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  async list(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: any,
  ) {
    return this.splitService.list(merchantId, query);
  }

  @Post(':splitCode/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process a split',
    description: 'Execute a split payment. This will distribute the amount to all recipients according to the split configuration.',
  })
  @ApiResponse({ status: 200, description: 'Split processed' })
  @ApiResponse({ status: 404, description: 'Split not found' })
  @ApiResponse({ status: 409, description: 'Split already processed' })
  async processSplit(@Param('splitCode') splitCode: string) {
    const data = await this.splitService.processSplit(splitCode);
    return { status: true, message: 'Split processed', data };
  }
}
