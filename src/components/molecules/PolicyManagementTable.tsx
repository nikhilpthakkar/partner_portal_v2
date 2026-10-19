'use client';

import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ErrorCard from '@/components/molecules/ErrorCard';
import PolicyManagementTableSkelton from '@/components/molecules/skeltons/PolicyManagementTableSkelton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, downloadFileFromUrl, formatEnum } from '@/lib/utils';
import type { SelectOption } from '@/lib/types/Global';
import type { PolicyTableRow, PolicyTableLabels } from '@/lib/types/policy-management';
import { CircleAlert, Download, Share2, SquarePen } from 'lucide-react';
import TruncatedTooltipText from '@/components/molecules/TruncatedTooltipText';
import { PermissionGate } from '../atoms/PermissionGate';
import { ENDORSE_ACTION_PERMISSIONS } from '@/lib/constants/auth.constants';
import { segmentPartnerBaseFromPartner } from '@/lib/segment/partnerBase';
import { trackPolicyManagementTableDownloadCertificate } from '@/lib/segment/track/policy';

type PolicyManagementTableProps = {
  lob: string;
  partnerId: string;
  productIds: string[];
  tabs: SelectOption[];
  activeTableTab: string;
  onTableTabChange: (value: string) => void;
  tableRows: PolicyTableRow[];
  labels: PolicyTableLabels;
  className?: string;
  onPolicyClick?: (policyNumber: string) => void;
  onShareClick?: (row: PolicyTableRow) => void;
  onEndorseClick?: (row: PolicyTableRow) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorTitle?: string;
  showTopTabs?: boolean;
};

export const statusStyles: Record<string, string> = {
  active:
    'bg-endorse-policy-badge-success-bg text-endorse-policy-badge-success-text border-endorse-policy-badge-success-border',
  expired: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
  inactive: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
  cancelled: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
  preclosed: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
};

export default function PolicyManagementTable({
  lob,
  partnerId,
  productIds,
  tableRows,
  tabs,
  activeTableTab,
  onTableTabChange,
  labels,
  className,
  onPolicyClick = () => {},
  onShareClick,
  onEndorseClick,
  isLoading = false,
  isError = false,
  errorTitle,
  showTopTabs = false,
}: PolicyManagementTableProps) {
  const hasRows = tableRows.length > 0;
  const isTableReady = !isLoading && !isError && hasRows;
  const showEmptyState = !isLoading && !isError && !hasRows;

  const renderHeader = () => (
    <Table className="table-fixed w-full">
      <TableHeader className="sticky top-0 z-20 bg-claims-management-table-header-bg">
        <TableRow className="border-claims-table-border h-10">
          <TableHead className="w-policy-number-column">{labels.policyNumber}</TableHead>
          <TableHead>
            <TruncatedTooltipText text={labels.insuredName} />
          </TableHead>
          <TableHead>
            <TruncatedTooltipText text={labels.customerPhone} />
          </TableHead>
          <TableHead>
            <TruncatedTooltipText text={labels.productName} />
          </TableHead>
          <TableHead>
            <TruncatedTooltipText text={labels.issuedOn} />
          </TableHead>
          <TableHead className="w-width-150">{labels.status}</TableHead>
          <TableHead className="text-right">
            <TruncatedTooltipText text={labels.actions} />
          </TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  );

  const renderSkeletonRows = () => <PolicyManagementTableSkelton />;

  const renderErrorState = () => (
    <div
      className={cn(
        'flex items-center justify-center px-4 py-20 min-h-[41vh]',
        !showTopTabs && 'min-h-[50vh]',
      )}
    >
      <ErrorCard title={errorTitle} className="border-none shadow-none" />
    </div>
  );

  const handleDownloadClick = (row: PolicyTableRow) => {
    if (row.certificatePdf) {
      trackPolicyManagementTableDownloadCertificate(
        segmentPartnerBaseFromPartner(lob, partnerId, productIds),
        row?.policyNumber || '',
      );

      try {
        downloadFileFromUrl(row?.certificatePdf, 'policy-certificate.pdf');
        toast.success('Policy certificate download started');
      } catch {
        toast.error('Failed to download policy certificate');
      }
    } else {
      toast.error('Policy certificate is not available');
    }
  };

  const renderRows = () => (
    <div className={cn('h-[41vh] overflow-y-auto always-scrollbar', !showTopTabs && 'h-[50vh]')}>
      <Table className="table-fixed w-full">
        <TableBody>
          {tableRows.map((row) => (
            <TableRow key={row.id} className="border-claims-management-table-border">
              <TableCell className="text-claims-management-table-link text-sm w-policy-number-column">
                <button
                  className="cursor-pointer"
                  type="button"
                  onClick={() => onPolicyClick(row.policyNumber)}
                >
                  {row.policyNumber}
                </button>
              </TableCell>

              <TableCell className="text-sm">
                <TruncatedTooltipText text={row.insuredName} />
              </TableCell>
              <TableCell className="text-sm">
                <TruncatedTooltipText text={row.customerPhone} />
              </TableCell>
              <TableCell className="text-sm ">
                <TruncatedTooltipText text={formatEnum(row.productName)} />
              </TableCell>
              <TableCell className="text-sm">
                <TruncatedTooltipText text={row.issuedOn} />
              </TableCell>
              <TableCell className="w-width-150">
                <Badge
                  className={cn(
                    'border-transparent px-2 py-0.5 text-xs font-medium capitalize',
                    statusStyles[row.status],
                  )}
                >
                  {row.status as string}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 text-recent-searches-action"
                    aria-label="Download policy"
                    onClick={() => handleDownloadClick(row)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <PermissionGate anyOf={ENDORSE_ACTION_PERMISSIONS}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 text-recent-searches-action"
                      aria-label="Edit policy"
                      onClick={() => onEndorseClick?.(row)}
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                  </PermissionGate>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 text-recent-searches-action"
                    aria-label="Share policy"
                    onClick={() => onShareClick?.(row)}
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
  );

  const renderEmptyState = () => (
    <div
      className={cn(
        'flex items-center justify-center px-4 py-20 min-h-[41vh]',
        !showTopTabs && 'min-h-[50vh]',
      )}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="bg-card border-border shadow-xs flex size-12 items-center justify-center rounded-md border">
          <CircleAlert className="text-foreground size-6" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-foreground text-xl font-semibold">{'No data found'}</p>
          <p className="text-sm text-muted-foreground">
            {'We could not fetch any data for the searched policy number'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      <div className="border-claims-management-table-border rounded-claims-management-table w-full overflow-hidden border bg-white">
        <div className="border-claims-management-table-border border-b pt-2">
          <UnderlineTabs value={activeTableTab} onValueChange={onTableTabChange} tabs={tabs} />
        </div>
        <div className="border border-transparent">
          {renderHeader()}
          {isLoading && renderSkeletonRows()}
          {isError && renderErrorState()}
          {isTableReady && renderRows()}
          {showEmptyState && renderEmptyState()}
        </div>
      </div>
      {!isLoading && !isError && (
        <div className="mt-4 flex justify-end">
          <p className="text-sm font-light leading-normal text-muted-foreground">
            {'Showing only the last 15 policies in the order of most recently interacted first'}
          </p>
        </div>
      )}
    </div>
  );
}
