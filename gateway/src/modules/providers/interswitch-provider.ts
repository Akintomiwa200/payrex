import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
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
export class InterswitchProvider implements PaymentProvider {
  name = 'interswitch';
  private readonly logger = new Logger(InterswitchProvider.name);

  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly terminalId: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('interswitch.baseUrl') || 'https://api.interswitchgroup.com';
    this.clientId = this.configService.get<string>('interswitch.clientId') || '';
    this.clientSecret = this.configService.get<string>('interswitch.clientSecret') || '';
    this.terminalId = this.configService.get<string>('interswitch.terminalId') || '';
  }

  private generateSignature(httpMethod: string, url: string, body: string, timestamp: string, nonce: string): string {
    const rawSignature = `${httpMethod}&${url}&${timestamp}&${nonce}&${body}&${this.clientSecret}`;
    return crypto.createHash('sha256').update(rawSignature).digest('base64');
  }

  private getHeaders(method: string, endpoint: string, body: any = {}) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(8).toString('base64url');
    const bodyStr = JSON.stringify(body);
    const url = `${this.baseUrl}${endpoint}`;
    const signature = this.generateSignature(method, endpoint, bodyStr, timestamp, nonce);

    return {
      Authorization: `InterswitchAuth ${this.clientId}`,
      Signature: signature,
      Timestamp: timestamp,
      Nonce: nonce,
      TerminalId: this.terminalId,
      'Content-Type': 'application/json',
    };
  }

  async charge(request: ProviderChargeRequest): Promise<ProviderChargeResponse> {
    this.logger.log(`Interswitch charge: ${request.reference}`);

    const payload: any = {
      amount: Math.round(request.amount * 100),
      currency: request.currency || 'NGN',
      customerEmail: request.email,
      transactionRef: request.reference,
      terminalId: this.terminalId,
      pin: request.card?.pin || '',
    };

    if (request.card) {
      payload.pan = request.card.number;
      payload.expiryDate = `${request.card.expMonth}${request.card.expYear}`;
      payload.cvv = request.card.cvv;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v2/transactions/payments`, {
        method: 'POST',
        headers: this.getHeaders('POST', '/api/v2/transactions/payments', payload),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.responseCode === '00' || data.responseCode === '0') {
        return {
          success: true,
          status: 'success',
          processorReference: data.transactionId || request.reference,
          amount: request.amount,
          fee: Number(data.fee) || 0,
          cardType: request.card?.number?.startsWith('4') ? 'visa' : 'mastercard',
          last4: request.card?.number?.slice(-4),
          authCode: data.authCode || '',
          gatewayResponse: data,
        };
      }

      if (data.responseCode === '09') {
        const otpTransactionId = data.otpTransactionId || data.transactionId;
        return {
          success: false,
          status: 'pending',
          processorReference: otpTransactionId || request.reference,
          amount: request.amount,
          fee: 0,
          authCode: `OTP_REQUIRED:${otpTransactionId}`,
          gatewayResponse: data,
        };
      }

      return {
        success: false,
        status: 'failed',
        processorReference: data.transactionId || '',
        amount: request.amount,
        fee: 0,
        gatewayResponse: data,
      };
    } catch (error: any) {
      this.logger.error(`Interswitch charge failed: ${error.message}`);
      return {
        success: false, status: 'failed', processorReference: '', amount: request.amount, fee: 0,
        gatewayResponse: { error: error.message },
      };
    }
  }

  async authorize(request: ProviderChargeRequest): Promise<ProviderAuthorizationResponse> {
    const result = await this.charge(request);
    return {
      success: result.success,
      authorizationCode: result.authCode || '',
      cardType: result.cardType || 'unknown',
      last4: result.last4 || '0000',
      expMonth: request.card?.expMonth || '12',
      expYear: request.card?.expYear || '30',
      bank: '',
      reusable: true,
      signature: `sig_${Date.now().toString(36)}`,
    };
  }

  async capture(authorizationCode: string, amount: number): Promise<ProviderChargeResponse> {
    try {
      const payload = { amount: Math.round(amount * 100), authCode: authorizationCode, terminalId: this.terminalId };
      const response = await fetch(`${this.baseUrl}/api/v2/transactions/capture`, {
        method: 'POST',
        headers: this.getHeaders('POST', '/api/v2/transactions/capture', payload),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return {
        success: data.responseCode === '00',
        status: data.responseCode === '00' ? 'success' : 'failed',
        processorReference: data.transactionId || '',
        amount,
        fee: Number(data.fee) || 0,
        gatewayResponse: data,
      };
    } catch (error: any) {
      return { success: false, status: 'failed', processorReference: '', amount, fee: 0, gatewayResponse: { error: error.message } };
    }
  }

  async void(authorizationCode: string): Promise<boolean> {
    try {
      const payload = { authCode: authorizationCode, terminalId: this.terminalId };
      await fetch(`${this.baseUrl}/api/v2/transactions/void`, {
        method: 'POST',
        headers: this.getHeaders('POST', '/api/v2/transactions/void', payload),
        body: JSON.stringify(payload),
      });
      return true;
    } catch {
      return false;
    }
  }

  async refund(processorReference: string, amount: number): Promise<boolean> {
    try {
      const payload = { transactionId: processorReference, amount: Math.round(amount * 100), terminalId: this.terminalId };
      const response = await fetch(`${this.baseUrl}/api/v2/transactions/refund`, {
        method: 'POST',
        headers: this.getHeaders('POST', '/api/v2/transactions/refund', payload),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return data.responseCode === '00';
    } catch {
      return false;
    }
  }

  async transfer(request: ProviderTransferRequest): Promise<ProviderTransferResponse> {
    try {
      const payload = {
        amount: Math.round(request.amount * 100),
        bankCode: request.bankCode,
        accountNumber: request.accountNumber,
        accountName: request.accountName,
        narration: request.narration || 'Payout',
        transactionRef: request.reference,
        terminalId: this.terminalId,
      };
      const response = await fetch(`${this.baseUrl}/api/v2/transfers`, {
        method: 'POST',
        headers: this.getHeaders('POST', '/api/v2/transfers', payload),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return {
        success: data.responseCode === '00',
        processorReference: data.transactionId || '',
        status: data.responseCode === '00' ? 'success' : 'failed',
        amount: request.amount,
        fee: Number(data.fee) || 0,
        gatewayResponse: data,
      };
    } catch (error: any) {
      return { success: false, processorReference: '', status: 'failed', amount: request.amount, fee: 0, gatewayResponse: { error: error.message } };
    }
  }

  async verifyAccount(request: ProviderVerifyAccountRequest): Promise<ProviderVerifyAccountResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v2/banks/account?accountNumber=${request.accountNumber}&bankCode=${request.bankCode}`,
        { headers: this.getHeaders('GET', `/api/v2/banks/account?accountNumber=${request.accountNumber}&bankCode=${request.bankCode}`) },
      );
      const data = await response.json();
      return {
        success: data.responseCode === '00',
        accountName: data.accountName || '',
        bankCode: request.bankCode,
      };
    } catch {
      return { success: false, accountName: '', bankCode: request.bankCode };
    }
  }

  async getBalance(currency: string): Promise<ProviderBalanceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/merchant/balance?currency=${currency}`, {
        headers: this.getHeaders('GET', `/api/v2/merchant/balance?currency=${currency}`),
      });
      const data = await response.json();
      return { currency, availableBalance: Number(data.availableBalance) || 0, ledgerBalance: Number(data.ledgerBalance) || 0 };
    } catch {
      return { currency, availableBalance: 0, ledgerBalance: 0 };
    }
  }

  async listBanks(country: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/banks?country=${country}`, {
        headers: this.getHeaders('GET', `/api/v2/banks?country=${country}`),
      });
      const data = await response.json();
      return data.banks?.map((b: any) => ({ code: b.bankCode, name: b.bankName })) || [];
    } catch {
      return [];
    }
  }
}
