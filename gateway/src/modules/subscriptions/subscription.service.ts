import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { CreatePlanDto, CreateSubscriptionDto } from './dto/create-plan.dto';
import { Transaction, TransactionStatus } from '../transactions/entities/transaction.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async createPlan(merchantId: string, dto: CreatePlanDto): Promise<any> {
    const planCode = `PLN_${dto.name.replace(/\s+/g, '_').toUpperCase()}_${uuidv4().slice(0, 4).toUpperCase()}`;

    const plan = this.planRepo.create({
      merchantId,
      planCode,
      ...dto,
    });

    await this.planRepo.save(plan);

    return plan;
  }

  async listPlans(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const [plans, total] = await this.planRepo.findAndCount({
      where: { merchantId },
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
    });

    return {
      data: plans,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  async create(merchantId: string, dto: CreateSubscriptionDto): Promise<any> {
    const plan = await this.planRepo.findOne({
      where: { id: dto.plan, merchantId, isActive: true },
    });

    if (!plan) {
      throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
    }

    const subscriptionCode = `SUB_${uuidv4().slice(0, 8).toUpperCase()}`;
    const ref = `SUB-${uuidv4().slice(0, 8).toUpperCase()}`;

    const now = new Date();
    const nextChargeDate = new Date(now);
    switch (plan.interval) {
      case 'daily': nextChargeDate.setDate(nextChargeDate.getDate() + 1); break;
      case 'weekly': nextChargeDate.setDate(nextChargeDate.getDate() + 7); break;
      case 'monthly': nextChargeDate.setMonth(nextChargeDate.getMonth() + 1); break;
      case 'quarterly': nextChargeDate.setMonth(nextChargeDate.getMonth() + 3); break;
      case 'yearly': nextChargeDate.setFullYear(nextChargeDate.getFullYear() + 1); break;
    }

    const transaction = this.transactionRepo.create({
      reference: ref,
      merchantId,
      customerId: dto.customer,
      amount: plan.amount,
      currency: 'NGN' as any,
      status: TransactionStatus.INITIALIZED,
    });
    await this.transactionRepo.save(transaction);

    const subscription = this.subscriptionRepo.create({
      merchantId,
      customerId: dto.customer,
      planId: plan.id,
      subscriptionCode,
      transactionReference: ref,
      nextChargeDate,
      status: SubscriptionStatus.ACTIVE,
      metadata: dto.metadata,
    });

    await this.subscriptionRepo.save(subscription);

    return {
      id: subscription.id,
      subscriptionCode: subscription.subscriptionCode,
      plan: plan.name,
      status: subscription.status,
      nextChargeDate: subscription.nextChargeDate,
      transactionReference: ref,
    };
  }

  async cancel(merchantId: string, subscriptionCode: string): Promise<any> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { subscriptionCode, merchantId },
    });

    if (!subscription) {
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    await this.subscriptionRepo.save(subscription);

    return {
      subscriptionCode: subscription.subscriptionCode,
      status: 'cancelled',
      cancelledAt: subscription.cancelledAt,
    };
  }

  async list(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const where: any = { merchantId };
    if (query.status) where.status = query.status;

    const [subscriptions, total] = await this.subscriptionRepo.findAndCount({
      where,
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
      relations: { plan: true },
    });

    return {
      data: subscriptions,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }
}
