import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { MiscService } from './misc.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Miscellaneous')
@Controller({ path: 'misc', version: '1' })
export class MiscController {
  constructor(private readonly miscService: MiscService) {}

  @Get('banks')
  @Public()
  @ApiOperation({
    summary: 'List banks',
    description: 'Get a list of all supported banks for a given country. Used for transfers and USSD payments.',
  })
  @ApiQuery({ name: 'country', required: false, example: 'NG', description: 'ISO 2-letter country code' })
  @ApiResponse({ status: 200, description: 'Banks retrieved' })
  async listBanks(@Query('country') country?: string) {
    const data = await this.miscService.listBanks(country || 'NG');
    return { status: true, message: 'Banks retrieved', data };
  }

  @Get('verify-account')
  @ApiSecurity('ApiKey')
  @ApiOperation({
    summary: 'Verify bank account',
    description: 'Confirm that a bank account exists and retrieve the account name. Used to validate transfer recipients before initiating payouts.',
  })
  @ApiQuery({ name: 'bankCode', required: true, example: '058' })
  @ApiQuery({ name: 'accountNumber', required: true, example: '0123456789' })
  @ApiResponse({ status: 200, description: 'Account verified' })
  async verifyAccount(
    @Query('bankCode') bankCode: string,
    @Query('accountNumber') accountNumber: string,
  ) {
    const data = await this.miscService.verifyAccount(bankCode, accountNumber);
    return { status: true, message: 'Account verified', data };
  }

  @Get('countries')
  @Public()
  @ApiOperation({ summary: 'List supported countries', description: 'Get all countries and currencies supported by the gateway.' })
  async listCountries() {
    const data = await this.miscService.listCountries();
    return { status: true, message: 'Countries retrieved', data };
  }

  @Get('provider-status')
  @ApiSecurity('ApiKey')
  @ApiOperation({ summary: 'Get provider status', description: 'Check the current operational status of the payment provider.' })
  async providerStatus() {
    const data = await this.miscService.getProviderStatus();
    return { status: true, message: 'Provider status retrieved', data };
  }
}
