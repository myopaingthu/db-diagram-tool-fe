export interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export interface PaginationParams {
  offset?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

