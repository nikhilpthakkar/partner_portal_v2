'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/atoms/Pagination';
import { cn } from '@/lib/utils';
import type {
  PolicyEndorsementStatus,
  PolicyEndorsementsTableData,
} from '@/lib/types/policy-management/policyDetails';
import TruncatedTooltipText from '../molecules/TruncatedTooltipText';

type PolicyEndorsementsTableProps = {
  data: PolicyEndorsementsTableData;
  page: number;
  rowsPerPage: number;
  totalPages: number;
  onRowsPerPageChange: (value: number) => void;
  onPageChange: (page: number) => void;
  className?: string;
};

const statusStyles: Record<PolicyEndorsementStatus, string> = {
  Successful:
    'bg-endorse-policy-badge-success-bg text-endorse-policy-badge-success-text border-endorse-policy-badge-success-border',
  Pending:
    'bg-endorse-policy-badge-warning-bg text-endorse-policy-badge-warning-text border-endorse-policy-badge-warning-border',
  Failed: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
};

export default function PolicyEndorsementsTable({
  data,
  page,
  rowsPerPage,
  totalPages,
  onRowsPerPageChange,
  onPageChange,
  className,
}: PolicyEndorsementsTableProps) {
  return (
    <div
      className={cn(
        'border-claims-management-table-border rounded-claims-management-table w-full overflow-hidden border bg-white',
        className,
      )}
    >
      <div className="overflow-hidden border border-transparent">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-claims-management-table-header-bg sticky top-0 z-10">
            <TableRow className="border-claims-management-table-border h-10">
              <TableHead className="uppercase w-width-220">
                <TruncatedTooltipText text={data.labels.type} />
              </TableHead>
              <TableHead className="uppercase">
                <TruncatedTooltipText text={data.labels.applicableFor} />
              </TableHead>
              <TableHead className="uppercase">
                <TruncatedTooltipText text={data.labels.createdBy} />
              </TableHead>
              <TableHead className="uppercase">
                <TruncatedTooltipText text={data.labels.date} />
              </TableHead>
              <TableHead className="uppercase">
                <TruncatedTooltipText text={data.labels.description} />
              </TableHead>
              <TableHead className="text-right uppercase">
                <TruncatedTooltipText text={data.labels.status} />
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="h-[56vh] overflow-y-auto always-scrollbar">
          <Table className="table-fixed w-full">
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.id} className="border-claims-management-table-border h-10">
                  <TableCell className="text-sm w-width-220">
                    <TruncatedTooltipText text={row.type} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <TruncatedTooltipText text={row.applicableFor} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <TruncatedTooltipText text={row.createdBy} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <TruncatedTooltipText text={row.date} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <TruncatedTooltipText text={row.description} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={cn(
                        'border-transparent px-2 py-0.5 text-xs font-medium',
                        statusStyles[row.status],
                      )}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Pagination
        page={page}
        rowsPerPage={rowsPerPage}
        totalPages={totalPages}
        rowsPerPageOptions={data.pagination.rowsPerPageOptions}
        onRowsPerPageChange={onRowsPerPageChange}
        onPageChange={onPageChange}
      />
    </div>
  );
}
