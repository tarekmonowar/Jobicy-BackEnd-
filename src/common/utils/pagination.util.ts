// Pagination metadata builder for list endpoints.
import { PaginatedMeta } from '@/common/types/api-response.type';

/**
 * Builds pagination meta from total count and current page/limit.
 */
export function buildMeta(
  total: number,
  page: number,
  limit: number,
): PaginatedMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
  };
}
