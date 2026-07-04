import { Controller, Post, Get, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { TokenizeCardDto, ChargeTokenDto } from './dto/token.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Tokens')
@ApiSecurity('ApiKey')
@Controller({ path: 'tokens', version: '1' })
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('card')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tokenize a card',
    description: 'Securely store card details and get a reusable token. Use this token for future charges without handling raw card data. PCI-compliant.',
  })
  @ApiResponse({ status: 201, description: 'Card tokenized' })
  async tokenizeCard(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: TokenizeCardDto,
  ) {
    const data = await this.tokenService.tokenizeCard(merchantId, dto.customerId, {
      number: dto.cardNumber,
      expMonth: dto.expMonth,
      expYear: dto.expYear,
      cvv: dto.cvv,
    });
    return { status: true, message: 'Card tokenized', data };
  }

  @Post('charge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Charge a token',
    description: 'Charge a previously tokenized card. No raw card details needed — just the token and amount.',
  })
  @ApiResponse({ status: 200, description: 'Token charge processed' })
  async chargeToken(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: ChargeTokenDto,
  ) {
    const data = await this.tokenService.chargeToken(
      merchantId,
      dto.token,
      dto.amount,
      dto.currency || 'NGN',
      dto.metadata,
    );
    return { status: true, message: 'Token charge processed', data };
  }

  @Get()
  @ApiOperation({ summary: 'List tokens', description: 'Retrieve all saved payment tokens for the merchant.' })
  async listTokens(
    @CurrentMerchant('id') merchantId: string,
  ) {
    const data = await this.tokenService.listTokens(merchantId);
    return { status: true, message: 'Tokens retrieved', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a token', description: 'Deactivate a saved payment token.' })
  async removeToken(
    @CurrentMerchant('id') merchantId: string,
    @Param('id') id: string,
  ) {
    await this.tokenService.removeToken(merchantId, id);
    return { status: true, message: 'Token removed' };
  }
}
