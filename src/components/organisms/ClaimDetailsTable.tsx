'use client';

import { Download, Eye, Upload } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  ClaimCommunicationStatus,
  ClaimDocumentActionType,
  ClaimDocumentStatus,
  ClaimDocumentRow,
  ClaimCommunicationRow,
} from '@/lib/types/claims-management/claimDetails';
import {
  COMMUNICATION_TABLE_HEADERS,
  DOCUMENTS_TABLE_HEADERS,
} from '@/lib/constants/claimsDetail.constants';
import { useMemo } from 'react';

type ClaimDetailsTableProps =
  | {
      variant: 'documents';
      data: ClaimDocumentRow[];
      className?: string;
      onDocumentAction?: (action: ClaimDocumentActionType, row: ClaimDocumentRow) => void;
    }
  | {
      variant: 'communication';
      data: ClaimCommunicationRow[];
      className?: string;
      onDocumentAction?: (action: ClaimDocumentActionType, row: ClaimDocumentRow) => void;
    };

const documentStatusStyles: Record<ClaimDocumentStatus, string> = {
  Approved:
    'bg-endorse-policy-badge-success-bg text-endorse-policy-badge-success-text border-endorse-policy-badge-success-border',
  'Under evaluation':
    'bg-endorse-policy-badge-warning-bg text-endorse-policy-badge-warning-text border-endorse-policy-badge-warning-border',
  Rejected: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
};

const communicationStatusStyles: Record<ClaimCommunicationStatus, string> = {
  Success: 'bg-recent-searches-status-active-bg text-recent-searches-status-text',
  Failed: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
};

const actionIcons: Record<ClaimDocumentActionType, React.ReactNode> = {
  download: <Download className="h-4 w-4" />,
  view: <Eye className="h-4 w-4" />,
};

const renderDocumentRow = (
  row: ClaimDocumentRow,
  index: number,
  onDocumentAction?: (action: ClaimDocumentActionType, row: ClaimDocumentRow) => void,
) => {
  return (
    <TableRow key={`${row.id}-${index}`} className="border-claims-management-table-border h-10">
      <TableCell className="text-sm">
        <TruncatedTooltipText text={row.label} />
      </TableCell>
      <TableCell className="text-sm">
        <TruncatedTooltipText text={row.uploadedBy} />
      </TableCell>
      <TableCell className="text-sm">
        <TruncatedTooltipText text={row.date} />
      </TableCell>
      <TableCell className="text-sm">
        <TruncatedTooltipText text={row.note} />
      </TableCell>
      <TableCell className="w-width-150">
        <Badge
          className={cn(
            'border-transparent px-2 py-0.5 text-xs font-medium',
            documentStatusStyles[row.status],
          )}
        >
          {row.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          {row.actions.map((action, index) => (
            <Button
              key={`${row.id}-${action.type}-${index}`}
              type="button"
              variant="ghost"
              size="icon"
              disabled={action.disabled}
              className="text-recent-searches-action h-8 w-8"
              onClick={() => onDocumentAction?.(action.type, row)}
            >
              {actionIcons[action.type]}
            </Button>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
};

const renderCommunicationRow = (row: ClaimCommunicationRow) => {
  return (
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
            communicationStatusStyles[row.status],
          )}
        >
          {row.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

export default function ClaimDetailsTable({
  variant,
  data,
  className,
  onDocumentAction,
}: ClaimDetailsTableProps) {
  const headers = useMemo(
    () => (variant === 'documents' ? DOCUMENTS_TABLE_HEADERS : COMMUNICATION_TABLE_HEADERS),
    [variant],
  );

  return (
    <div
      className={cn(
        'border-claims-management-table-border rounded-claims-management-table bg-white w-full overflow-hidden border',
        className,
      )}
    >
      <Table className="table-fixed w-full">
        <TableHeader className="bg-claims-management-table-header-bg sticky top-0 z-10">
          <TableRow className="border-claims-management-table-border h-10">
            {headers.map((header, i) => (
              <TableHead
                key={header.id}
                className={`whitespace-nowrap ${i === headers.length - 1 ? 'text-right' : ''}`}
              >
                <TruncatedTooltipText text={header.label} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      <div className="max-h-[61vh] overflow-y-auto always-scrollbar">
        <Table className="table-fixed w-full caption-bottom text-sm">
          <TableBody>
            {variant === 'documents'
              ? data.map((row, index) => renderDocumentRow(row, index, onDocumentAction))
              : data.map((row) => renderCommunicationRow(row))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
