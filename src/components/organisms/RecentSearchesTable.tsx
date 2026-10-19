'use client';

import { Share2, SquarePen } from 'lucide-react';

import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import Pagination from '../atoms/Pagination';
import { SelectOption } from '@/lib/types/Global';

type RecentSearchRow = {
  id: string;
  policyNumber: string;
  insuredName: string;
  productName: string;
  issuedOn: string;
  status: string;
};

type RecentSearchLabels = {
  policyNumber: string;
  insuredName: string;
  productName: string;
  issuedOn: string;
  status: string;
  actions: string;
};

type RecentSearchesTableProps = {
  tabValue: string;
  onTabChange: (value: string) => void;
  tabs: SelectOption[];
  labels: RecentSearchLabels;
  rows: RecentSearchRow[];
  note: string;
  rowsPerPageValue: number;
  rowsPerPageOptions: number[];
  onRowsPerPageChange: (value: number) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPolicyClick?: (policyNumber: string) => void;
  onEditClick?: (row: RecentSearchRow) => void;
  onShareClick?: (row: RecentSearchRow) => void;
  className?: string;
};

const statusStyles: Record<RecentSearchRow['status'], string> = {
  Active: 'bg-recent-searches-status-active-bg text-recent-searches-status',
  Inactive: 'bg-recent-searches-status-inactive-bg text-recent-searches-status',
};

export default function RecentSearchesTable({
  tabValue,
  onTabChange,
  tabs,
  labels,
  rows,
  note,
  rowsPerPageValue,
  rowsPerPageOptions,
  onRowsPerPageChange,
  page,
  totalPages,
  onPageChange,
  onPolicyClick,
  onEditClick,
  onShareClick,
  className,
}: RecentSearchesTableProps) {
  return (
    <div className={cn('flex w-full flex-col items-end gap-4', className)}>
      <div className="border-recent-searches-border rounded-recent-searches-table overflow-hidden bg-recent-searches-bg w-full border">
        <div className="border-recent-searches-border border-b pt-2">
          <UnderlineTabs value={tabValue} onValueChange={onTabChange} tabs={tabs} />
        </div>
        <div className="overflow-hidden border border-transparent">
          <Table>
            <TableHeader className="bg-recent-searches-header-bg">
              <TableRow className="border-recent-searches-border h-10">
                <TableHead>{labels.policyNumber}</TableHead>
                <TableHead>{labels.insuredName}</TableHead>
                <TableHead>{labels.productName}</TableHead>
                <TableHead>{labels.issuedOn}</TableHead>
                <TableHead>{labels.status}</TableHead>
                <TableHead className="text-right">{labels.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="border-recent-searches-border h-10">
                  <TableCell>
                    {onPolicyClick ? (
                      <button
                        type="button"
                        onClick={() => onPolicyClick(row.policyNumber)}
                        className="text-recent-searches-link text-sm"
                      >
                        {row.policyNumber}
                      </button>
                    ) : (
                      <span className="text-recent-searches-link text-sm">{row.policyNumber}</span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{row.insuredName}</TableCell>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell>{row.issuedOn}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'border-transparent px-2 py-0.5 text-xs font-medium',
                        statusStyles[row.status],
                      )}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditClick?.(row)}
                        className="text-recent-searches-action h-8 w-8"
                      >
                        <SquarePen className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onShareClick?.(row)}
                        className="text-recent-searches-action h-8 w-8"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination
          rowsPerPage={rowsPerPageValue}
          rowsPerPageOptions={rowsPerPageOptions}
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
      <p className="text-recent-searches-note text-sm font-light">{note}</p>
    </div>
  );
}
