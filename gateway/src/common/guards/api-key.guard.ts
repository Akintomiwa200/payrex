import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../modules/auth/entities/api-key.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const apiKeyValue = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!apiKeyValue) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const apiKey = await this.apiKeyRepository.findOne({
      where: { key: apiKeyValue, isActive: true },
      relations: { merchant: true },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid or inactive API key');
    }

    request.merchant = apiKey.merchant;
    request.apiKey = apiKey;
    return true;
  }
}
