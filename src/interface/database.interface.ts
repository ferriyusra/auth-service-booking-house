export interface IPagination {
  count: number;
  page: number;
  pageSize: number;
  data: any;
}

export interface IQueryParams {
  limit: number;
  page: number;
  query: string;
  column?: string;
  sort?: 'ASC' | 'DESC';
}
