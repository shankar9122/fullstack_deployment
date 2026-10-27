import { AppError } from './AppError.js';

export const MAX_LIMIT = 100;

export function parsePagination(query, defaultLimit = 10) {
  const page = Number(query.page ?? 1);
  const requestedLimit = Number(query.limit ?? defaultLimit);

  if (!Number.isSafeInteger(page) || !Number.isSafeInteger(requestedLimit) || page <= 0 || requestedLimit <= 0) {
    throw new AppError('Invalid pagination parameters', 400);
  }

  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;

  if (!Number.isSafeInteger(skip)) {
    throw new AppError('Page number is too large', 400);
  }

  return { page, limit, skip };
}

export function buildPagination({ page, limit, total }) {
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
