import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Finance Gateway API')
    .setDescription(
      'Enterprise payment gateway API — process payments, manage customers, ' +
      'handle subscriptions, split payments, and reconcile transactions. ' +
      'Inspired by Paystack, Flutterwave, and Stripe.',
    )
    .setVersion('1.0.0')
    .setContact('Engineering', 'https://finance-gateway.dev', 'engineering@finance-gateway.dev')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:8080', 'Local development')
    .addServer('https://api.finance-gateway.dev', 'Production')
    .addApiKey(
      { type: 'apiKey', in: 'header', name: 'Authorization', description: 'Bearer sk_live_xxx or sk_test_xxx' },
      'ApiKey',
    )
    .addTag('Transactions', 'Initialize, verify, charge, and refund payments')
    .addTag('Customers', 'Create and manage payment customers')
    .addTag('Subscriptions', 'Recurring billing and subscription plans')
    .addTag('Splits', 'Split payment processing for marketplace platforms')
    .addTag('Webhooks', 'Manage webhook endpoints and event delivery')
    .addTag('Balance', 'Wallet balances, ledger entries, and settlements')
    .addTag('Settlements', 'Batch settlement processing and reconciliation')
    .addTag('Tokens', 'Card tokenization for PCI-compliant recurring billing')
    .addTag('Transfers', 'Single and bulk transfers to recipients')
    .addTag('Disputes', 'Dispute and chargeback management')
    .addTag('3DS', '3D Secure 2.0 authentication')
    .addTag('KYC', 'Know Your Customer verification')
    .addTag('Compliance', 'AML and sanction screening')
    .addTag('Auth', 'API key generation and merchant authentication')
    .addTag('Storage', 'File uploads to Cloudinary/local storage')
    .addTag('Audit', 'Audit trail and activity logs')
    .addTag('Health', 'Service health and readiness checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Finance Gateway API Docs',
  });

  app.enableShutdownHooks();

  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.log(`Gateway running on port ${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
