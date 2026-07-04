import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
export class FlutterwaveProvider implements PaymentProvider {
  name = 'flutterwave';
  private readonly logger = new Logger(FlutterwaveProvider.name);
  private readonly baseUrl = 'https://api.flutterwave.com/v3';
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('flutterwave.secretKey') || '';
    this.publicKey = this.configService.get<string>('flutterwave.publicKey') || '';
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async charge(request: ProviderChargeRequest): Promise<ProviderChargeResponse> {
    this.logger.log(`Flutterwave charge: ${request.reference}`);

    const payload: any = {
      tx_ref: request.reference,
      amount: request.amount,
      currency: request.currency || 'NGN',
      email: request.email,
      redirect_url: request.metadata?.redirect_url || '',
      meta: request.metadata || {},
    };

    if (request.card) {
      payload.card = {
        number: request.card.number,
        expirymonth: request.card.expMonth.padStart(2, '0'),
        expiryyear: request.card.expYear,
        cvv: request.card.cvv,
        pin: request.card.pin || undefined,
      };
      payload.client_ip = request.ip || '::1';
    }

    if (request.token) {
      payload.token = request.token;
    }

    try {
      const response = await fetch(`${this.baseUrl}/charges?type=card`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          status: 'success',
          processorReference: data.data?.id?.toString() || request.reference,
          amount: Number(data.data?.amount) || request.amount,
          fee: Number(data.data?.fee) || 0,
          cardType: data.data?.card?.type,
          last4: data.data?.card?.last_4,
          authCode: data.data?.auth_model || '',
          gatewayResponse: data,
        };
      }

      if (data.status === 'pending' && data.meta?.authorization?.mode === 'redirect') {
        return {
          success: false,
          status: 'pending',
          processorReference: data.data?.id?.toString() || request.reference,
          amount: request.amount,
          fee: 0,
          authCode: data.meta.authorization.mode,
          gatewayResponse: data,
        };
      }

      return {
        success: false,
        status: 'failed',
        processorReference: data.data?.id?.toString() || '',
        amount: request.amount,
        fee: 0,
        gatewayResponse: data,
      };
    } catch (error: any) {
      this.logger.error(`Flutterwave charge failed: ${error.message}`);
      return {
        success: false,
        status: 'failed',
        processorReference: '',
        amount: request.amount,
        fee: 0,
        gatewayResponse: { error: error.message },
      };
    }
  }

  async authorize(request: ProviderChargeRequest): Promise<ProviderAuthorizationResponse> {
    const result = await this.charge(request);
    return {
      success: result.success,
      authorizationCode: result.authCode || `AUTH-${Date.now()}`,
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
      const response = await fetch(`${this.baseUrl}/charges/${authorizationCode}/capture`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      return {
        success: data.status === 'success',
        status: data.status,
        processorReference: data.data?.id?.toString() || '',
        amount,
        fee: Number(data.data?.fee) || 0,
        gatewayResponse: data,
      };
    } catch (error: any) {
      return { success: false, status: 'failed', processorReference: '', amount, fee: 0, gatewayResponse: { error: error.message } };
    }
  }

  async void(authorizationCode: string): Promise<boolean> {
    try {
      await fetch(`${this.baseUrl}/charges/${authorizationCode}/void`, { method: 'POST', headers: this.getHeaders() });
      return true;
    } catch {
      return false;
    }
  }

  async refund(processorReference: string, amount: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${processorReference}/refund`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      return data.status === 'success';
    } catch {
      return false;
    }
  }

  async transfer(request: ProviderTransferRequest): Promise<ProviderTransferResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transfers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          account_bank: request.bankCode,
          account_number: request.accountNumber,
          amount: request.amount,
          narration: request.narration || 'Payout',
          currency: request.currency || 'NGN',
          reference: request.reference,
          debit_currency: request.currency || 'NGN',
        }),
      });
      const data = await response.json();

      return {
        success: data.status === 'success',
        processorReference: data.data?.id?.toString() || '',
        status: data.status,
        amount: request.amount,
        fee: Number(data.data?.fee) || 0,
        gatewayResponse: data,
      };
    } catch (error: any) {
      return { success: false, processorReference: '', status: 'failed', amount: request.amount, fee: 0, gatewayResponse: { error: error.message } };
    }
  }

  async verifyAccount(request: ProviderVerifyAccountRequest): Promise<ProviderVerifyAccountResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/resolve?account_number=${request.accountNumber}&account_bank=${request.bankCode}`,
        { headers: this.getHeaders() },
      );
      const data = await response.json();
      return {
        success: data.status === 'success',
        accountName: data.data?.account_name || '',
        bankCode: request.bankCode,
      };
    } catch {
      return { success: false, accountName: '', bankCode: request.bankCode };
    }
  }

  async getBalance(currency: string): Promise<ProviderBalanceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/balances?currency=${currency}`, { headers: this.getHeaders() });
      const data = await response.json();
      return {
        currency,
        availableBalance: Number(data.data?.available_balance) || 0,
        ledgerBalance: Number(data.data?.ledger_balance) || 0,
      };
    } catch {
      return { currency, availableBalance: 0, ledgerBalance: 0 };
    }
  }

  async listBanks(country: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/banks/${country}`, { headers: this.getHeaders() });
      const data = await response.json();
      return data.data?.map((b: any) => ({ code: b.code, name: b.name, country: b.country })) || [];
    } catch {
      return [];
    }
  }
}
