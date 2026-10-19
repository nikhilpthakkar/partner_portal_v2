'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import Skeleton from '@/components/ui/skeleton';
import Pagination from '@/components/atoms/Pagination';
import { cn } from '@/lib/utils';
import type { ColumnDef, DataTableProps, RowMergeConfig } from '@/lib/types/dataTable';
import { CircleAlert } from 'lucide-react';
import ErrorCard from '@/components/molecules/ErrorCard';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

type MergeRowMeta = { rowSpan: number; isMergeStart: boolean };

function computeMergeMeta<T>(data: T[], getGroupKey: (row: T) => string): MergeRowMeta[] {
  const meta: MergeRowMeta[] = [];
  let i = 0;
  while (i < data.length) {
    const key = getGroupKey(data[i]);
    let j = i + 1;
    while (j < data.length && getGroupKey(data[j]) === key) j++;
    const span = j - i;
    for (let k = i; k < j; k++) {
      meta[k] = { rowSpan: span, isMergeStart: k === i };
    }
    i = j;
  }
  return meta;
}

function getGroupIndices<T>(
  data: T[],
  rowIndex: number,
  getGroupKey: (row: T) => string,
): number[] {
  const key = getGroupKey(data[rowIndex]);
  let start = rowIndex;
  while (start > 0 && getGroupKey(data[start - 1]) === key) start--;
  let end = rowIndex;
  while (end < data.length - 1 && getGroupKey(data[end + 1]) === key) end++;
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function DataTableSkeleton<T>({
  columns,
  rows,
  selectable,
}: {
  columns: ColumnDef<T>[];
  rows: number;
  selectable?: boolean;
}) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {selectable && (
            <TableCell className="w-8 px-3">
              <Skeleton className="h-4 w-4" />
            </TableCell>
          )}
          {columns.map((col) => (
            <TableCell key={col.id} className={col.className}>
              <Skeleton className="h-4 w-3/4" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export default function DataTable<T>({
  columns,
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isLoading = false,
  isError = false,
  errorTitle,
  emptyTitle = 'No data found',
  emptyDescription = 'No records match your current filters.',
  skeletonRows = 8,
  selectable = false,
  selectedRows,
  onSelectionChange,
  getRowId,
  className,
  frameClassName,
  scrollContainerClassName,
  paginationClassName,
  stickyHeader = true,
  onRowClick,
  rowMerge,
  tableLayout = 'auto',
  compact = false,
}: DataTableProps<T>) {
  const hasData = data.length > 0;
  const isTableReady = !isLoading && !isError && hasData;
  const showEmptyState = !isLoading && !isError && !hasData;
  const cellPadClass = compact ? 'px-2 py-2' : undefined;
  const headPadClass = compact ? 'px-2' : undefined;

  const mergeMeta: MergeRowMeta[] | null =
    rowMerge && hasData ? computeMergeMeta(data, rowMerge.getGroupKey) : null;

  const allSelected = hasData && data.every((row) => selectedRows?.has(getRowId(row)));
  const someSelected = hasData && data.some((row) => selectedRows?.has(getRowId(row)));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    const currentPageIds = data.map(getRowId);
    const currentPageIdSet = new Set(currentPageIds);
    if (allSelected) {
      const next = new Set(selectedRows ?? []);
      currentPageIdSet.forEach((id) => next.delete(id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedRows ?? []);
      currentPageIdSet.forEach((id) => next.add(id));
      onSelectionChange(next);
    }
  };

  const handleSelectRow = (rowId: string) => {
    if (!onSelectionChange || !selectedRows) return;
    const next = new Set(selectedRows);
    if (next.has(rowId)) {
      next.delete(rowId);
    } else {
      next.add(rowId);
    }
    onSelectionChange(next);
  };

  const handleSelectMergeGroup = (rowIndex: number, merge: RowMergeConfig<T>) => {
    if (!onSelectionChange || !selectedRows) return;
    const indices = getGroupIndices(data, rowIndex, merge.getGroupKey);
    const groupIds = indices.map((i) => getRowId(data[i]));
    const allInGroup = groupIds.every((id) => selectedRows.has(id));
    const next = new Set(selectedRows);
    if (allInGroup) {
      groupIds.forEach((id) => next.delete(id));
    } else {
      groupIds.forEach((id) => next.add(id));
    }
    onSelectionChange(next);
  };

  const isRowVisuallySelected = (rowIndex: number, rowId: string) => {
    if (!selectedRows) return false;
    if (!rowMerge?.mergeCheckbox) {
      return selectedRows.has(rowId);
    }
    const indices = getGroupIndices(data, rowIndex, rowMerge.getGroupKey);
    return indices.some((i) => selectedRows.has(getRowId(data[i])));
  };

  const renderCell = (col: ColumnDef<T>, row: T) => {
    if (col.cell) return col.cell(row);
    if (col.accessorKey) return String(row[col.accessorKey] ?? '');
    return null;
  };

  const checkboxColClass = selectable ? 'w-10 px-3 border-r border-border' : undefined;

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('rounded-lg border border-border bg-white overflow-hidden', frameClassName)}
      >
        <div className={cn('overflow-auto border-b border-border', scrollContainerClassName)}>
          <Table
            className={cn(
              'w-full',
              tableLayout === 'fixed' ? 'table-fixed' : 'table-auto w-max min-w-full',
              rowMerge && 'border-collapse',
            )}
          >
            <TableHeader
              className={cn('bg-claims-table-header-bg', stickyHeader && 'sticky top-0 z-20')}
            >
              <TableRow className="h-10 border-b border-border">
                {selectable && (
                  <TableHead className={cn(checkboxColClass, headPadClass)}>
                    <Checkbox
                      checked={allSelected}
                      data-indeterminate={someSelected && !allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows on this page"
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead
                    key={col.id}
                    style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                    className={cn(
                      'text-muted-foreground',
                      headPadClass,
                      col.align === 'right' && 'text-right',
                      typeof col.header === 'string' && 'whitespace-nowrap',
                      col.align === 'center' && 'text-center',
                      col.className,
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {isLoading && (
              <DataTableSkeleton columns={columns} rows={skeletonRows} selectable={selectable} />
            )}

            {isTableReady && mergeMeta && (
              <TableBody>
                {data.map((row, rowIndex) => {
                  const rowId = getRowId(row);
                  const mm = mergeMeta[rowIndex];
                  const isSelected = isRowVisuallySelected(rowIndex, rowId);

                  const showCheckboxCell =
                    selectable &&
                    (!rowMerge?.mergeCheckbox || (rowMerge.mergeCheckbox && mm.isMergeStart));
                  const checkboxRowSpan =
                    rowMerge?.mergeCheckbox && mm.isMergeStart && mm.rowSpan > 1
                      ? mm.rowSpan
                      : undefined;

                  const groupIdsForCheckbox =
                    rowMerge?.mergeCheckbox && selectedRows
                      ? getGroupIndices(data, rowIndex, rowMerge.getGroupKey).map((i) =>
                          getRowId(data[i]),
                        )
                      : [rowId];
                  const allGroupChecked =
                    Boolean(rowMerge?.mergeCheckbox) &&
                    groupIdsForCheckbox.every((id) => selectedRows?.has(id));
                  const someGroupChecked =
                    Boolean(rowMerge?.mergeCheckbox) &&
                    groupIdsForCheckbox.some((id) => selectedRows?.has(id));

                  const checkboxChecked: boolean | 'indeterminate' = rowMerge?.mergeCheckbox
                    ? allGroupChecked
                      ? true
                      : someGroupChecked
                        ? 'indeterminate'
                        : false
                    : (selectedRows?.has(rowId) ?? false);

                  return (
                    <TableRow
                      key={rowId}
                      className={cn(
                        'border-b border-border',
                        isSelected && 'bg-multi-select-accent-bg',
                        onRowClick && 'cursor-pointer',
                        !isSelected && onRowClick && 'hover:bg-muted/50',
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {showCheckboxCell && (
                        <TableCell
                          className={cn(checkboxColClass, 'align-middle', cellPadClass)}
                          rowSpan={checkboxRowSpan}
                        >
                          <Checkbox
                            checked={checkboxChecked}
                            onCheckedChange={() =>
                              rowMerge?.mergeCheckbox
                                ? handleSelectMergeGroup(rowIndex, rowMerge)
                                : handleSelectRow(rowId)
                            }
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select row ${rowId}`}
                          />
                        </TableCell>
                      )}
                      {columns.map((col) => {
                        if (
                          rowMerge &&
                          rowMerge.mergeColumnIds.includes(col.id) &&
                          !mm.isMergeStart
                        ) {
                          return null;
                        }
                        const colRowSpan =
                          rowMerge &&
                          rowMerge.mergeColumnIds.includes(col.id) &&
                          mm.isMergeStart &&
                          mm.rowSpan > 1
                            ? mm.rowSpan
                            : undefined;

                        return (
                          <TableCell
                            key={col.id}
                            rowSpan={colRowSpan}
                            className={cn(
                              'align-middle',
                              cellPadClass,
                              col.align === 'right' && 'text-right',
                              col.align === 'center' && 'text-center',
                              col.className,
                            )}
                          >
                            {renderCell(col, row)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
            {isTableReady && !mergeMeta && (
              <TableBody>
                {data.map((row) => {
                  const rowId = getRowId(row);
                  const isSelected = selectedRows?.has(rowId) ?? false;

                  return (
                    <TableRow
                      key={rowId}
                      className={cn(
                        'border-b border-border',
                        isSelected && 'bg-multi-select-accent-bg',
                        onRowClick && 'cursor-pointer',
                        !isSelected && onRowClick && 'hover:bg-muted/50',
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <TableCell className={cn(checkboxColClass, cellPadClass)}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectRow(rowId)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select row ${rowId}`}
                          />
                        </TableCell>
                      )}
                      {columns.map((col) => (
                        <TableCell
                          key={col.id}
                          className={cn(
                            cellPadClass,
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                            col.className,
                          )}
                        >
                          {renderCell(col, row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </div>

        {isError && (
          <div className="flex items-center justify-center px-4 py-20 min-h-[300px]">
            <ErrorCard title={errorTitle} className="border-none shadow-none" />
          </div>
        )}

        {showEmptyState && (
          <div className="flex items-center justify-center px-4 py-20 min-h-[300px]">
            <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
              <div className="bg-card border-border shadow-xs flex size-12 items-center justify-center rounded-md border">
                <CircleAlert className="text-foreground size-6" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-foreground text-xl font-semibold">{emptyTitle}</p>
                <p className="text-sm text-muted-foreground">{emptyDescription}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {pagination && !isLoading && !isError && (
        <div className={paginationClassName}>
          <Pagination
            rowsPerPage={pagination.pageSize}
            rowsPerPageOptions={pageSizeOptions}
            onRowsPerPageChange={(value) => onPageSizeChange?.(value)}
            page={pagination.currentPage}
            totalPages={Math.max(1, pagination.totalPages || 1)}
            onPageChange={(value) => onPageChange?.(value)}
          />
        </div>
      )}
    </div>
  );
}
