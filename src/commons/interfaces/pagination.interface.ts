export interface PaginationMeta {
  total: number;
  page?: number;
  limit?: number;
  offset?: number;
  totalPages?: number;
}

export interface PaginationResponse<T> {
  metadata: PaginationMeta;
  data: T[];
}