'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ClaimsTable from '../molecules/ClaimsTable';
import SimpleSelect from '../molecules/SimpleSelect';
import DateRangePicker from '../molecules/DateRangePicker';
import MultiSearchSelect from '@/components/molecules/MultiSearchSelect';
import { DateRange } from 'react-day-picker';
import { ClaimStatusGroup } from '@/lib/types/overview';
import ClaimsTableDialogSummarySkelton from '@/components/molecules/skeltons/ClaimsTableDialogSummarySkelton';
import { ClaimsTableData } from '@/lib/types/overview';
import { statusGroups, statusOptions } from '@/lib/constants/overview.constants';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { usePartnerStore } from '@/lib/store/partner.store';
import { formatOverviewDate } from '@/lib/store/overview.store';
import { useExportClaimsDataMutation } from '@/lib/query/overview.queries';
import type { SelectOption } from '@/lib/types/Global';
import { differenceInCalendarDays } from 'date-fns';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants/claimsDetail.constants';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackClaimsTrendDialogExport,
  trackClaimsTrendDialogView,
} from '@/lib/segment/track/claims';

type ClaimsTableDialogProps = {
  open: boolean;
  dialogTitle?: string;
  contentClassName?: string;
  className?: string;
  dateRange: DateRange;
  onDateRangeChange: (value: DateRange) => void;
  coverOptions: SelectOption[];
  coverIds: string[];
  onCoverIdsChange: (coverIds: string[]) => void;
  coversDisabled?: boolean;
  claimsTableData: ClaimsTableData;
  isLoading?: boolean;
  isError?: boolean;
  statusValue: ClaimStatusGroup[];
  onStatusChange: (value: ClaimStatusGroup[]) => void;
  onClose: (open: boolean) => void;
};

export default function ClaimsTableDialog({
  open,
  dialogTitle,
  contentClassName,
  className,
  dateRange,
  onDateRangeChange,
  coverOptions,
  coverIds,
  onCoverIdsChange,
  coversDisabled,
  claimsTableData,
  isLoading,
  isError,
  statusValue,
  onStatusChange,
  onClose,
}: ClaimsTableDialogProps) {
  const router = useRouter();
  const { partner } = useParams<{ partner: string }>();
  const { isReady } = usePartnerConfigReady();
  const segmentBase = useSegmentPartnerBase();
  const { productIds } = usePartnerStore();
  const [isExporting, setIsExporting] = useState(false);
  const [coverFilterSearch, setCoverFilterSearch] = useState('');
  const { mutateAsync: exportClaimsData } = useExportClaimsDataMutation();

  useEffect(() => {
    if (open) {
      trackClaimsTrendDialogView(segmentBase);
    }
  }, [open, segmentBase]);

  const resolvedStatusValue =
    statusGroups.all.every((s) => statusValue.includes(s as ClaimStatusGroup)) &&
    statusValue.length === statusGroups.all.length
      ? 'all'
      : statusGroups.inprogress.every((s) => statusValue.includes(s as ClaimStatusGroup)) &&
          statusValue.length === statusGroups.inprogress.length
        ? 'inprogress'
        : statusGroups.paid.every((s) => statusValue.includes(s as ClaimStatusGroup)) &&
            statusValue.length === statusGroups.paid.length
          ? 'paid'
          : statusGroups.closed.every((s) => statusValue.includes(s as ClaimStatusGroup)) &&
              statusValue.length === statusGroups.closed.length
            ? 'closed'
            : 'rejected';

  const statusLabel =
    statusOptions.find((option) => option.value === resolvedStatusValue)?.label ?? 'All Statuses';

  const handleStatusChange = (value: string) => {
    onStatusChange(statusGroups[value as ClaimStatusGroup] as ClaimStatusGroup[]);
  };

  const handleExportClaims = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Select a valid date range to export claims');
      return;
    }

    const rangeDays = differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
    if (rangeDays > MAX_DATE_RANGE_DAYS) {
      toast.error(
        `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days for export. Current range: ${rangeDays} days`,
      );
      return;
    }

    if (!isReady || productIds.length === 0) {
      toast.error('Export is not available right now');
      return;
    }

    const fromDate = formatOverviewDate(dateRange.from);
    const toDate = formatOverviewDate(dateRange.to);

    setIsExporting(true);
    trackClaimsTrendDialogExport(segmentBase);

    try {
      const { data, fileName } = await exportClaimsData({
        fromDate,
        toDate,
        statusGroups: statusValue,
        coverIds: coverIds.length > 0 ? coverIds : undefined,
      });

      const blobUrl = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0);
      toast.success('Claims export started successfully');
    } catch {
      toast.error('Failed to export claims data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className={cn('border-0 bg-transparent p-0 shadow-none max-w-7xl mx-auto', className)}
      >
        <div className="flex h-full flex-col rounded-claims-table-dialog border border-claims-table-border bg-claims-table-dialog-bg shadow-claims-table-dialog">
          <DialogHeader className="px-6">
            <DialogTitle className="text-pagination-text text-xl py-4 font-semibold">
              {dialogTitle}
            </DialogTitle>
            <DialogDescription
              className="text-pagination-text-muted text-sm flex items-center justify-between"
              asChild
            >
              <div className="flex items-center justify-between text-pagination-text-muted text-sm">
                {isLoading ? (
                  <ClaimsTableDialogSummarySkelton />
                ) : isError ? (
                  <span className="text-claims-table-summary text-base leading-6">
                    {'Unable to load claims. Please try again later.'}
                  </span>
                ) : (
                  <span className="text-claims-table-summary text-base leading-6">
                    Showing {claimsTableData.data.length}{' '}
                    {claimsTableData.data.length === 1 ? 'claim' : 'claims'} for the selected date
                    range with status as {statusLabel}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
                  <SimpleSelect
                    value={resolvedStatusValue}
                    options={statusOptions}
                    onValueChange={handleStatusChange}
                    className="text-claims-table-select-text h-9 px-4 py-2 text-sm font-medium"
                  />
                  {coverOptions.length > 0 && (
                    <MultiSearchSelect
                      label="Covers"
                      values={coverIds}
                      options={coverOptions}
                      onValuesChange={onCoverIdsChange}
                      searchValue={coverFilterSearch}
                      onSearchChange={setCoverFilterSearch}
                      placeholder="Select covers"
                      emptyLabel="No options"
                      disabled={coversDisabled}
                      contentAlign="end"
                      summaryStyle="compact"
                      deferCommit
                      className="min-w-fit max-w-multi-select-trigger-width w-auto cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <ClaimsTable
              tableData={claimsTableData}
              isLoading={isLoading}
              isError={isError}
              onReferenceClick={(claimNumber) =>
                router.push(
                  `/${partner}/dashboard/claims-management/claim-details?claimNumber=${encodeURIComponent(claimNumber)}`,
                )
              }
              className={cn('w-full', contentClassName)}
            />
          </div>
          <DialogFooter className="border-t border-claims-table-border px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose(false)}
                className="border-claims-table-dialog-outline-border text-claims-table-dialog-outline-text hover:bg-claims-table-dialog-bg"
              >
                {'Close'}
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleExportClaims}
                disabled={isExporting || isLoading || isError}
                className="cursor-pointer w-spacing-width-150 bg-claims-table-dialog-primary-bg text-claims-table-dialog-primary-text hover:bg-claims-table-dialog-primary-bg-hover"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Export claims data'}
              </Button>
            </div>
          </DialogFooter>
        </div>
        <button
          type="button"
          onClick={() => onClose(false)}
          className="cursor-pointer absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
