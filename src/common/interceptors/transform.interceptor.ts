// Wraps controller return values into { success: true, data, meta? }.
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse, PaginatedMeta } from '@/common/types/api-response.type';

interface PaginatedPayload<T> {
  data: T[];
  meta: PaginatedMeta;
}

function isPaginatedPayload<T>(value: unknown): value is PaginatedPayload<T> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return Array.isArray(obj.data) && typeof obj.meta === 'object' && obj.meta !== null;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | ApiResponse<T[]>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | ApiResponse<T[]>> {
    return next.handle().pipe(
      map((value) => {
        // Paginated list: service returns { data, meta }
        if (isPaginatedPayload<T>(value)) {
          return {
            success: true as const,
            data: value.data,
            meta: value.meta,
          };
        }

        // Single resource or primitive
        return {
          success: true as const,
          data: value,
        };
      }),
    );
  }
}
