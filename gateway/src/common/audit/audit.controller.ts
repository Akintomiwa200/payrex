import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditAction, AuditSeverity } from './audit.entity';
import { CurrentMerchant } from '../decorators/current-merchant.decorator';

@ApiTags('Audit')
@ApiSecurity('ApiKey')
@Controller({ path: 'audit', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Query audit logs', description: 'Retrieve audit trail filtered by merchant, action, resource, severity, and date range.' })
  @ApiQuery({ name: 'action', enum: AuditAction, required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'resourceId', required: false })
  @ApiQuery({ name: 'severity', enum: AuditSeverity, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async getAuditLogs(
    @CurrentMerchant('id') merchantId: string,
    @Query('action') action?: AuditAction,
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
    @Query('severity') severity?: AuditSeverity,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const result = await this.auditService.query({
      merchantId,
      action,
      resource,
      resourceId,
      severity,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: Math.min(limit || 50, 200),
      offset: offset || 0,
    });
    return { status: true, message: 'Audit logs retrieved', data: result };
  }
}
