import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { ThreeDSService } from './threeds.service';
import { InitiateThreeDSDto, ThreeDSCallbackDto, ThreeDSInitiateResponseDto, ThreeDSAuthenticationResponseDto } from './dto/threeds.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('3D Secure')
@ApiSecurity('ApiKey')
@Controller({ path: '3ds', version: '1' })
export class ThreeDSController {
  constructor(private readonly threeDSService: ThreeDSService) {}

  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initiate 3D Secure authentication',
    description: 'Start the 3D Secure 2.0 authentication flow for a transaction. Returns the ACS URL and challenge request to redirect the cardholder for verification.',
  })
  @ApiResponse({ status: 200, description: '3DS initiated', type: ThreeDSInitiateResponseDto })
  async initiate(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: InitiateThreeDSDto,
  ) {
    const data = await this.threeDSService.initiate(merchantId, dto);
    return { status: true, message: '3DS authentication initiated', data };
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle 3DS callback',
    description: 'Process the ACS callback with the Challenge Response (CRes) from the cardholder\'s bank. Completes the 3DS authentication and returns the authentication result.',
  })
  @ApiResponse({ status: 200, description: '3DS callback processed', type: ThreeDSAuthenticationResponseDto })
  async handleCallback(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: ThreeDSCallbackDto,
  ) {
    const data = await this.threeDSService.handleCallback(merchantId, dto);
    return { status: true, message: '3DS authentication processed', data };
  }

  @Get('status/:transactionReference')
  @ApiOperation({
    summary: 'Get 3DS status',
    description: 'Check the 3D Secure authentication status for a transaction.',
  })
  async getStatus(
    @CurrentMerchant('id') merchantId: string,
    @Param('transactionReference') reference: string,
  ) {
    const data = await this.threeDSService.getStatus(merchantId, reference);
    return { status: true, message: '3DS status retrieved', data };
  }
}
