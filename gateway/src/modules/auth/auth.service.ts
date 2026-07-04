import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import { Merchant } from './entities/merchant.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
  ) {}

  private generateApiKey(keyType: string): string {
    const prefix = keyType === 'live' ? 'sk_live_' : 'sk_test_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}${randomBytes}`;
  }

  async createApiKey(merchantId: string, dto: any): Promise<any> {
    const keyType = dto.keyType || 'test';
    const key = this.generateApiKey(keyType);

    const apiKey = this.apiKeyRepo.create({
      merchantId,
      key,
      label: dto.label,
      keyType,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    await this.apiKeyRepo.save(apiKey);

    return {
      key: apiKey.key,
      keyType: apiKey.keyType,
      label: apiKey.label,
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt,
    };
  }

  async listApiKeys(merchantId: string): Promise<any> {
    const keys = await this.apiKeyRepo.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });

    return keys.map((k) => ({
      id: k.id,
      label: k.label,
      keyType: k.keyType,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));
  }

  async revokeApiKey(merchantId: string, keyId: string): Promise<any> {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id: keyId, merchantId },
    });

    if (!apiKey) {
      throw new HttpException('API key not found', HttpStatus.NOT_FOUND);
    }

    apiKey.isActive = false;
    await this.apiKeyRepo.save(apiKey);

    return { message: 'API key revoked' };
  }

  async registerMerchant(dto: any): Promise<any> {
    const existing = await this.merchantRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new HttpException('Merchant with this email already exists', HttpStatus.CONFLICT);
    }

    const merchant = this.merchantRepo.create({
      businessName: dto.businessName,
      email: dto.email,
      contactPhone: dto.contactPhone,
    });

    await this.merchantRepo.save(merchant);

    const testKey = await this.createApiKey(merchant.id, {
      label: 'Default Test Key',
      keyType: 'test',
    });

    return {
      id: merchant.id,
      businessName: merchant.businessName,
      email: merchant.email,
      apiKey: testKey.key,
    };
  }
}
