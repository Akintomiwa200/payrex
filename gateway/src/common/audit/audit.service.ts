import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditSeverity } from './audit.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(params: {
    merchantId?: string;
    apiKeyId?: string;
    action: AuditAction;
    severity?: AuditSeverity;
    resource: string;
    resourceId?: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    requestPath?: string;
    duration?: number;
    success?: boolean;
    errorMessage?: string;
  }): Promise<AuditLog> {
    try {
      const entry = this.auditRepo.create({
        merchantId: params.merchantId,
        apiKeyId: params.apiKeyId,
        action: params.action,
        severity: params.severity || AuditSeverity.LOW,
        resource: params.resource,
        resourceId: params.resourceId,
        changes: params.changes,
        metadata: params.metadata,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        requestPath: params.requestPath,
        duration: params.duration,
        success: params.success ?? true,
        errorMessage: params.errorMessage,
      });
      const saved = await this.auditRepo.save(entry);
      if (params.severity === AuditSeverity.CRITICAL || params.severity === AuditSeverity.HIGH) {
        this.logger.warn(`Audit[${params.severity}]: ${params.action} on ${params.resource} ${params.resourceId || ''} by ${params.merchantId || 'anonymous'}`);
      }
      return saved;
    } catch (error: any) {
      this.logger.error(`Failed to write audit log: ${error.message}`);
      throw error;
    }
  }

  async query(params: {
    merchantId?: string;
    action?: AuditAction;
    resource?: string;
    resourceId?: string;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ items: AuditLog[]; total: number }> {
    const query = this.auditRepo.createQueryBuilder('audit');
    
    if (params.merchantId) query.andWhere('audit.merchantId = :merchantId', { merchantId: params.merchantId });
    if (params.action) query.andWhere('audit.action = :action', { action: params.action });
    if (params.resource) query.andWhere('audit.resource = :resource', { resource: params.resource });
    if (params.resourceId) query.andWhere('audit.resourceId = :resourceId', { resourceId: params.resourceId });
    if (params.severity) query.andWhere('audit.severity = :severity', { severity: params.severity });
    if (params.startDate) query.andWhere('audit.createdAt >= :startDate', { startDate: params.startDate });
    if (params.endDate) query.andWhere('audit.createdAt <= :endDate', { endDate: params.endDate });
    
    query.orderBy('audit.createdAt', 'DESC');
    
    const total = await query.getCount();
    const items = await query.skip(params.offset || 0).take(params.limit || 50).getMany();
    
    return { items, total };
  }
}
