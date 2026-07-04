import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyKey } from './idempotency.entity';
import { ErrorCodes, throwPaymentError } from '../../common/errors/error-codes';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyRepo: Repository<IdempotencyKey>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const idempotencyKey = req.headers['idempotency-key'] as string;

    if (!idempotencyKey || !['POST', 'PATCH'].includes(req.method)) {
      next();
      return;
    }

    const existing = await this.idempotencyRepo.findOne({
      where: { key: idempotencyKey },
    });

    if (existing) {
      if (
        existing.method !== req.method ||
        existing.path !== req.originalUrl
      ) {
        throwPaymentError(ErrorCodes.IDEMPOTENCY_KEY_REUSED);
      }

      res.status(existing.statusCode).json(existing.responseBody);
      return;
    }

    const originalJson = res.json.bind(res);
    const wrappedJson = async (body: any) => {
      const merchantId = (req as any).merchant?.id || 'unknown';
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      try {
        await this.idempotencyRepo.upsert(
          {
            key: idempotencyKey,
            merchantId,
            method: req.method,
            path: req.originalUrl,
            requestBody: req.body,
            responseBody: body,
            statusCode: res.statusCode,
            expiresAt,
          },
          ['key'],
        );
      } catch {}

      return originalJson(body);
    };

    (res.json as any) = wrappedJson;

    next();
  }
}
