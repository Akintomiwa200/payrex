import { Injectable, Logger } from '@nestjs/common';
import { InternalProvider } from './process-all-provider';
import { FlutterwaveProvider } from './flutterwave-provider';
import { InterswitchProvider } from './interswitch-provider';
import { PaymentProvider } from './provider.interface';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);
  private providers: Map<string, PaymentProvider> = new Map();

  constructor(
    private readonly internalProvider: InternalProvider,
    private readonly flutterwaveProvider: FlutterwaveProvider,
    private readonly interswitchProvider: InterswitchProvider,
  ) {
    this.register('internal', internalProvider);
    this.register('flutterwave', flutterwaveProvider);
    this.register('interswitch', interswitchProvider);
  }

  register(name: string, provider: PaymentProvider): void {
    this.providers.set(name, provider);
    this.logger.log(`Registered payment provider: ${name}`);
  }

  getProvider(name: string = 'internal'): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      this.logger.warn(`Provider ${name} not found, falling back to internal`);
      return this.providers.get('internal')!;
    }
    return provider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
