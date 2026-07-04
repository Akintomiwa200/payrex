import { Controller, Post, Get, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { InitializeTransactionDto, InitializeTransactionResponseDto } from './dto/initialize-transaction.dto';
import { CardChargeDto, BankTransferChargeDto, UssdChargeDto } from './dto/charge.dto';
import { VerifyTransactionDto, TransactionResponseDto } from './dto/verify-transaction.dto';
import { RefundTransactionDto, RefundResponseDto } from './dto/refund.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Transactions')
@ApiSecurity('ApiKey')
@Controller({ path: 'transactions', version: '1' })
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('initialize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initialize a transaction',
    description: 'Initialize a payment transaction. Returns an authorization URL and access code to redirect the customer to the payment page.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction initialized',
    type: InitializeTransactionResponseDto,
  })
  async initialize(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: InitializeTransactionDto,
  ) {
    const data = await this.transactionService.initialize(merchantId, dto);
    return { status: true, message: 'Authorization URL created', data };
  }

  @Post('charge/card')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Charge a card',
    description: 'Directly charge a customer\'s card. This requires PCI-compliant integration. Use initialize() for PCI-free flow.',
  })
  @ApiResponse({ status: 200, description: 'Card charge initiated' })
  async chargeCard(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CardChargeDto,
  ) {
    const data = await this.transactionService.chargeCard(merchantId, dto);
    return { status: true, message: 'Card charge initiated', data };
  }

  @Post('charge/bank-transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Charge via bank transfer',
    description: 'Generate bank account details for a customer to make a bank transfer payment.',
  })
  @ApiResponse({ status: 200, description: 'Bank transfer details generated' })
  async chargeBankTransfer(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: BankTransferChargeDto,
  ) {
    const data = await this.transactionService.chargeBankTransfer(merchantId, dto);
    return { status: true, message: 'Bank transfer details generated', data };
  }

  @Post('charge/ussd')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Charge via USSD',
    description: 'Generate a USSD code for the customer to dial on their phone to complete payment.',
  })
  @ApiResponse({ status: 200, description: 'USSD code generated' })
  async chargeUssd(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: UssdChargeDto,
  ) {
    const data = await this.transactionService.chargeUssd(merchantId, dto);
    return { status: true, message: 'USSD code generated', data };
  }

  @Get('verify/:reference')
  @ApiOperation({
    summary: 'Verify a transaction',
    description: 'Confirm the status of a transaction using its reference. Use this to verify payment success before fulfilling orders.',
  })
  @ApiResponse({ status: 200, description: 'Transaction retrieved', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async verify(
    @CurrentMerchant('id') merchantId: string,
    @Param() params: VerifyTransactionDto,
  ) {
    const data = await this.transactionService.verify(params.reference, merchantId);
    return { status: true, message: 'Transaction retrieved', data };
  }

  @Get()
  @ApiOperation({
    summary: 'List transactions',
    description: 'Retrieve a paginated list of all transactions for the authenticated merchant.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'success', 'failed', 'refunded'] })
  @ApiQuery({ name: 'from', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2024-12-31' })
  async list(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: any,
  ) {
    return this.transactionService.list(merchantId, query);
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refund a transaction',
    description: 'Process a full or partial refund for a successful transaction. The refund amount will be deducted from the merchant\'s wallet balance.',
  })
  @ApiResponse({ status: 200, description: 'Refund processed', type: RefundResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot refund this transaction' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async refund(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: RefundTransactionDto,
  ) {
    const data = await this.transactionService.refund(merchantId, dto);
    return { status: true, message: 'Refund processed', data };
  }
}
