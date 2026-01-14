import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { IPaginationOptions } from './dto/paginate.dto';
import { Pagination } from './dto/pagination.dto';

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  meta: IPaginationOptions,
): Promise<Pagination<T>> {
  const totalCount = await qb.getCount();
  const totalPages = Math.ceil(totalCount / meta.limit);

  const items = await qb
    .skip((meta.page - 1) * meta.limit)
    .take(meta.limit)
    .getMany();

  return {
    items,
    meta: {
      totalItems: totalCount,
      itemCount: items.length,
      itemsPerPage: meta.limit,
      totalPages,
      currentPage: meta.page,
    },
  };
}
