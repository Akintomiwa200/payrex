import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SplitPayment } from './entities/split-payment.entity';
import { SplitRecipient } from './entities/split-recipient.entity';
import { CreateSplitDto } from './dto/create-split.dto';

@Injectable()
export class SplitService {
  constructor(
    @InjectRepository(SplitPayment)
    private splitRepo: Repository<SplitPayment>,
    @InjectRepository(SplitRecipient)
    private recipientRepo: Repository<SplitRecipient>,
  ) {}

  async create(merchantId: string, dto: CreateSplitDto): Promise<any> {
    const splitCode = `SPL_${uuidv4().slice(0, 8).toUpperCase()}`;

    const split = this.splitRepo.create({
      merchantId,
      splitCode,
      type: dto.type,
      amount: dto.amount,
      commission: dto.metadata?.commission || 0,
      metadata: dto.metadata,
    });

    await this.splitRepo.save(split);

    const recipients = dto.recipients.map((r) =>
      this.recipientRepo.create({
        splitId: split.id,
        ...r,
      }),
    );

    await this.recipientRepo.save(recipients);

    return {
      id: split.id,
      splitCode: split.splitCode,
      type: split.type,
      recipients: recipients.map((r) => ({
        recipientCode: r.recipientCode,
        percentage: r.percentage,
        flatAmount: r.flatAmount,
      })),
    };
  }

  async list(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const [splits, total] = await this.splitRepo.findAndCount({
      where: { merchantId },
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
      relations: { recipients: true },
    });

    return {
      data: splits,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  async processSplit(splitCode: string): Promise<any> {
    const split = await this.splitRepo.findOne({
      where: { splitCode },
      relations: { recipients: true },
    });

    if (!split) {
      throw new HttpException('Split not found', HttpStatus.NOT_FOUND);
    }

    if (split.isProcessed) {
      throw new HttpException('Split already processed', HttpStatus.CONFLICT);
    }

    split.isProcessed = true;
    await this.splitRepo.save(split);

    return {
      splitCode: split.splitCode,
      status: 'processed',
      recipients: split.recipients.map((r) => ({
        recipientCode: r.recipientCode,
        amount: r.percentage
          ? (split.amount * r.percentage) / 100
          : r.flatAmount,
        isSettled: r.isSettled,
      })),
    };
  }
}
