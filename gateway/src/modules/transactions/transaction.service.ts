import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionStatus, PaymentChannel, Currency } from './entities/transaction.entity';
import { InitializeTransactionDto } from './dto/initialize-transaction.dto';
import { Customer } from '../customers/entities/customer.entity';
import { Wallet } from '../balance/entities/wallet.entity';
import { BalanceLedger, LedgerEntryType } from '../balance/entities/balance-ledger.entity';
import { InternalProvider } from '../providers/process-all-provider';
import { WebhookService } from '../webhooks/webhook.service';
import { TimelineService } from '../timeline/timeline.service';
import { ErrorCodes, throwPaymentError } from '../../common/errors/error-codes';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(BalanceLedger)
    private ledgerRepo: Repository<BalanceLedger>,
    private provider: InternalProvider,
    private webhookService: WebhookService,
    private timelineService: TimelineService,
    private configService: ConfigService,
  ) {}

  private generateReference(): string {
    return `REF-${uuidv4().slice(0, 8).toUpperCase()}`;
  }

  async initialize(
    merchantId: string,
    dto: InitializeTransactionDto,
  ): Promise<any> {
    const reference = this.generateReference();

    let customer = await this.customerRepo.findOne({
      where: { email: dto.email, merchantId },
    });

    if (!customer) {
      customer = this.customerRepo.create({
        merchantId,
        email: dto.email,
        customerCode: `CUS_${uuidv4().slice(0, 8).toUpperCase()}`,
        metadata: dto.metadata,
      });
      customer = await this.customerRepo.save(customer);
    }

    const transaction = this.transactionRepo.create({
      reference,
      merchantId,
      customerId: customer.id,
      amount: dto.amount,
      currency: dto.currency || Currency.NGN,
      status: TransactionStatus.INITIALIZED,
      channel: dto.channel || undefined,
      metadata: dto.metadata,
      authorizationUrl: `${this.configService.get<string>('coreEngine.url')}/pay/${reference}`,
    });

    await this.transactionRepo.save(transaction);

    await this.timelineService.record(
      merchantId,
      reference,
      'initialized',
      { amount: dto.amount, currency: dto.currency, email: dto.email },
      `Transaction initialized for ${dto.email}`,
    );

    return {
      reference: transaction.reference,
      authorizationUrl: transaction.authorizationUrl,
      accessCode: `ac_${reference.toLowerCase()}`,
    };
  }

  async verify(reference: string, merchantId: string): Promise<any> {
    const transaction = await this.transactionRepo.findOne({
      where: { reference, merchantId },
    });

    if (!transaction) {
      throwPaymentError(ErrorCodes.TRANSACTION_NOT_FOUND);
    }

    const customer = transaction.customerId
      ? await this.customerRepo.findOne({ where: { id: transaction.customerId } })
      : null;

    return {
      id: transaction.id,
      reference: transaction.reference,
      amount: transaction.amount,
      amountCharged: transaction.amountCharged,
      currency: transaction.currency,
      status: transaction.status,
      channel: transaction.channel,
      cardType: transaction.cardType,
      last4: transaction.last4,
      bank: transaction.bankName,
      bankCode: transaction.bankCode,
      ussdCode: transaction.ussdCode,
      fee: transaction.fee,
      paidAt: transaction.paidAt,
      refundedAt: transaction.refundedAt,
      failureReason: transaction.failureReason,
      metadata: transaction.metadata,
      customer: customer ? {
        customerCode: customer.customerCode,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
      } : null,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  async chargeCard(merchantId: string, dto: any): Promise<any> {
    const reference = dto.reference || this.generateReference();

    const transaction = this.transactionRepo.create({
      reference,
      merchantId,
      amount: dto.amount,
      currency: dto.currency || Currency.NGN,
      status: TransactionStatus.PROCESSING,
      channel: PaymentChannel.CARD,
      metadata: dto.metadata,
    });
    await this.transactionRepo.save(transaction);

    await this.timelineService.record(
      merchantId, reference, 'processing',
      { channel: 'card' }, 'Processing card payment',
    );

    const result = await this.provider.charge({
      reference,
      amount: dto.amount,
      currency: dto.currency || 'NGN',
      card: dto.cardNumber ? {
        number: dto.cardNumber,
        expMonth: dto.expMonth,
        expYear: dto.expYear,
        cvv: dto.cvv,
      } : undefined,
      email: dto.email,
      metadata: dto.metadata,
    });

    transaction.status = result.success ? TransactionStatus.SUCCESS : TransactionStatus.FAILED;
    transaction.amountCharged = result.amount;
    transaction.fee = result.fee;
    transaction.cardType = result.cardType;
    transaction.last4 = result.last4;
    transaction.gatewayResponse = result.gatewayResponse;
    transaction.paidAt = result.success ? new Date() : undefined;
    transaction.failureReason = result.success ? undefined : 'Card declined';
    await this.transactionRepo.save(transaction);

    await this.timelineService.record(
      merchantId, reference, result.success ? 'success' : 'failed',
      { fee: result.fee, processorReference: result.processorReference },
      result.success ? 'Payment successful' : 'Payment failed - card declined',
    );

    if (result.success) {
      await this.creditWallet(merchantId, reference, dto.amount, result.fee, dto.currency || 'NGN');
      await this.webhookService.dispatch(merchantId, 'charge.success', {
        event: 'charge.success',
        data: {
          reference,
          amount: dto.amount,
          currency: dto.currency || 'NGN',
          status: 'success',
          fee: result.fee,
          cardType: result.cardType,
          last4: result.last4,
          processorReference: result.processorReference,
          paidAt: transaction.paidAt,
        },
      });
    } else {
      await this.webhookService.dispatch(merchantId, 'charge.failed', {
        event: 'charge.failed',
        data: { reference, amount: dto.amount, status: 'failed', failureReason: 'Card declined' },
      });
    }

    return {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      fee: transaction.fee,
      cardType: transaction.cardType,
      last4: transaction.last4,
      processorReference: result.processorReference,
      message: result.success ? 'Charge successful' : 'Charge failed',
    };
  }

  async chargeBankTransfer(merchantId: string, dto: any): Promise<any> {
    const reference = dto.reference || this.generateReference();

    const transaction = this.transactionRepo.create({
      reference,
      merchantId,
      amount: dto.amount,
      currency: dto.currency || Currency.NGN,
      status: TransactionStatus.PENDING,
      channel: PaymentChannel.BANK_TRANSFER,
      metadata: dto.metadata,
    });
    await this.transactionRepo.save(transaction);

    await this.timelineService.record(
      merchantId, reference, 'initialized',
      { channel: 'bank_transfer' }, 'Bank transfer details generated',
    );

    return {
      reference: transaction.reference,
      status: 'pending',
      message: 'Bank transfer details generated',
      details: {
        bankName: 'Finance Gateway Bank',
        accountNumber: '0123456789',
        accountName: 'Finance Gateway',
        amount: dto.amount,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    };
  }

  async chargeUssd(merchantId: string, dto: any): Promise<any> {
    const reference = dto.reference || this.generateReference();

    const transaction = this.transactionRepo.create({
      reference,
      merchantId,
      amount: dto.amount,
      currency: dto.currency || Currency.NGN,
      status: TransactionStatus.PENDING,
      channel: PaymentChannel.USSD,
      bankCode: dto.bankCode,
      metadata: dto.metadata,
    });
    await this.transactionRepo.save(transaction);

    await this.timelineService.record(
      merchantId, reference, 'initialized',
      { channel: 'ussd', bankCode: dto.bankCode }, 'USSD code generated',
    );

    const ussdMap: Record<string, string> = {
      '058': '*737*5*Amount*Reference#',
      '011': '*770*Amount*Reference#',
      '044': '*322*Amount*Reference#',
      '221': '*909*Amount*Reference#',
      '035': '*945*Amount*Reference#',
    };

    return {
      reference: transaction.reference,
      status: 'pending',
      message: 'USSD code generated',
      ussdCode: ussdMap[dto.bankCode] || '*123*Amount*Reference#',
      bankName: dto.bankCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async list(merchantId: string, query: any): Promise<any> {
    const page = Number(query.page) || 1;
    const perPage = Math.min(Number(query.perPage) || 50, 100);
    const skip = (page - 1) * perPage;

    const where: any = { merchantId };
    if (query.status) where.status = query.status;
    if (query.channel) where.channel = query.channel;
    if (query.currency) where.currency = query.currency;
    if (query.reference) where.reference = query.reference;
    if (query.from || query.to) {
      where.createdAt = {} as any;
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [transactions, total] = await this.transactionRepo.findAndCount({
      where,
      skip,
      take: perPage,
      order: { createdAt: 'DESC' },
    });

    return {
      data: transactions,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        from: query.from || null,
        to: query.to || null,
      },
    };
  }

  async refund(merchantId: string, dto: any): Promise<any> {
    const transaction = await this.transactionRepo.findOne({
      where: { reference: dto.reference, merchantId },
    });

    if (!transaction) throwPaymentError(ErrorCodes.TRANSACTION_NOT_FOUND);

    if (transaction.status !== TransactionStatus.SUCCESS) {
      throwPaymentError(ErrorCodes.CANNOT_REFUND);
    }

    const refundAmount = dto.amount || transaction.amount;
    if (refundAmount > Number(transaction.amount)) {
      throwPaymentError(ErrorCodes.REFUND_AMOUNT_EXCEEDED);
    }

    await this.provider.refund(transaction.gatewayResponse?.processorReference || '', refundAmount);

    transaction.status = TransactionStatus.REFUNDED;
    transaction.refundedAt = new Date();
    transaction.failureReason = dto.reason || 'Refund processed';
    await this.transactionRepo.save(transaction);

    await this.timelineService.record(
      merchantId, dto.reference, 'refunded',
      { refundAmount, reason: dto.reason },
      `Refund of ${refundAmount} processed`,
    );

    const wallet = await this.walletRepo.findOne({ where: { merchantId } });
    if (wallet) {
      const balanceBefore = Number(wallet.balance);
      wallet.balance = balanceBefore - refundAmount;
      await this.walletRepo.save(wallet);

      const ledgerEntry = this.ledgerRepo.create({
        merchantId,
        transactionReference: transaction.reference,
        type: LedgerEntryType.REFUND,
        amount: refundAmount,
        balanceBefore,
        balanceAfter: Number(wallet.balance),
        currency: transaction.currency,
        description: dto.reason || 'Refund',
      });
      await this.ledgerRepo.save(ledgerEntry);
    }

    await this.webhookService.dispatch(merchantId, 'charge.refunded', {
      event: 'charge.refunded',
      data: {
        reference: transaction.reference,
        amount: refundAmount,
        currency: transaction.currency,
        status: 'refunded',
        reason: dto.reason,
        refundedAt: transaction.refundedAt,
      },
    });

    return {
      reference: transaction.reference,
      amount: refundAmount,
      currency: transaction.currency,
      status: 'refunded',
      refundedAt: transaction.refundedAt,
    };
  }

  private async creditWallet(
    merchantId: string,
    reference: string,
    amount: number,
    fee: number,
    currency: string,
  ): Promise<void> {
    let wallet = await this.walletRepo.findOne({ where: { merchantId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ merchantId, currency: currency as any });
      await this.walletRepo.save(wallet);
    }

    const netAmount = amount - fee;
    const balanceBefore = Number(wallet.balance);

    wallet.balance = balanceBefore + netAmount;
    wallet.totalVolume = Number(wallet.totalVolume) + amount;
    await this.walletRepo.save(wallet);

    const ledgerEntry = this.ledgerRepo.create({
      merchantId,
      transactionReference: reference,
      type: LedgerEntryType.CREDIT,
      amount: netAmount,
      balanceBefore,
      balanceAfter: Number(wallet.balance),
      currency: currency as any,
      description: `Payment received: ${reference}`,
    });
    await this.ledgerRepo.save(ledgerEntry);

    if (fee > 0) {
      const feeEntry = this.ledgerRepo.create({
        merchantId,
        transactionReference: reference,
        type: LedgerEntryType.FEE,
        amount: fee,
        balanceBefore: Number(wallet.balance),
        balanceAfter: Number(wallet.balance),
        currency: currency as any,
        description: `Processing fee: ${reference}`,
      });
      await this.ledgerRepo.save(feeEntry);
    }
  }
}
