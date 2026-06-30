// Standard API response envelope types — mirror 02-api-contracts.md.

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginatedMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  };
}
