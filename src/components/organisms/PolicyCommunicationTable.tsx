'use client';

import { Badge } from '@/components/ui/badge';
import TruncatedTooltipText from '@/components/molecules/TruncatedTooltipText';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type {
  PolicyCommunicationStatus,
  PolicyCommunicationTable,
} from '@/lib/types/policy-management/policyDetails';

type PolicyCommunicationTableProps = {
  data: PolicyCommunicationTable;
  className?: string;
};

const statusStyles: Record<PolicyCommunicationStatus, string> = {
  Success: 'bg-recent-searches-status-active-bg text-recent-searches-status-text',
  Failed: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
};

export default function PolicyCommunicationTable({
  data,
  className,
}: PolicyCommunicationTableProps) {
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
              <TableHead className="uppercase">
                <TruncatedTooltipText text={data.labels.type} />
              </TableHead>
              <TableHead className="uppercase">
                <TruncatedTooltipText text={data.labels.target} />
              </TableHead>
              <TableHead className="uppercase">
                <TruncatedTooltipText text={data.labels.recipientType} />
              </TableHead>
              <TableHead className="uppercase">
                <TruncatedTooltipText text={data.labels.subject} />
              </TableHead>
              <TableHead className="uppercase">
                <TruncatedTooltipText text={data.labels.date} />
              </TableHead>
              <TableHead className="text-right uppercase">
                <TruncatedTooltipText text={data.labels.status} />
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="max-h-[63vh] overflow-y-auto always-scrollbar">
          <Table className="table-fixed w-full">
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.id} className="border-claims-management-table-border h-10">
                  <TableCell className="text-sm">
                    <TruncatedTooltipText text={row.type} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <TruncatedTooltipText text={row.target} />
                  </TableCell>
                  <TableCell className="text-sm capitalize">{row.recipientType}</TableCell>
                  <TableCell className="text-sm">
                    <TruncatedTooltipText text={row.subject} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <TruncatedTooltipText text={row.date} />
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
    </div>
  );
}
