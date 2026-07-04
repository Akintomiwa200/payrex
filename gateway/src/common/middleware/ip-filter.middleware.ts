import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IpFilterMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IpFilterMiddleware.name);
  private readonly whitelist: string[];
  private readonly blacklist: string[];
  private readonly isEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.isEnabled = configService.get<string>('env') === 'production';
    this.whitelist = (configService.get<string>('security.ipWhitelist') || '').split(',').filter(Boolean);
    this.blacklist = (configService.get<string>('security.ipBlacklist') || '').split(',').filter(Boolean);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    if (!this.isEnabled) {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const clientIp = ip.replace(/^::ffff:/, '');

    if (this.blacklist.includes(clientIp)) {
      this.logger.warn(`Blocked blacklisted IP: ${clientIp}`);
      res.status(403).json({
        status: false,
        message: 'Access denied — your IP is blocked',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (this.whitelist.length > 0 && !this.whitelist.includes(clientIp) && !this.whitelist.includes('*')) {
      this.logger.warn(`Blocked IP not in whitelist: ${clientIp}`);
      res.status(403).json({
        status: false,
        message: 'Access denied — your IP is not whitelisted',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.locals.clientIp = clientIp;
    next();
  }
}
