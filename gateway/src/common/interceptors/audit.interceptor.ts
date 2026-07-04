import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditSeverity } from '../audit/audit.entity';

const METHOD_ACTION_MAP: Record<string, AuditAction> = {
  POST: AuditAction.CREATE,
  GET: AuditAction.READ,
  PUT: AuditAction.UPDATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

const SENSITIVE_SEVERITY_MAP: Record<string, AuditSeverity> = {
  '/api/v1/transactions': AuditSeverity.MEDIUM,
  '/api/v1/transfers': AuditSeverity.HIGH,
  '/api/v1/payouts': AuditSeverity.HIGH,
  '/api/v1/refunds': AuditSeverity.HIGH,
  '/api/v1/kyc': AuditSeverity.HIGH,
  '/api/v1/compliance': AuditSeverity.CRITICAL,
  '/api/v1/auth': AuditSeverity.HIGH,
  '/api/v1/settlements': AuditSeverity.MEDIUM,
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.route?.path || request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const action = METHOD_ACTION_MAP[method] || AuditAction.API_CALL;
        const severity = this.getSeverity(url);

        this.auditService.log({
          merchantId: request.merchant?.id,
          apiKeyId: request.apiKey?.id,
          action,
          severity,
          resource: url,
          resourceId: request.params?.id || request.params?.reference,
          metadata: {
            method,
            query: request.query,
            body: method === 'GET' ? undefined : this.sanitizeBody(request.body),
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          requestPath: request.originalUrl,
          duration,
          success: true,
        }).catch((err) => this.logger.warn(`Audit log write failed: ${err.message}`));
      }),
    );
  }

  private getSeverity(url: string): AuditSeverity {
    for (const [path, severity] of Object.entries(SENSITIVE_SEVERITY_MAP)) {
      if (url.startsWith(path)) return severity;
    }
    return AuditSeverity.LOW;
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined;
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.cardNumber;
    delete sanitized.cvv;
    delete sanitized.pin;
    return sanitized;
  }
}
