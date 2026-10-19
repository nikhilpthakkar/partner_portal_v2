import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import SimpleSelect from '../molecules/SimpleSelect';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export type PaginationProps = {
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  onRowsPerPageChange: (value: number) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function Pagination({
  onRowsPerPageChange,
  onPageChange,
  rowsPerPage,
  rowsPerPageOptions,
  page,
  totalPages,
  className,
}: PaginationProps) {
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-end gap-8 border-t border-pagination-border bg-pagination-background px-4 py-3',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-pagination-text">Rows per page</span>
        <div className="w-pagination-select-width">
          <SimpleSelect
            value={rowsPerPage.toString()}
            options={rowsPerPageOptions.map((option) => ({
              label: option.toString(),
              value: option.toString(),
            }))}
            onValueChange={(value) => onRowsPerPageChange(Number(value))}
            className="h-9 px-3 py-2 text-sm font-normal text-pagination-text-muted"
            contentClassName="min-w-pagination-select-width"
          />
        </div>
      </div>
      <span className="text-sm text-pagination-text">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isFirstPage}
          onClick={() => onPageChange(1)}
          className="h-9 w-9"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isFirstPage}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isLastPage}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isLastPage}
          onClick={() => onPageChange(totalPages)}
          className="h-9 w-9"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
