'use client';

import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatDate, formatEnum } from '@/lib/utils';
import Pagination from '../atoms/Pagination';
import { ClaimsTableData } from '@/lib/types/overview';
import { useOverviewStore } from '@/lib/store/overview.store';
import TableRowSkelton from './skeltons/TableRowSkelton';
import PaginationSkelton from './skeltons/PaginationSkelton';
import ErrorCard from './ErrorCard';
import {
  CLAIMS_TABLE_LOADING_ROWS,
  CLAIM_STATUS_BADGE_CLASS,
} from '@/lib/constants/overview.constants';
import { CircleAlert } from 'lucide-react';
import { ROWS_PER_PAGE_OPTIONS } from '@/lib/constants/global.constants';

export type ClaimsTableProps = {
  tableData: ClaimsTableData;
  onReferenceClick?: (referenceNumber: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
};

export default function ClaimsTable({
  tableData,
  onReferenceClick = () => {},
  isLoading,
  isError,
  className,
}: ClaimsTableProps) {
  const { setPage, setPageSize } = useOverviewStore();
  const { labels, data, pagination } = tableData;
  const { currentPage, pageSize, totalPages } = pagination;
  const hasData = Boolean(data && data.length > 0);
  const loadingRows = Array.from({ length: CLAIMS_TABLE_LOADING_ROWS }, (_, index) => index);

  const renderMessageRow = (title: string, description: string, icon?: ReactNode) => (
    <TableRow className="border-0 flex items-center justify-center w-full h-full">
      <TableCell colSpan={4} className="py-32">
        <ErrorCard
          icon={icon}
          title={title}
          description={description}
          className="border-none shadow-none"
        />
      </TableCell>
    </TableRow>
  );

  const tableBodyContent = isLoading
    ? loadingRows.map((_, index) => (
        <TableRowSkelton key={`claims-row-skeleton-${index}`} index={index} />
      ))
    : isError
      ? renderMessageRow('Unable to load claims', 'Please try again later.')
      : hasData
        ? data.map((row) => (
            <TableRow
              key={row.claimRequestNumber}
              className="border-claims-table-border h-claims-table-row-height"
            >
              <TableCell className="w-claims-number-column">
                <button
                  type="button"
                  onClick={() => onReferenceClick(row.claimRequestNumber)}
                  className="text-claims-management-table-link text-sm cursor-pointer"
                >
                  {row.claimRequestNumber}
                </button>
              </TableCell>
              <TableCell>{formatEnum(row.coverId)}</TableCell>
              <TableCell>{row.claimantName}</TableCell>
              <TableCell>{formatDate(row.createdOn)}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    'border-transparent px-2 py-0.5 text-xs font-medium',
                    CLAIM_STATUS_BADGE_CLASS[row.status],
                  )}
                >
                  {row.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        : renderMessageRow(
            'No claims found',
            'No data found for selected filters',
            <CircleAlert className="size-8" />,
          );

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="border-claims-table-border rounded-claims-table overflow-hidden border">
        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 z-10 bg-claims-table-header-bg">
            <TableRow className="border-claims-table-border h-10">
              <TableHead className="w-claims-number-column">{labels.claimRequestNumber}</TableHead>
              <TableHead>{labels.coverId}</TableHead>
              <TableHead>{labels.claimantName}</TableHead>
              <TableHead>{labels.createdOn}</TableHead>
              <TableHead>{labels.status}</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="overflow-y-auto h-[55vh] always-scrollbar">
          <Table className="table-fixed w-full">
            <TableBody>{tableBodyContent}</TableBody>
          </Table>
        </div>
        {isLoading ? (
          <PaginationSkelton />
        ) : (
          <Pagination
            rowsPerPage={pageSize}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            onRowsPerPageChange={(value) => setPageSize(value)}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(value) => setPage(value)}
          />
        )}
      </div>
    </div>
  );
}
