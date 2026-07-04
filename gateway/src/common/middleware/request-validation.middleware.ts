import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const SQL_INJECTION_PATTERN = /(\b(ALTER|CREATE|DELETE|DROP|EXEC|INSERT|MERGE|SELECT|TRUNCATE|UPDATE|UNION)\b[\s*])/i;
const XSS_PATTERN = /<script[\s>]|javascript:|onerror=|onload=|onclick=/i;
const PATH_TRAVERSAL_PATTERN = /\.\.\/|\.\.\\|~\/|~\\/;
const COMMAND_INJECTION_PATTERN = /[;&|`$]|\b(exec|system|spawn|fork|popen)\b/i;

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestValidationMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const violations: string[] = [];
    const targets = [
      { name: 'query', value: req.query },
      { name: 'body', value: req.body },
      { name: 'params', value: req.params },
    ];

    for (const { name, value } of targets) {
      if (!value) continue;
      this.inspectValue(value, name, violations);
    }

    if (violations.length > 0) {
      this.logger.warn(`Request validation blocked — ${violations[0]} — ${req.method} ${req.url} from ${req.ip}`);
      res.status(400).json({
        status: false,
        message: 'Request contains invalid or prohibited content',
        violations: violations.slice(0, 5),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  }

  private inspectValue(value: any, path: string, violations: string[]): void {
    if (violations.length >= 5) return;
    if (value === null || value === undefined) return;

    if (typeof value === 'string') {
      if (value.length > 10000) {
        violations.push(`Field '${path}' exceeds maximum length (10000)`);
        return;
      }
      if (SQL_INJECTION_PATTERN.test(value)) {
        violations.push(`Field '${path}' contains prohibited SQL keywords`);
      }
      if (XSS_PATTERN.test(value)) {
        violations.push(`Field '${path}' contains prohibited HTML/script content`);
      }
      if (PATH_TRAVERSAL_PATTERN.test(value)) {
        violations.push(`Field '${path}' contains path traversal characters`);
      }
      if (COMMAND_INJECTION_PATTERN.test(value)) {
        violations.push(`Field '${path}' contains command injection characters`);
      }
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length > 100) {
          violations.push(`Array at '${path}' exceeds maximum length (100)`);
          return;
        }
        value.forEach((item, index) => this.inspectValue(item, `${path}[${index}]`, violations));
      } else {
        const keys = Object.keys(value);
        if (keys.length > 50) {
          violations.push(`Object at '${path}' exceeds maximum keys (50)`);
          return;
        }
        for (const key of keys) {
          if (key.startsWith('$') || key.includes('__')) {
            violations.push(`Field '${path}.${key}' has prohibited key pattern`);
          }
          this.inspectValue(value[key], `${path}.${key}`, violations);
        }
      }
    }
  }
}
