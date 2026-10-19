'use client';

import { useEffect, useMemo, useState } from 'react';
import { addMonths, format, subDays } from 'date-fns';
import { Download } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import DateRangePicker from '@/components/molecules/DateRangePicker';
import MultiSelect from '@/components/molecules/MultiSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useExportCancellationReportMutation } from '@/lib/query/policyManagement.queries';

type CancellationReportDownloadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productIds: string[];
};

const defaultFromDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};

const defaultToDate = () => subDays(new Date(), 1);

const toApiDate = (value: Date): string => format(value, 'yyyy-MM-dd');

export default function CancellationReportDownloadDialog({
  open,
  onOpenChange,
  productIds,
}: CancellationReportDownloadDialogProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(productIds);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: defaultFromDate(),
    to: defaultToDate(),
  });
  const [maxToDate] = useState(defaultToDate);
  const exportCancellationReportMutation = useExportCancellationReportMutation();

  useEffect(() => {
    setSelectedProductIds(productIds);
  }, [productIds]);

  const planOptions = useMemo(
    () => productIds.map((productId) => ({ label: productId, value: productId })),
    [productIds],
  );

  const validationError = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return null;
    if (dateRange.from.getTime() > dateRange.to.getTime()) {
      return 'From date cannot be after to date.';
    }
    if (dateRange.to.getTime() > maxToDate.getTime()) {
      return 'To date cannot be in the future.';
    }
    return null;
  }, [dateRange.from, dateRange.to, maxToDate]);

  const isDownloadDisabled =
    exportCancellationReportMutation.isPending ||
    selectedProductIds.length === 0 ||
    !dateRange.from ||
    !dateRange.to ||
    Boolean(validationError);

  const handleDownload = async () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (selectedProductIds.length === 0) {
      toast.error('Select at least one plan ID');
      return;
    }
    if (!dateRange.from || !dateRange.to) {
      toast.error('Select a date range');
      return;
    }

    try {
      const { data, fileName } = await exportCancellationReportMutation.mutateAsync({
        productIds: selectedProductIds,
        fromDate: toApiDate(dateRange.from),
        toDate: toApiDate(dateRange.to),
      });
      const blobUrl = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0);
      toast.success('Cancellation report downloaded');
      onOpenChange(false);
    } catch {
      toast.error('Failed to download cancellation report. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Download cancellation report</DialogTitle>
          <DialogDescription>Select plan IDs and cancellation/pre-closure date range.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Plan IDs</Label>
            <MultiSelect
              label="Plan IDs"
              values={selectedProductIds}
              options={planOptions}
              onValuesChange={setSelectedProductIds}
              placeholder="Select plan IDs"
              searchPlaceholder="Search plan IDs"
              disabled={productIds.length === 0}
              className="h-10 max-w-none justify-between"
              contentClassName="min-w-multi-select-content-width"
            />
          </div>

          <div className="grid gap-2">
            <Label>Date range</Label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="h-10"
              placeholder="Select up to 2 months"
              disabledDate={(date) =>
                Boolean(
                  date.getTime() > maxToDate.getTime() ||
                  dateRange.from &&
                    !dateRange.to &&
                    date.getTime() > addMonths(dateRange.from, 2).getTime(),
                )
              }
            />
          </div>

          {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exportCancellationReportMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloadDisabled}
            className="bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
          >
            <Download className="size-4" aria-hidden />
            {exportCancellationReportMutation.isPending ? 'Downloading' : 'Download CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
