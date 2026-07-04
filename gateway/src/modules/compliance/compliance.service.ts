import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  ComplianceScreening, ScreeningStatus,
  TransactionMonitoring,
} from './entities/compliance.entity';
import { Merchant } from '../auth/entities/merchant.entity';
import { QueueService, QueueName, ComplianceJobType } from '../queue/queue.service';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(ComplianceScreening) private screeningRepo: Repository<ComplianceScreening>,
    @InjectRepository(TransactionMonitoring) private monitoringRepo: Repository<TransactionMonitoring>,
    @InjectRepository(Merchant) private merchantRepo: Repository<Merchant>,
    private queueService: QueueService,
  ) {}

  async screenMerchant(merchantId: string): Promise<any> {
    const merchant = await this.merchantRepo.findOne({ where: { id: merchantId } });
    if (!merchant) throw new Error('Merchant not found');

    const screening = this.screeningRepo.create({
      merchantId,
      subjectType: 'merchant',
      subjectId: merchantId,
      subjectName: merchant.businessName,
      subjectCountry: 'NG',
      screenedLists: ['un_sanctions', 'ofac_sdn', 'pep', 'local_blacklist'],
      status: ScreeningStatus.PENDING,
    });

    const sanctionMatch = this.checkSanctionLists(merchant.businessName, merchant.email);
    const pepMatch = this.checkPEPList(merchant.businessName);

    const matches: any[] = [];
    let riskScore = 0;

    if (sanctionMatch) {
      matches.push(sanctionMatch);
      riskScore += 60;
    }
    if (pepMatch) {
      matches.push(pepMatch);
      riskScore += 30;
    }

    screening.status = matches.length > 0 ? ScreeningStatus.FLAGGED : ScreeningStatus.CLEAR;
    screening.matches = matches;
    screening.riskScore = riskScore;
    screening.metadata = { screenedAt: new Date().toISOString() };

    await this.screeningRepo.save(screening);

    if (screening.status === ScreeningStatus.FLAGGED) {
      merchant.settings = {
        ...(merchant.settings || {}),
        complianceStatus: 'flagged',
        screeningId: screening.id,
        riskScore,
      };
      await this.merchantRepo.save(merchant);

      this.logger.warn(`Merchant ${merchantId} flagged by compliance screening (risk: ${riskScore})`);
    }

    return {
      screeningId: screening.id,
      status: screening.status,
      riskScore,
      matches: screening.matches,
    };
  }

  async monitorTransaction(dto: {
    merchantId: string;
    transactionReference: string;
    amount: number;
    currency: string;
    senderName?: string;
    recipientName?: string;
    senderCountry?: string;
    recipientCountry?: string;
    ipAddress?: string;
    deviceFingerprint?: string;
  }): Promise<any> {
    const riskFactors: Record<string, any> = {};
    let isSuspicious = false;
    let flaggedReason = '';

    if (dto.amount > 5000000) {
      riskFactors.highValue = { amount: dto.amount, threshold: 5000000 };
      isSuspicious = true;
      flaggedReason = 'High value transaction exceeds 5,000,000 threshold';
    }

    if (dto.senderCountry !== dto.recipientCountry && dto.amount > 1000000) {
      riskFactors.crossBorder = { senderCountry: dto.senderCountry, recipientCountry: dto.recipientCountry };
      isSuspicious = true;
      flaggedReason = flaggedReason || 'Cross-border high value transaction';
    }

    if (dto.senderCountry === 'NG' && dto.recipientCountry === 'NG' && dto.amount > 10000000) {
      riskFactors.domesticHighValue = { amount: dto.amount, threshold: 10000000 };
      isSuspicious = true;
      flaggedReason = flaggedReason || 'Domestic transaction exceeds 10,000,000 threshold';
    }

    const monitoring = this.monitoringRepo.create({
      merchantId: dto.merchantId,
      transactionReference: dto.transactionReference,
      amount: dto.amount,
      currency: dto.currency,
      senderName: dto.senderName,
      recipientName: dto.recipientName,
      senderCountry: dto.senderCountry,
      recipientCountry: dto.recipientCountry,
      ipAddress: dto.ipAddress,
      deviceFingerprint: dto.deviceFingerprint,
      riskFactors,
      isSuspicious,
      flaggedReason: flaggedReason || undefined,
      requiresManualReview: isSuspicious,
    });

    await this.monitoringRepo.save(monitoring);

    return monitoring;
  }

  async reviewScreening(screeningId: string, dto: { status: string; notes?: string; reviewedBy?: string }): Promise<any> {
    const screening = await this.screeningRepo.findOne({ where: { id: screeningId } });
    if (!screening) throw new Error('Screening not found');

    screening.status = dto.status as ScreeningStatus;
    screening.reviewNotes = dto.notes;
    screening.reviewedBy = dto.reviewedBy || 'system';
    screening.reviewedAt = new Date();
    await this.screeningRepo.save(screening);

    if (screening.status === ScreeningStatus.CLEAR || screening.status === ScreeningStatus.REVIEWED) {
      await this.merchantRepo.update(screening.merchantId, {
        settings: { complianceStatus: 'clear' } as any,
      });
    }

    return screening;
  }

  async listScreenings(merchantId?: string): Promise<any> {
    const where: any = {};
    if (merchantId) where.merchantId = merchantId;
    return this.screeningRepo.find({ where, order: { createdAt: 'DESC' }, take: 50 });
  }

  async listMonitoringAlerts(merchantId?: string): Promise<any> {
    const where: any = { isSuspicious: true };
    if (merchantId) where.merchantId = merchantId;
    return this.monitoringRepo.find({ where, order: { createdAt: 'DESC' }, take: 50 });
  }

  private checkSanctionLists(name: string, email: string): any | null {
    const sanctionsTerms = ['terror', 'sanction', 'prohibited', 'embargo'];
    const nameLower = name.toLowerCase();
    for (const term of sanctionsTerms) {
      if (nameLower.includes(term)) {
        return {
          list: 'un_sanctions',
          matchType: 'name_match',
          matchName: name,
          confidence: 85,
          details: `Business name contains prohibited term: ${term}`,
        };
      }
    }
    return null;
  }

  private checkPEPList(name: string): any | null {
    const pepTerms = ['minister', 'president', 'governor', 'senator', 'ambassador'];
    const nameLower = name.toLowerCase();
    for (const term of pepTerms) {
      if (nameLower.includes(term)) {
        return {
          list: 'politically_exposed_persons',
          matchType: 'name_match',
          matchName: name,
          confidence: 70,
          details: `Name matches PEP pattern: ${term}`,
        };
      }
    }
    return null;
  }
}
