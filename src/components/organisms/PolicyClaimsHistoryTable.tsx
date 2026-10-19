'use client';

import { Eye, MoreHorizontal, Share2 } from 'lucide-react';
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
import Pagination from '@/components/atoms/Pagination';
import { cn } from '@/lib/utils';
import type {
  PolicyClaimsHistoryRow,
  PolicyClaimsHistoryActionType,
  PolicyClaimsHistoryTable,
} from '@/lib/types/policy-management/policyDetails';
import { mapStatusToClaimStatus, statusStyles } from '@/lib/adapter/overview/claimsTable.adapter';
import TruncatedTooltipText from '@/components/molecules/TruncatedTooltipText';

type PolicyClaimsHistoryTableProps = {
  data: PolicyClaimsHistoryTable;
  page: number;
  rowsPerPage: number;
  totalPages: number;
  onRowsPerPageChange: (value: number) => void;
  onPageChange: (page: number) => void;
  className?: string;
  emptyState?: React.ReactNode;
  onShareClick: (row: PolicyClaimsHistoryRow) => void;
  onViewClick: (row: PolicyClaimsHistoryRow) => void;
};

const actionIcons: Record<PolicyClaimsHistoryActionType, React.ReactNode> = {
  view: <Eye className="h-4 w-4" />,
  share: <Share2 className="h-4 w-4" />,
  more: <MoreHorizontal className="h-4 w-4" />,
};

const actionLabels: Record<PolicyClaimsHistoryActionType, string> = {
  view: 'View claim',
  share: 'Share claim',
  more: 'More actions',
};

export default function PolicyClaimsHistoryTable({
  data,
  page,
  rowsPerPage,
  totalPages,
  onRowsPerPageChange,
  onPageChange,
  className,
  emptyState,
  onShareClick,
  onViewClick,
}: PolicyClaimsHistoryTableProps) {
  const hasRows = data.rows.length > 0;

  return (
    <div
      className={cn(
        'border-claims-management-table-border rounded-claims-management-table w-full overflow-hidden border bg-white',
        className,
      )}
    >
      {hasRows ? (
        <>
          <div className="overflow-hidden border border-transparent">
            <Table className="table-fixed w-full">
              <TableHeader className="bg-claims-management-table-header-bg sticky top-0 z-10">
                <TableRow className="border-claims-management-table-border h-10">
                  <TableHead className="uppercase w-claim-number-column">
                    {data.labels.claimId}
                  </TableHead>
                  <TableHead className="uppercase">
                    <TruncatedTooltipText text={data.labels.date} />
                  </TableHead>
                  <TableHead className="uppercase">
                    <TruncatedTooltipText text={data.labels.amount} />
                  </TableHead>
                  <TableHead className="uppercase">
                    <TruncatedTooltipText text={data.labels.type} />
                  </TableHead>
                  <TableHead className="uppercase">
                    <TruncatedTooltipText text={data.labels.status} />
                  </TableHead>
                  <TableHead className="text-right uppercase">
                    <TruncatedTooltipText text={data.labels.actions} />
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <div className="h-[56vh] overflow-y-auto always-scrollbar">
              <Table className="table-fixed w-full">
                <TableBody>
                  {data.rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-claims-management-table-border h-10 overflow-auto"
                    >
                      <TableCell className="text-sm text-claims-management-table-link w-claim-number-column">
                        <button
                          type="button"
                          onClick={() => onViewClick(row)}
                          className="text-claims-management-table-link text-sm cursor-pointer"
                        >
                          {row.claimId}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm">
                        <TruncatedTooltipText text={row.date} />
                      </TableCell>
                      <TableCell className="text-sm">
                        <TruncatedTooltipText text={row.amount} />
                      </TableCell>
                      <TableCell className="text-sm">
                        <TruncatedTooltipText text={row.type} />
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'border-transparent px-2 py-0.5 text-xs font-medium',
                            statusStyles[mapStatusToClaimStatus(row.status)],
                          )}
                        >
                          {mapStatusToClaimStatus(row.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {row.actions.map((action, index) => (
                            <Button
                              key={`${row.id}-${action.type}-${index}`}
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-recent-searches-action"
                              disabled={action.disabled}
                              aria-label={actionLabels[action.type]}
                              onClick={() => {
                                if (action.type === 'share' && !action.disabled) {
                                  onShareClick(row);
                                }
                                if (action.type === 'view' && !action.disabled) {
                                  onViewClick(row);
                                }
                              }}
                            >
                              {actionIcons[action.type]}
                            </Button>
                          ))}
                        </div>
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
        </>
      ) : (
        <div className="p-4">{emptyState}</div>
      )}
    </div>
  );
}
