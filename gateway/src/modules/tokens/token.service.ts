import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PaymentToken, TokenType } from './entities/token.entity';
import { ErrorCodes, throwPaymentError } from '../../common/errors/error-codes';
import { InternalProvider } from '../providers/process-all-provider';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectRepository(PaymentToken)
    private tokenRepo: Repository<PaymentToken>,
    private provider: InternalProvider,
  ) {}

  async tokenizeCard(
    merchantId: string,
    customerId: string | undefined,
    card: { number: string; expMonth: string; expYear: string; cvv: string },
  ): Promise<any> {
    const auth = await this.provider.authorize({
      reference: `tok-${uuidv4()}`,
      amount: 0,
      currency: 'NGN',
      card: { number: card.number, expMonth: card.expMonth, expYear: card.expYear, cvv: card.cvv },
      email: '',
    });

    if (!auth.success) {
      throwPaymentError(ErrorCodes.INVALID_CARD);
    }

    const token = `tok_${uuidv4().replace(/-/g, '')}`;

    const paymentToken = this.tokenRepo.create({
      merchantId,
      customerId,
      token,
      type: TokenType.CARD,
      cardType: auth.cardType,
      last4: auth.last4,
      expMonth: auth.expMonth,
      expYear: auth.expYear,
      authCode: auth.authorizationCode,
      signature: auth.signature,
      isReusable: auth.reusable,
    });

    await this.tokenRepo.save(paymentToken);

    return {
      token: paymentToken.token,
      type: paymentToken.type,
      cardType: paymentToken.cardType,
      last4: paymentToken.last4,
      expMonth: paymentToken.expMonth,
      expYear: paymentToken.expYear,
      signature: paymentToken.signature,
      reusable: paymentToken.isReusable,
    };
  }

  async chargeToken(
    merchantId: string,
    token: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    const paymentToken = await this.tokenRepo.findOne({
      where: { token, merchantId, isActive: true },
    });

    if (!paymentToken) {
      throwPaymentError(ErrorCodes.TOKEN_NOT_FOUND);
    }

    if (paymentToken.expiresAt && paymentToken.expiresAt < new Date()) {
      throwPaymentError(ErrorCodes.TOKEN_EXPIRED);
    }

    if (!paymentToken.isReusable) {
      paymentToken.isActive = false;
      paymentToken.usedAt = new Date();
      await this.tokenRepo.save(paymentToken);
    }

    const authCode = paymentToken.authCode;
    const capture = await this.provider.capture(authCode!, amount);

    return {
      success: capture.success,
      reference: `REF-${uuidv4().slice(0, 8).toUpperCase()}`,
      amount: capture.amount,
      fee: capture.fee,
      cardType: paymentToken.cardType,
      last4: paymentToken.last4,
      processorReference: capture.processorReference,
      status: capture.status,
    };
  }

  async listTokens(merchantId: string, customerId?: string): Promise<any> {
    const where: any = { merchantId };
    if (customerId) where.customerId = customerId;

    return this.tokenRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async removeToken(merchantId: string, tokenId: string): Promise<void> {
    const token = await this.tokenRepo.findOne({ where: { id: tokenId, merchantId } });
    if (!token) throwPaymentError(ErrorCodes.TOKEN_NOT_FOUND);

    token.isActive = false;
    await this.tokenRepo.save(token);
  }
}
