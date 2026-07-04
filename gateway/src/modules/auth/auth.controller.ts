import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateApiKeyDto, ApiKeyResponseDto } from './dto/create-api-key.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new merchant',
    description: 'Create a new merchant account and get your first test API key.',
  })
  @ApiResponse({
    status: 201,
    description: 'Merchant registered successfully',
    schema: {
      example: {
        status: true,
        message: 'Merchant registered',
        data: {
          id: 'm_abc123',
          businessName: 'Acme Corp',
          email: 'admin@acme.com',
          apiKey: 'sk_test_abc123...',
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Merchant already exists' })
  async register(@Body() dto: any) {
    const result = await this.authService.registerMerchant(dto);
    return { status: true, message: 'Merchant registered', data: result };
  }

  @Post('api-keys')
  @ApiSecurity('ApiKey')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create API key',
    description: 'Generate a new API key for authentication. Use "live" keyType for production, "test" for testing.',
  })
  @ApiResponse({ status: 201, description: 'API key created', type: ApiKeyResponseDto })
  async createApiKey(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    const result = await this.authService.createApiKey(merchantId, dto);
    return { status: true, message: 'API key created', data: result };
  }

  @Get('api-keys')
  @ApiSecurity('ApiKey')
  @ApiOperation({ summary: 'List API keys', description: 'Retrieve all API keys for the authenticated merchant.' })
  @ApiResponse({ status: 200, description: 'API keys retrieved' })
  async listApiKeys(@CurrentMerchant('id') merchantId: string) {
    const result = await this.authService.listApiKeys(merchantId);
    return { status: true, message: 'API keys retrieved', data: result };
  }

  @Post('api-keys/:id/revoke')
  @ApiSecurity('ApiKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke API key', description: 'Immediately revoke an API key. It will no longer be usable.' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async revokeApiKey(
    @CurrentMerchant('id') merchantId: string,
    @Param('id') keyId: string,
  ) {
    const result = await this.authService.revokeApiKey(merchantId, keyId);
    return { status: true, message: 'API key revoked', data: result };
  }
}
