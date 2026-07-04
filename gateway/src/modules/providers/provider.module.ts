import { Global, Module } from '@nestjs/common';
import { InternalProvider } from './process-all-provider';
import { FlutterwaveProvider } from './flutterwave-provider';
import { InterswitchProvider } from './interswitch-provider';
import { ProviderService } from './provider.service';

@Global()
@Module({
  providers: [
    InternalProvider,
    FlutterwaveProvider,
    InterswitchProvider,
    ProviderService,
  ],
  exports: [
    InternalProvider,
    FlutterwaveProvider,
    InterswitchProvider,
    ProviderService,
  ],
})
export class ProviderModule {}
