import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionTimeline } from './entities/timeline.entity';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(TransactionTimeline)
    private timelineRepo: Repository<TransactionTimeline>,
  ) {}

  async record(
    merchantId: string,
    reference: string,
    eventType: string,
    data?: Record<string, any>,
    description?: string,
    ipAddress?: string,
  ): Promise<TransactionTimeline> {
    const entry = this.timelineRepo.create({
      merchantId,
      reference,
      eventType,
      data,
      description,
      ipAddress,
    });
    return this.timelineRepo.save(entry);
  }

  async getTimeline(merchantId: string, reference: string): Promise<TransactionTimeline[]> {
    return this.timelineRepo.find({
      where: { merchantId, reference },
      order: { occurredAt: 'ASC' },
    });
  }

  async list(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const where: any = { merchantId };
    if (query.reference) where.reference = query.reference;
    if (query.eventType) where.eventType = query.eventType;

    const [entries, total] = await this.timelineRepo.findAndCount({
      where,
      skip,
      take: perPage,
      order: { occurredAt: 'DESC' },
    });

    return {
      data: entries,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }
}
