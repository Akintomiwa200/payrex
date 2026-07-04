import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import {
  ThreeDSAuthentication,
  ThreeDSStatus,
  ThreeDSVersion,
} from './entities/threeds-authentication.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { InternalProvider } from '../providers/process-all-provider';
import { TimelineService } from '../timeline/timeline.service';
import { ErrorCodes, throwPaymentError } from '../../common/errors/error-codes';

@Injectable()
export class ThreeDSService {
  private readonly logger = new Logger(ThreeDSService.name);

  constructor(
    @InjectRepository(ThreeDSAuthentication)
    private threeDSRepo: Repository<ThreeDSAuthentication>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private provider: InternalProvider,
    private timelineService: TimelineService,
  ) {}

  async initiate(
    merchantId: string,
    dto: {
      reference: string;
      cardNumber: string;
      expMonth: string;
      expYear: string;
      callbackUrl: string;
      metadata?: Record<string, any>;
    },
  ): Promise<any> {
    const transaction = await this.transactionRepo.findOne({
      where: { reference: dto.reference, merchantId },
    });
    if (!transaction) throwPaymentError(ErrorCodes.TRANSACTION_NOT_FOUND);

    const threeDSServerTransId = `3ds-${uuidv4()}`;

    const threeDS = this.threeDSRepo.create({
      merchantId,
      transactionReference: dto.reference,
      threeDSServerTransId,
      version: ThreeDSVersion.V2,
      status: ThreeDSStatus.INITIATED,
      metadata: {
        cardNumber: dto.cardNumber.slice(-4),
        callbackUrl: dto.callbackUrl,
        ...dto.metadata,
      },
    });
    await this.threeDSRepo.save(threeDS);

    await this.timelineService.record(
      merchantId,
      dto.reference,
      '3ds_initiated',
      { threeDSServerTransId, version: '2.0' },
      '3D Secure authentication initiated',
    );

    const acsUrl = `https://acs.simulator/finance-gateway/${threeDSServerTransId}`;
    const creq = crypto
      .createHash('sha256')
      .update(threeDSServerTransId + Date.now())
      .digest('base64url');

    threeDS.acsUrl = acsUrl;
    threeDS.status = ThreeDSStatus.CHALLENGE_REQUIRED;
    threeDS.authenticationData = {
      creq,
      acsUrl,
      threeDSServerTransId,
      messageVersion: '2.1.0',
      messageType: 'CReq',
    };
    await this.threeDSRepo.save(threeDS);

    return {
      threeDSServerTransId: threeDS.threeDSServerTransId,
      version: threeDS.version,
      acsUrl: threeDS.acsUrl,
      creq,
      authenticationData: threeDS.authenticationData,
    };
  }

  async handleCallback(
    merchantId: string,
    dto: { threeDSServerTransId: string; cres: string; additionalData?: Record<string, any> },
  ): Promise<any> {
    const threeDS = await this.threeDSRepo.findOne({
      where: { threeDSServerTransId: dto.threeDSServerTransId },
    });
    if (!threeDS) throwPaymentError(ErrorCodes.TRANSACTION_NOT_FOUND);

    threeDS.status = ThreeDSStatus.CHALLENGE_COMPLETE;
    threeDS.authenticationData = {
      ...(threeDS.authenticationData || {}),
      cres: dto.cres,
      callbackData: dto.additionalData,
    };
    await this.threeDSRepo.save(threeDS);

    const success = this.simulateACSAuth(dto.cres);

    if (success) {
      threeDS.status = ThreeDSStatus.AUTHENTICATED;
      threeDS.eci = '05';
      threeDS.cavv = crypto.randomBytes(20).toString('hex');
      threeDS.xid = crypto.randomBytes(16).toString('hex');
      threeDS.authenticationValue = crypto.randomBytes(8).toString('hex');
      threeDS.authenticatedAt = new Date();
      await this.threeDSRepo.save(threeDS);

      const transaction = await this.transactionRepo.findOne({
        where: { reference: threeDS.transactionReference },
      });
      if (transaction) {
        transaction.metadata = {
          ...(transaction.metadata || {}),
          threeDS: {
            status: 'authenticated',
            eci: threeDS.eci,
            cavv: threeDS.cavv,
            xid: threeDS.xid,
            threeDSServerTransId: threeDS.threeDSServerTransId,
          },
        };
        await this.transactionRepo.save(transaction);
      }

      await this.timelineService.record(
        merchantId,
        threeDS.transactionReference,
        '3ds_authenticated',
        { eci: threeDS.eci, cavv: threeDS.cavv?.slice(0, 8) },
        '3D Secure authentication successful',
      );
    } else {
      threeDS.status = ThreeDSStatus.DECLINED;
      threeDS.statusReason = 'Authentication failed';
      await this.threeDSRepo.save(threeDS);

      await this.timelineService.record(
        merchantId,
        threeDS.transactionReference,
        '3ds_failed',
        { reason: 'Authentication declined by card issuer' },
        '3D Secure authentication declined',
      );
    }

    return {
      threeDSServerTransId: threeDS.threeDSServerTransId,
      status: threeDS.status,
      eci: threeDS.eci,
      cavv: threeDS.cavv,
      xid: threeDS.xid,
      authenticationValue: threeDS.authenticationValue,
      authenticatedAt: threeDS.authenticatedAt,
    };
  }

  async getStatus(merchantId: string, transactionReference: string): Promise<any> {
    const threeDS = await this.threeDSRepo.findOne({
      where: { transactionReference, merchantId },
    });
    if (!threeDS) throwPaymentError(ErrorCodes.TRANSACTION_NOT_FOUND);

    return threeDS;
  }

  private simulateACSAuth(cres: string): boolean {
    return cres.length > 10;
  }
}
