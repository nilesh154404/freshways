import { SelectQueryBuilder, ObjectLiteral, Repository, FindManyOptions } from 'typeorm';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Parse and validate ?page= and ?limit= query params.
 * Defaults: page=1, limit=20.
 * Cap: limit <= 50.
 * Ignores negative, zero or non-numeric values and falls back to defaults.
 */
export function parsePaginationParams(query?: {
  page?: any;
  limit?: any;
}): { page: number; limit: number } {
  let page = parseInt(query?.page, 10);
  let limit = parseInt(query?.limit, 10);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = 20;
  if (limit > 50) limit = 50;

  return { page, limit };
}

/**
 * Build standard paginated response envelope:
 * {
 *   "data": [...],
 *   "pagination": { "page": 1, "limit": 20, "total": 340, "totalPages": 17, "hasNext": true, "hasPrev": false }
 * }
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };

  // Non-enumerable alias for legacy frontend callers expecting .items
  // (does not show up in JSON.stringify() output)
  Object.defineProperty(response, 'items', {
    get() {
      return this.data;
    },
    enumerable: false,
    configurable: true,
  });

  return response;
}

/**
 * Paginate a TypeORM QueryBuilder.
 * Applies skip/take, runs count, returns standard response envelope.
 */
export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  query?: { page?: any; limit?: any },
): Promise<PaginatedResponse<T>> {
  const { page, limit } = parsePaginationParams(query);

  const total = await qb.getCount();
  const data = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

  return createPaginatedResponse(data, total, page, limit);
}

/**
 * Paginate a plain TypeORM Repository using findAndCount.
 */
export async function paginateRepo<T extends ObjectLiteral>(
  repo: Repository<T>,
  query?: { page?: any; limit?: any },
  findOptions: FindManyOptions<T> = {},
): Promise<PaginatedResponse<T>> {
  const { page, limit } = parsePaginationParams(query);

  const [data, total] = await repo.findAndCount({
    ...findOptions,
    skip: (page - 1) * limit,
    take: limit,
  });

  return createPaginatedResponse(data, total, page, limit);
}

/**
 * Paginate an in-memory array.
 */
export function paginateArray<T>(
  items: T[],
  query?: { page?: any; limit?: any },
): PaginatedResponse<T> {
  const { page, limit } = parsePaginationParams(query);
  const total = items.length;
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  return createPaginatedResponse(data, total, page, limit);
}
