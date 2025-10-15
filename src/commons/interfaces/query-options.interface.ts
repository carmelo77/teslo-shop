import { FindOptionsWhere, FindOptionsOrder } from 'typeorm';

export interface QueryOptions<T> {
  searchFields?: (keyof T | string)[];
  defaultSortField?: keyof T | string;
  allowedSortFields?: (keyof T | string)[];
}

export interface BuildQueryResult<T> {
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  order?: FindOptionsOrder<T>;
  take?: number;
  skip?: number;
  relations?: string[];
}
