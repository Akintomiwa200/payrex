import { Controller, Post, Get, Param, Patch, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, CustomerResponseDto, ListCustomersQueryDto } from './dto/create-customer.dto';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Customers')
@ApiSecurity('ApiKey')
@Controller({ path: 'customers', version: '1' })
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a customer',
    description: 'Create a new customer profile on the gateway. Customers can be referenced in transactions and subscriptions.',
  })
  @ApiResponse({ status: 201, description: 'Customer created', type: CustomerResponseDto })
  async create(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    const data = await this.customerService.create(merchantId, dto);
    return { status: true, message: 'Customer created', data };
  }

  @Get(':customerCode')
  @ApiOperation({
    summary: 'Fetch a customer',
    description: 'Get details of a single customer by their customer code.',
  })
  @ApiResponse({ status: 200, description: 'Customer retrieved' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(
    @CurrentMerchant('id') merchantId: string,
    @Param('customerCode') customerCode: string,
  ) {
    const data = await this.customerService.findOne(merchantId, customerCode);
    return { status: true, message: 'Customer retrieved', data };
  }

  @Get()
  @ApiOperation({
    summary: 'List customers',
    description: 'Retrieve a paginated list of all customers for the authenticated merchant.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 50 })
  @ApiQuery({ name: 'email', required: false, example: 'john@example.com' })
  async list(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: ListCustomersQueryDto,
  ) {
    return this.customerService.list(merchantId, query);
  }

  @Patch(':customerCode')
  @ApiOperation({ summary: 'Update a customer', description: 'Update a customer\'s details.' })
  @ApiResponse({ status: 200, description: 'Customer updated' })
  async update(
    @CurrentMerchant('id') merchantId: string,
    @Param('customerCode') customerCode: string,
    @Body() dto: Partial<CreateCustomerDto>,
  ) {
    const data = await this.customerService.update(merchantId, customerCode, dto);
    return { status: true, message: 'Customer updated', data };
  }
}
