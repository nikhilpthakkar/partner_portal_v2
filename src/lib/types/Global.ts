export type ApiResponse<T, F> = {
  data: T;
  meta: {
    filters: F;
    timestamp: Date | string;
    traceId: string;
    errors: string[];
  };
};

export type ApiErrorResponse = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  message: string;
  code: string;
  action: string;
  traceId: string;
  timestamp: Date | string;
};

export type SelectOption<T = string> = {
  label: string;
  value: T;
};

/** Section label + leaf options (nested / grouped action pickers). */
export type SelectOptionGroup<T = string> = {
  groupLabel: string;
  options: SelectOption<T>[];
};

export type Pagination = {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
};
