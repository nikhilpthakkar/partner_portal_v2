import type { ReactNode } from 'react';
import type { Pagination } from '@/lib/types/Global';

/** Consecutive rows with the same `getGroupKey` merge `mergeColumnIds` cells (and optionally checkbox) with one rowspan. */
export type RowMergeConfig<T> = {
  getGroupKey: (row: T) => string;
  /** Column ids to merge (must match `ColumnDef.id`). Typically the date column. */
  mergeColumnIds: string[];
  /** When true, the selection checkbox column uses the same rowspan as the merge group. */
  mergeCheckbox?: boolean;
};

export type ColumnDef<T> = {
  id: string;
  header: string | ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  className?: string;
};

export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  isError?: boolean;
  errorTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonRows?: number;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  getRowId: (row: T) => string;
  className?: string;
  frameClassName?: string;
  scrollContainerClassName?: string;
  paginationClassName?: string;
  stickyHeader?: boolean;
  onRowClick?: (row: T) => void;
  rowMerge?: RowMergeConfig<T>;
  /** `fixed` splits space evenly; `auto` sizes columns to content (default). */
  tableLayout?: 'fixed' | 'auto';
  /** Tighter cell padding for dense tables (e.g. financials). */
  compact?: boolean;
};
