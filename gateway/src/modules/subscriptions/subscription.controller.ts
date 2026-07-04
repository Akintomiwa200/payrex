import { Controller, Post, Get, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreatePlanDto, CreateSubscriptionDto } from './dto/create-plan.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Subscriptions')
@ApiSecurity('ApiKey')
@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a subscription plan',
    description: 'Define a recurring billing plan with interval and amount. Customers can then subscribe to this plan.',
  })
  @ApiResponse({ status: 201, description: 'Plan created' })
  async createPlan(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CreatePlanDto,
  ) {
    const data = await this.subscriptionService.createPlan(merchantId, dto);
    return { status: true, message: 'Plan created', data };
  }

  @Get('plans')
  @ApiOperation({ summary: 'List plans', description: 'Retrieve all subscription plans.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  async listPlans(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: any,
  ) {
    return this.subscriptionService.listPlans(merchantId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a subscription',
    description: 'Subscribe a customer to a plan. An initial transaction will be created to start the recurring billing cycle.',
  })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async create(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    const data = await this.subscriptionService.create(merchantId, dto);
    return { status: true, message: 'Subscription created', data };
  }

  @Get()
  @ApiOperation({ summary: 'List subscriptions', description: 'Retrieve all subscriptions with their status.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'paused', 'cancelled', 'expired'] })
  async list(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: any,
  ) {
    return this.subscriptionService.list(merchantId, query);
  }

  @Post(':subscriptionCode/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a subscription',
    description: 'Cancel an active subscription immediately. No further charges will be made.',
  })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  async cancel(
    @CurrentMerchant('id') merchantId: string,
    @Param('subscriptionCode') subscriptionCode: string,
  ) {
    const data = await this.subscriptionService.cancel(merchantId, subscriptionCode);
    return { status: true, message: 'Subscription cancelled', data };
  }
}
