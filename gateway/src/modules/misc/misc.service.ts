import { Injectable } from '@nestjs/common';
import { InternalProvider } from '../providers/process-all-provider';

@Injectable()
export class MiscService {
  constructor(private provider: InternalProvider) {}

  async listBanks(country: string = 'NG'): Promise<any[]> {
    return this.provider.listBanks(country);
  }

  async verifyAccount(bankCode: string, accountNumber: string): Promise<any> {
    return this.provider.verifyAccount({ bankCode, accountNumber });
  }

  async listCountries(): Promise<any[]> {
    return [
      { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
      { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
      { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
      { code: 'ZA', name: 'South Africa', currency: 'ZAR', flag: '🇿🇦' },
      { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
      { code: 'EU', name: 'Europe', currency: 'EUR', flag: '🇪🇺' },
    ];
  }

  async getProviderStatus(): Promise<any> {
    return {
      provider: 'internal',
      status: 'operational',
      latency: '~100ms',
      supportedChannels: ['card', 'bank_transfer', 'ussd', 'mobile_money'],
      supportedCurrencies: ['NGN', 'USD', 'GBP', 'EUR', 'KES', 'GHS', 'ZAR'],
    };
  }
}
