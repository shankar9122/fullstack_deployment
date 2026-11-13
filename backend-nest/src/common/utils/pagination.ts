import { BadRequestException } from '@nestjs/common';
import type { PaginationQueryDto } from '../dto/pagination-query.dto';

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export function resolvePagination({ page = 1, limit = DEFAULT_LIMIT }: PaginationQueryDto) {
  // A limit above the maximum is lowered, not rejected (same as the Express API)
  const effectiveLimit = Math.min(limit, MAX_LIMIT);
  const skip = (page - 1) * effectiveLimit;

  if (!Number.isSafeInteger(skip)) {
    throw new BadRequestException('Page number is too large');
  }

  return { page, limit: effectiveLimit, skip };
}

export function buildPagination(page: number, limit: number, total: number): Pagination {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && page <= totalPages,
  };
}