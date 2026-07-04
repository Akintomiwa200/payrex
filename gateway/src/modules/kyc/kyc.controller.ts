import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { KYCService } from './kyc.service';
import { SubmitKYCDto, VerifyBVNDto, VerifyNINDto, KYCStatusResponseDto } from './dto/kyc.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('KYC')
@ApiSecurity('ApiKey')
@Controller({ path: 'kyc', version: '1' })
export class KYCController {
  constructor(private readonly kycService: KYCService) {}

  @Post('documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit KYC document',
    description: 'Upload or reference a KYC document for verification. Supports passports, IDs, driver\'s licenses, BVN, NIN, utility bills, CAC certificates, and more.',
  })
  @ApiResponse({ status: 201, description: 'Document submitted' })
  async submitDocument(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: SubmitKYCDto,
  ) {
    const data = await this.kycService.submitDocument(merchantId, dto);
    return { status: true, message: 'Document submitted', data };
  }

  @Post('verify-bvn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify BVN',
    description: 'Verify a Bank Verification Number (BVN). On successful verification, the merchant\'s KYC level is upgraded to Level 2, enabling higher transaction limits.',
  })
  @ApiResponse({ status: 200, description: 'BVN verified' })
  async verifyBVN(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: VerifyBVNDto,
  ) {
    const data = await this.kycService.verifyBVN(merchantId, dto);
    return { status: true, message: 'BVN verified', data };
  }

  @Post('verify-nin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify NIN',
    description: 'Verify a National Identification Number (NIN). Like BVN, this upgrades the merchant KYC level.',
  })
  @ApiResponse({ status: 200, description: 'NIN verified' })
  async verifyNIN(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: VerifyNINDto,
  ) {
    const data = await this.kycService.verifyNIN(merchantId, dto);
    return { status: true, message: 'NIN verified', data };
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get KYC status',
    description: 'Retrieve the current KYC verification status, level, and a list of required documents for the next level.',
  })
  @ApiResponse({ status: 200, description: 'KYC status retrieved', type: KYCStatusResponseDto })
  async getStatus(@CurrentMerchant('id') merchantId: string) {
    const data = await this.kycService.getKYCStatus(merchantId);
    return { status: true, message: 'KYC status retrieved', data };
  }
}
