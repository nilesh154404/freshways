import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { IPaginationOptions } from './dto/paginate.dto';
import { Pagination } from './dto/pagination.dto';
export declare function paginate<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, meta: IPaginationOptions): Promise<Pagination<T>>;
