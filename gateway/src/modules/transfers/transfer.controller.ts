import { Controller, Post, Get, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { CreateRecipientDto, InitiateTransferDto, InitiateBulkTransferDto } from './dto/transfer.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Transfers')
@ApiSecurity('ApiKey')
@Controller({ path: 'transfers', version: '1' })
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post('recipients')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a transfer recipient',
    description: 'Add a bank account as a valid transfer recipient. Recipients can be reused for multiple payouts.',
  })
  @ApiResponse({ status: 201, description: 'Recipient created' })
  async createRecipient(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CreateRecipientDto,
  ) {
    const data = await this.transferService.createRecipient(merchantId, dto);
    return { status: true, message: 'Recipient created', data };
  }

  @Get('recipients')
  @ApiOperation({ summary: 'List recipients', description: 'Retrieve all saved transfer recipients.' })
  async listRecipients(@CurrentMerchant('id') merchantId: string) {
    const data = await this.transferService.listRecipients(merchantId);
    return { status: true, message: 'Recipients retrieved', data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate a transfer',
    description: 'Send money to a saved recipient. Funds are debited from your wallet balance.',
  })
  @ApiResponse({ status: 201, description: 'Transfer initiated' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  async initiateTransfer(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: InitiateTransferDto,
  ) {
    const data = await this.transferService.initiateTransfer(merchantId, dto);
    return { status: true, message: 'Transfer initiated', data };
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate bulk transfer',
    description: 'Process multiple transfers in a single batch. Each transfer is processed individually and results are aggregated in a batch report.',
  })
  @ApiResponse({ status: 201, description: 'Bulk transfer initiated' })
  async initiateBulkTransfer(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: InitiateBulkTransferDto,
  ) {
    const data = await this.transferService.initiateBulkTransfer(merchantId, dto);
    return { status: true, message: 'Bulk transfer initiated', data };
  }

  @Get()
  @ApiOperation({ summary: 'List transfers', description: 'Retrieve paginated transfer history.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'success', 'failed', 'reversed'] })
  async listTransfers(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: any,
  ) {
    return this.transferService.listTransfers(merchantId, query);
  }

  @Get('bulk')
  @ApiOperation({ summary: 'List bulk transfers', description: 'Retrieve all bulk transfer batches.' })
  async listBulkTransfers(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: any,
  ) {
    return this.transferService.listBulkTransfers(merchantId, query);
  }
}
