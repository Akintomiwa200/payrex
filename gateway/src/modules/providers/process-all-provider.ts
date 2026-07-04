import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  PaymentProvider,
  ProviderChargeRequest,
  ProviderChargeResponse,
  ProviderAuthorizationResponse,
  ProviderTransferRequest,
  ProviderTransferResponse,
  ProviderVerifyAccountRequest,
  ProviderVerifyAccountResponse,
  ProviderBalanceResponse,
} from './provider.interface';

@Injectable()
export class InternalProvider implements PaymentProvider {
  name = 'internal';
  private readonly logger = new Logger(InternalProvider.name);

  private readonly banks = [
    { code: '044', name: 'Access Bank' },
    { code: '063', name: 'Access Bank (Diamond)' },
    { code: '035', name: 'ALAT by Wema' },
    { code: '023', name: 'Citibank Nigeria' },
    { code: '063', name: 'Diamond Bank' },
    { code: '050', name: 'Ecobank Nigeria' },
    { code: '084', name: 'Enterprise Bank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '014', name: 'MainStreet Bank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '100', name: 'Suntrust Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' },
  ];

  private readonly binRanges: Record<string, { type: string; bank: string }> = {
    '408408': { type: 'visa', bank: 'GTBank' },
    '408409': { type: 'visa', bank: 'GTBank' },
    '506101': { type: 'verve', bank: 'GTBank' },
    '506102': { type: 'verve', bank: 'Access Bank' },
    '506103': { type: 'verve', bank: 'First Bank' },
    '506104': { type: 'verve', bank: 'UBA' },
    '512345': { type: 'mastercard', bank: 'Zenith Bank' },
    '539983': { type: 'mastercard', bank: 'GTBank' },
    '543210': { type: 'mastercard', bank: 'First Bank' },
  };

  private detectCardType(number: string): { type: string; bank: string } {
    for (const [prefix, info] of Object.entries(this.binRanges)) {
      if (number.startsWith(prefix)) return info;
    }
    const first = number[0];
    if (first === '4') return { type: 'visa', bank: 'International' };
    if (first === '5') return { type: 'mastercard', bank: 'International' };
    if (first === '6') return { type: 'verve', bank: 'International' };
    return { type: 'unknown', bank: 'International' };
  }

  async charge(request: ProviderChargeRequest): Promise<ProviderChargeResponse> {
    this.logger.log(`Processing charge: ${request.reference}`);

    await this.sleep(100);

    const cardInfo = request.card
      ? this.detectCardType(request.card.number)
      : { type: 'tokenized', bank: 'Unknown' };

    const last4 = request.card?.number?.slice(-4) || '0000';
    const fee = Math.round(request.amount * 0.015 * 100) / 100;

    const success = Math.random() > 0.05;

    if (!success) {
      return {
        success: false,
        status: 'failed',
        processorReference: `PROC-${uuidv4()}`,
        amount: request.amount,
        fee: 0,
        gatewayResponse: {
          code: 'declined',
          message: 'Card declined by issuer',
          processor: 'internal',
        },
      };
    }

    return {
      success: true,
      status: 'success',
      processorReference: `PROC-${uuidv4()}`,
      amount: request.amount,
      fee,
      cardType: cardInfo.type,
      last4,
      authCode: `AUTH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      gatewayResponse: {
        code: '00',
        message: 'Approved by financial institution',
        processor: 'internal',
        bank: cardInfo.bank,
      },
    };
  }

  async authorize(request: ProviderChargeRequest): Promise<ProviderAuthorizationResponse> {
    this.logger.log(`Authorizing card: ${request.reference}`);

    await this.sleep(80);

    const cardInfo = request.card
      ? this.detectCardType(request.card.number)
      : { type: 'visa', bank: 'GTBank' };

    const last4 = request.card?.number?.slice(-4) || '0000';

    return {
      success: true,
      authorizationCode: `AUTH-${uuidv4().slice(0, 8).toUpperCase()}`,
      cardType: cardInfo.type,
      last4,
      expMonth: request.card?.expMonth || '12',
      expYear: request.card?.expYear || '30',
      bank: cardInfo.bank,
      reusable: true,
      signature: `sig_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
    };
  }

  async capture(authorizationCode: string, amount: number): Promise<ProviderChargeResponse> {
    this.logger.log(`Capturing authorization: ${authorizationCode}`);
    await this.sleep(100);

    const fee = Math.round(amount * 0.015 * 100) / 100;

    return {
      success: true,
      status: 'success',
      processorReference: `PROC-${uuidv4()}`,
      amount,
      fee,
      cardType: 'visa',
      last4: '4081',
      authCode: authorizationCode,
      gatewayResponse: {
        code: '00',
        message: 'Capture successful',
        processor: 'internal',
      },
    };
  }

  async void(authorizationCode: string): Promise<boolean> {
    this.logger.log(`Voiding authorization: ${authorizationCode}`);
    await this.sleep(50);
    return true;
  }

  async refund(processorReference: string, amount: number): Promise<boolean> {
    this.logger.log(`Processing refund: ${processorReference} - ${amount}`);
    await this.sleep(150);
    return true;
  }

  async transfer(request: ProviderTransferRequest): Promise<ProviderTransferResponse> {
    this.logger.log(`Processing transfer: ${request.reference}`);
    await this.sleep(200);

    const fee = Math.round(request.amount * 0.01 * 100) / 100;
    const success = Math.random() > 0.02;

    return {
      success,
      processorReference: `PROC-${uuidv4()}`,
      status: success ? 'success' : 'failed',
      amount: request.amount,
      fee,
      gatewayResponse: {
        code: success ? '00' : '99',
        message: success ? 'Transfer successful' : 'Transfer failed',
        processor: 'internal',
      },
    };
  }

  async verifyAccount(
    request: ProviderVerifyAccountRequest,
  ): Promise<ProviderVerifyAccountResponse> {
    this.logger.log(`Verifying account: ${request.bankCode}/${request.accountNumber}`);
    await this.sleep(100);

    const bank = this.banks.find((b) => b.code === request.bankCode);

    return {
      success: true,
      accountName: `John Doe`,
      bankCode: request.bankCode,
    };
  }

  async getBalance(currency: string): Promise<ProviderBalanceResponse> {
    return {
      currency,
      availableBalance: 10000000.00,
      ledgerBalance: 10500000.00,
    };
  }

  async listBanks(country: string): Promise<any[]> {
    if (country === 'NG') return this.banks;
    return [
      { code: '044', name: 'Access Bank' },
      { code: '058', name: 'GTBank' },
      { code: '011', name: 'First Bank' },
    ];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
