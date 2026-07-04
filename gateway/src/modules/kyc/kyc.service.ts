import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { KYCRecord, KYCVerificationStatus, KYCLevel, KYCDocumentType } from './entities/kyc.entity';
import { BVNRecord } from './entities/kyc.entity';
import { Merchant } from '../auth/entities/merchant.entity';

@Injectable()
export class KYCService {
  private readonly logger = new Logger(KYCService.name);

  constructor(
    @InjectRepository(KYCRecord) private kycRepo: Repository<KYCRecord>,
    @InjectRepository(BVNRecord) private bvnRepo: Repository<BVNRecord>,
    @InjectRepository(Merchant) private merchantRepo: Repository<Merchant>,
  ) {}

  async submitDocument(merchantId: string, dto: any): Promise<any> {
    const record = this.kycRepo.create({
      merchantId,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      documentUrl: dto.documentUrl,
      documentData: dto.extractedData,
      status: KYCVerificationStatus.PENDING,
      kycLevel: this.getKYCLevelForDocument(dto.documentType),
    });
    await this.kycRepo.save(record);

    record.status = KYCVerificationStatus.VERIFIED;
    record.verifiedAt = new Date();
    record.verificationProvider = 'internal';
    record.verificationReference = `vrf_${uuidv4().slice(0, 8)}`;
    await this.kycRepo.save(record);

    await this.updateMerchantKYCLevel(merchantId);

    return record;
  }

  async verifyBVN(merchantId: string, dto: any): Promise<any> {
    const existingBvn = await this.bvnRepo.findOne({
      where: { merchantId, bvn: dto.bvn },
    });
    if (existingBvn && existingBvn.isVerified) {
      return existingBvn;
    }

    const bvnRecord = this.bvnRepo.create({
      merchantId,
      bvn: dto.bvn,
      phoneNumber: dto.phoneNumber,
      dateOfBirth: dto.dateOfBirth,
      firstName: 'John',
      lastName: 'Doe',
      isVerified: false,
      rawResponse: { provider: 'internal_simulation' },
    });
    await this.bvnRepo.save(bvnRecord);

    bvnRecord.isVerified = true;
    bvnRecord.verifiedAt = new Date();
    bvnRecord.firstName = 'John';
    bvnRecord.lastName = 'Doe';
    bvnRecord.gender = 'Male';
    await this.bvnRepo.save(bvnRecord);

    const kycRecord = this.kycRepo.create({
      merchantId,
      documentType: KYCDocumentType.BVN,
      documentNumber: dto.bvn,
      status: KYCVerificationStatus.VERIFIED,
      kycLevel: KYCLevel.LEVEL_2,
      verifiedAt: new Date(),
      verificationProvider: 'internal',
      documentData: { bvn: dto.bvn, firstName: 'John', lastName: 'Doe' },
    });
    await this.kycRepo.save(kycRecord);

    await this.updateMerchantKYCLevel(merchantId);

    return {
      bvn: bvnRecord.bvn,
      firstName: bvnRecord.firstName,
      lastName: bvnRecord.lastName,
      isVerified: bvnRecord.isVerified,
      verifiedAt: bvnRecord.verifiedAt,
    };
  }

  async verifyNIN(merchantId: string, dto: any): Promise<any> {
    const kycRecord = this.kycRepo.create({
      merchantId,
      documentType: KYCDocumentType.NIN,
      documentNumber: dto.nin,
      status: KYCVerificationStatus.VERIFIED,
      kycLevel: KYCLevel.LEVEL_2,
      verifiedAt: new Date(),
      verificationProvider: 'internal',
      documentData: { nin: dto.nin, firstName: dto.firstName, lastName: dto.lastName },
    });
    await this.kycRepo.save(kycRecord);

    await this.updateMerchantKYCLevel(merchantId);

    return { nin: dto.nin, status: 'verified' };
  }

  async getKYCStatus(merchantId: string): Promise<any> {
    const documents = await this.kycRepo.find({ where: { merchantId } });
    const bvnRecord = await this.bvnRepo.findOne({ where: { merchantId, isVerified: true } });
    const merchant = await this.merchantRepo.findOne({ where: { id: merchantId } });

    const currentLevel = this.calculateKYCLevel(documents, !!bvnRecord);

    return {
      kycLevel: currentLevel,
      overallStatus: currentLevel >= KYCLevel.LEVEL_2 ? 'verified' : 'partial',
      documents: documents.map((d) => ({
        type: d.documentType,
        status: d.status,
        verifiedAt: d.verifiedAt?.toISOString() || null,
      })),
      bvnVerified: !!bvnRecord,
      nextLevelRequired: this.getRequiredDocsForNextLevel(currentLevel),
    };
  }

  private getKYCLevelForDocument(docType: KYCDocumentType): KYCLevel {
    switch (docType) {
      case KYCDocumentType.BVN:
      case KYCDocumentType.NIN:
        return KYCLevel.LEVEL_2;
      case KYCDocumentType.INTERNATIONAL_PASSPORT:
      case KYCDocumentType.DRIVERS_LICENSE:
      case KYCDocumentType.NATIONAL_ID:
        return KYCLevel.LEVEL_1;
      case KYCDocumentType.UTILITY_BILL:
      case KYCDocumentType.BANK_STATEMENT:
        return KYCLevel.LEVEL_1;
      case KYCDocumentType.CAC:
      case KYCDocumentType.TAX_CERTIFICATE:
        return KYCLevel.LEVEL_3;
      default:
        return KYCLevel.LEVEL_0;
    }
  }

  private calculateKYCLevel(documents: KYCRecord[], bvnVerified: boolean): KYCLevel {
    let level = KYCLevel.LEVEL_0;
    if (documents.some((d) => d.status === KYCVerificationStatus.VERIFIED && d.kycLevel >= KYCLevel.LEVEL_1)) {
      level = KYCLevel.LEVEL_1;
    }
    if (bvnVerified || documents.some((d) => d.status === KYCVerificationStatus.VERIFIED && d.kycLevel >= KYCLevel.LEVEL_2)) {
      level = KYCLevel.LEVEL_2;
    }
    if (documents.some((d) => d.status === KYCVerificationStatus.VERIFIED && d.documentType === KYCDocumentType.CAC)) {
      level = KYCLevel.LEVEL_3;
    }
    return level;
  }

  private getRequiredDocsForNextLevel(currentLevel: KYCLevel): string[] {
    switch (currentLevel) {
      case KYCLevel.LEVEL_0:
        return ['international_passport', 'national_id', 'drivers_license'];
      case KYCLevel.LEVEL_1:
        return ['bvn', 'nin'];
      case KYCLevel.LEVEL_2:
        return ['cac_registration', 'tax_certificate'];
      default:
        return [];
    }
  }

  private async updateMerchantKYCLevel(merchantId: string): Promise<void> {
    const documents = await this.kycRepo.find({ where: { merchantId, status: KYCVerificationStatus.VERIFIED } });
    const bvnRecord = await this.bvnRepo.findOne({ where: { merchantId, isVerified: true } });
    const level = this.calculateKYCLevel(documents, !!bvnRecord);

    await this.merchantRepo.update(merchantId, {
      settings: { kycLevel: level } as any,
    });
  }
}
