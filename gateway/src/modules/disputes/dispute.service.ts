import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { Transaction, TransactionStatus } from '../transactions/entities/transaction.entity';
import { ErrorCodes, throwPaymentError } from '../../common/errors/error-codes';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class DisputeService {
  constructor(
    @InjectRepository(Dispute)
    private disputeRepo: Repository<Dispute>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private timelineService: TimelineService,
  ) {}

  async create(merchantId: string, dto: any): Promise<any> {
    const transaction = await this.transactionRepo.findOne({
      where: { reference: dto.transactionReference, merchantId },
    });

    if (!transaction) {
      throwPaymentError(ErrorCodes.TRANSACTION_NOT_FOUND);
    }

    if (transaction.status !== TransactionStatus.SUCCESS) {
      throwPaymentError(ErrorCodes.TRANSACTION_NOT_FOUND);
    }

    const disputeCode = `DIS_${uuidv4().slice(0, 8).toUpperCase()}`;

    const dispute = this.disputeRepo.create({
      merchantId,
      transactionReference: dto.transactionReference,
      customerEmail: dto.customerEmail || transaction.metadata?.email,
      disputeCode,
      reason: dto.reason,
      description: dto.description,
      amount: dto.amount || transaction.amount,
      currency: transaction.currency,
      status: DisputeStatus.OPEN,
      metadata: dto.metadata,
    });

    await this.disputeRepo.save(dispute);

    await this.timelineService.record(
      merchantId,
      dto.transactionReference,
      'dispute_opened',
      { disputeCode, reason: dto.reason, amount: dispute.amount },
      `Dispute opened: ${dto.reason}`,
    );

    return dispute;
  }

  async list(merchantId: string, query: any): Promise<any> {
    const page = query.page || 1;
    const perPage = query.perPage || 50;
    const skip = (page - 1) * perPage;

    const where: any = { merchantId };
    if (query.status) where.status = query.status;
    if (query.transactionReference) where.transactionReference = query.transactionReference;

    const [disputes, total] = await this.disputeRepo.findAndCount({
      where,
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
    });

    return {
      data: disputes,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  async resolve(merchantId: string, disputeCode: string, dto: any): Promise<any> {
    const dispute = await this.disputeRepo.findOne({
      where: { disputeCode, merchantId },
    });

    if (!dispute) throwPaymentError(ErrorCodes.DISPUTE_NOT_FOUND);

    if (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.WON || dispute.status === DisputeStatus.LOST) {
      throwPaymentError(ErrorCodes.DISPUTE_ALREADY_RESOLVED);
    }

    dispute.status = dto.status;
    dispute.resolvedAt = new Date();
    dispute.resolvedBy = dto.resolvedBy || 'system';
    dispute.resolutionNote = dto.note;
    dispute.evidence = dto.evidence || dispute.evidence;

    await this.disputeRepo.save(dispute);

    await this.timelineService.record(
      merchantId,
      dispute.transactionReference,
      'dispute_resolved',
      { disputeCode, status: dto.status, note: dto.note },
      `Dispute resolved: ${dto.status}`,
    );

    return dispute;
  }

  async submitEvidence(merchantId: string, disputeCode: string, dto: any): Promise<any> {
    const dispute = await this.disputeRepo.findOne({
      where: { disputeCode, merchantId },
    });

    if (!dispute) throwPaymentError(ErrorCodes.DISPUTE_NOT_FOUND);

    dispute.evidence = {
      ...(dispute.evidence || {}),
      ...dto,
      submittedAt: new Date().toISOString(),
    };
    dispute.status = DisputeStatus.UNDER_REVIEW;

    await this.disputeRepo.save(dispute);

    return dispute;
  }
}
