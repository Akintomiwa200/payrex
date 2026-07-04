import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SENSITIVE_FIELDS = new Set([
  'cardNumber', 'cvv', 'cvc', 'pan', 'pin', 'password', 'secret',
  'token', 'apiKey', 'api_key', 'secretKey', 'secret_key',
  'bvn', 'nin', 'ssn', 'dob', 'dateOfBirth', 'phoneNumber',
  'authorization', 'signature', 'hmac', 'authToken',
]);

@Injectable()
export class DataMaskingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DataMaskingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.maskSensitiveData(data)),
    );
  }

  private maskSensitiveData(data: any, depth = 0): any {
    if (depth > 10 || data === null || data === undefined) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.maskSensitiveData(item, depth + 1));
    }

    if (typeof data === 'object') {
      const masked: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (SENSITIVE_FIELDS.has(key)) {
          masked[key] = this.maskValue(key, value);
        } else if (typeof value === 'object' && value !== null) {
          masked[key] = this.maskSensitiveData(value, depth + 1);
        } else {
          masked[key] = value;
        }
      }
      return masked;
    }

    return data;
  }

  private maskValue(key: string, value: any): string {
    if (typeof value !== 'string') return value;
    const str = String(value);
    if (str.length <= 4) return '****';
    if (key === 'bvn' || key === 'nin' || key === 'ssn') {
      return '***' + str.slice(-4);
    }
    if (key === 'phoneNumber' || key === 'phone') {
      return str.slice(0, 4) + '***' + str.slice(-3);
    }
    if (key === 'email') {
      const [name, domain] = str.split('@');
      return name[0] + '***@' + domain;
    }
    if (key === 'cardNumber' || key === 'pan') {
      return str.slice(0, 6) + '******' + str.slice(-4);
    }
    if (str.length > 8) {
      return str.slice(0, 4) + '****' + str.slice(-4);
    }
    return '****';
  }
}
