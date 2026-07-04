import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'status' in data && 'message' in data) {
          return { ...data, timestamp: new Date().toISOString() };
        }
        return {
          status: true,
          message: 'Success',
          data: data ?? null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
