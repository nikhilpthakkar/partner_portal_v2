'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MANUAL_REFUND_DETAILS_DIALOG } from '@/lib/constants/manualRefunds.constants';
import type { ManualRefundDetailsDialogViewModel } from '@/lib/types/manual-refunds/manualRefundDetailsDialog';
import { cn } from '@/lib/utils';

type ManualRefundDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewModel?: ManualRefundDetailsDialogViewModel;
  isLoading?: boolean;
  isError?: boolean;
  onEditDetails?: () => void;
};

type DetailRowProps = {
  label: string;
  value: string;
  copyable?: boolean;
};

const DetailRow = ({ label, value, copyable = false }: DetailRowProps) => {
  const handleCopy = async () => {
    if (!value || value === '—') {
      return;
    }

    await navigator.clipboard.writeText(value);
    toast.success(MANUAL_REFUND_DETAILS_DIALOG.copySuccessMessage);
  };

  return (
    <div className="flex min-h-5 items-center justify-between gap-4">
      <span className="shrink-0 text-xs leading-none text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <span className="truncate text-xs leading-none text-foreground">{value}</span>
        {copyable && value !== '—' ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-4 shrink-0 p-0"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
          >
            <Copy className="size-3 text-muted-foreground" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};

type DestinationFieldProps = {
  label: string;
  value: string;
  className?: string;
};

const DestinationField = ({ label, value, className }: DestinationFieldProps) => (
  <div className={cn('flex flex-col gap-2', className)}>
    <span className="text-xs leading-none text-muted-foreground">{label}</span>
    <span className="text-xs leading-none text-foreground">{value}</span>
  </div>
);

export function ManualRefundDetailsDialog({
  open,
  onOpenChange,
  viewModel,
  isLoading = false,
  isError = false,
  onEditDetails,
}: ManualRefundDetailsDialogProps) {
  const accountNumberLabel =
    viewModel?.destinationKind === 'partner'
      ? MANUAL_REFUND_DETAILS_DIALOG.partnerAccountNumber
      : MANUAL_REFUND_DETAILS_DIALOG.customerAccountNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="gap-4 p-6 sm:max-w-[570px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-semibold leading-none text-foreground">
            {MANUAL_REFUND_DETAILS_DIALOG.title}
          </DialogTitle>
          {viewModel ? (
            <DialogDescription className="text-sm leading-5 text-muted-foreground">
              {MANUAL_REFUND_DETAILS_DIALOG.policyIdLabel}: {viewModel.policyNumber}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{MANUAL_REFUND_DETAILS_DIALOG.loadingMessage}</p>
        ) : null}

        {isError ? (
          <p className="text-sm text-destructive">{MANUAL_REFUND_DETAILS_DIALOG.errorMessage}</p>
        ) : null}

        {!isLoading && !isError && viewModel ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none text-foreground">
                {MANUAL_REFUND_DETAILS_DIALOG.refundStatusLabel}
              </p>
              <Badge variant="outline" className={viewModel.refundStatusBadgeClassName}>
                {viewModel.refundStatusLabel}
              </Badge>
            </div>

            <div className="flex flex-col">
              <div className="rounded-t-md border border-border bg-muted/40 px-4 py-3">
                <p className="text-sm font-medium leading-none text-foreground">
                  {MANUAL_REFUND_DETAILS_DIALOG.detailsSectionTitle}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-b-md border border-t-0 border-border bg-card px-4 py-2.5">
                <DetailRow
                  label={MANUAL_REFUND_DETAILS_DIALOG.refundId}
                  value={viewModel.refundId}
                  copyable
                />
                <DetailRow
                  label={MANUAL_REFUND_DETAILS_DIALOG.refundAmount}
                  value={viewModel.refundAmount}
                />
                <DetailRow
                  label={MANUAL_REFUND_DETAILS_DIALOG.initiatedOn}
                  value={viewModel.initiatedOn}
                />
                <DetailRow
                  label={MANUAL_REFUND_DETAILS_DIALOG.completedOn}
                  value={viewModel.completedOn}
                />
                <DetailRow
                  label={MANUAL_REFUND_DETAILS_DIALOG.utrReference}
                  value={viewModel.utrReference}
                  copyable
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none text-foreground">
                  {MANUAL_REFUND_DETAILS_DIALOG.refundDestinationTitle}
                </p>
                <Badge variant="outline" className={viewModel.destinationTypeBadgeClassName}>
                  {viewModel.destinationTypeLabel}
                </Badge>
              </div>

              <DestinationField label={MANUAL_REFUND_DETAILS_DIALOG.toLabel} value={viewModel.accountHolderName} />

              <div className="grid gap-2 sm:grid-cols-2">
                <DestinationField label={accountNumberLabel} value={viewModel.accountNumber} />
                <DestinationField label={MANUAL_REFUND_DETAILS_DIALOG.ifscCode} value={viewModel.ifscCode} />
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex-row items-center justify-between gap-2 pt-3.5 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {MANUAL_REFUND_DETAILS_DIALOG.backLabel}
          </Button>
          <div className="flex items-center gap-2">
            {onEditDetails ? (
              <Button type="button" variant="outline" onClick={onEditDetails}>
                {MANUAL_REFUND_DETAILS_DIALOG.editDetailsLabel}
              </Button>
            ) : null}
            <Button
              type="button"
              className="bg-[#8B5CF6] text-white hover:bg-[#7c3aed]"
              onClick={() => onOpenChange(false)}
            >
              {MANUAL_REFUND_DETAILS_DIALOG.doneLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
