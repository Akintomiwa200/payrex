import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async create(merchantId: string, dto: CreateCustomerDto): Promise<any> {
    const customerCode = `CUS_${uuidv4().slice(0, 8).toUpperCase()}`;

    const customer = this.customerRepo.create({
      merchantId,
      customerCode,
      ...dto,
    });

    await this.customerRepo.save(customer);

    return {
      id: customer.id,
      customerCode: customer.customerCode,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      createdAt: customer.createdAt,
    };
  }

  async findOne(merchantId: string, customerCode: string): Promise<any> {
    const customer = await this.customerRepo.findOne({
      where: { customerCode, merchantId },
    });

    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    return customer;
  }

  async list(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const where: any = { merchantId };
    if (query.email) where.email = query.email;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [customers, total] = await this.customerRepo.findAndCount({
      where,
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
    });

    return {
      data: customers,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  async update(merchantId: string, customerCode: string, dto: Partial<CreateCustomerDto>): Promise<any> {
    const customer = await this.customerRepo.findOne({
      where: { customerCode, merchantId },
    });

    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(customer, dto);
    await this.customerRepo.save(customer);

    return customer;
  }
}
