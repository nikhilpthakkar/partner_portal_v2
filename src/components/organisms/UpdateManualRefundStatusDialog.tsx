'use client';

import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';

import { LabeledInput } from '@/components/molecules/LabeledInput';
import SimpleSelect from '@/components/molecules/SimpleSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MANUAL_REFUND_PRIORITY_FILTER_OPTIONS,
  MANUAL_REFUND_UPDATE_STATUS_DIALOG,
} from '@/lib/constants/manualRefunds.constants';
import { useUpdateManualRefundStatusMutation } from '@/lib/query/manualRefunds.queries';
import { useEnrichedManualRefund } from '@/lib/hooks/useEnrichedManualRefund';
import type { ApiErrorResponse } from '@/lib/types/Global';
import type { ManualRefundData } from '@/lib/types/manual-refunds/manualRefundsApi';
import { formatExactRefundAmount } from '@/lib/utils';

type UpdateManualRefundStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: ManualRefundData | null;
};

const disabledFieldClassName =
  'h-9 cursor-not-allowed border-border bg-white opacity-50 shadow-xs';

const enabledFieldClassName = 'h-9 bg-white shadow-xs';

const enabledSelectClassName =
  'h-9 w-full rounded-md border-border bg-white px-3 text-sm font-normal text-foreground shadow-xs';

const formatRefundAmount = formatExactRefundAmount;

const getBankAccountDisplay = (refund: ManualRefundData | null): string => {
  if (!refund) return '';
  if (refund.accountNumber?.trim()) return refund.accountNumber.trim();
  if (refund.vpa?.trim()) return refund.vpa.trim();
  return '';
};

export default function UpdateManualRefundStatusDialog({
  open,
  onOpenChange,
  refund,
}: UpdateManualRefundStatusDialogProps) {
  const { enrichedRefund, isPending: isRefundDetailsPending } = useEnrichedManualRefund({
    refund,
    enabled: open,
  });
  const resolvedRefund = enrichedRefund ?? refund;
  const { mutateAsync: updateManualRefundStatus, isPending } =
    useUpdateManualRefundStatusMutation();
  const [utr, setUtr] = useState('');
  const [remark, setRemark] = useState('');
  const [priority, setPriority] = useState('P0');
  const [utrError, setUtrError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setUtr(resolvedRefund?.utr?.trim() ?? '');
    setRemark(resolvedRefund?.remark?.trim() ?? '');
    setPriority((resolvedRefund?.priority ?? 'P0').toUpperCase());
    setUtrError(undefined);
  }, [open, resolvedRefund]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setUtr('');
      setRemark('');
      setPriority('P0');
      setUtrError(undefined);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    const trimmedUtr = utr.trim();
    if (!trimmedUtr) {
      setUtrError(MANUAL_REFUND_UPDATE_STATUS_DIALOG.utrRequired);
      return;
    }

    if (!resolvedRefund?.id) return;

    const productIds = resolvedRefund.planId?.trim() ? [resolvedRefund.planId.trim()] : [];

    try {
      await updateManualRefundStatus({
        refundId: resolvedRefund.id,
        productIds,
        payload: {
          utr: trimmedUtr,
          remark: remark.trim(),
          priority,
        },
      });
      toast.success(MANUAL_REFUND_UPDATE_STATUS_DIALOG.successTitle);
      handleClose();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast.error(
        axiosError.response?.data?.detail ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          MANUAL_REFUND_UPDATE_STATUS_DIALOG.errorTitle,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-[698px] gap-4 rounded-[10px] border border-[#E5E5E5] bg-white p-6 !shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)]">
        <DialogHeader className="gap-1.5 space-y-0 text-left">
          <DialogTitle>{MANUAL_REFUND_UPDATE_STATUS_DIALOG.title}</DialogTitle>
          <DialogDescription className="text-sm font-medium text-foreground">
            {MANUAL_REFUND_UPDATE_STATUS_DIALOG.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <LabeledInput
              id="manual-refund-policy-number"
              label={MANUAL_REFUND_UPDATE_STATUS_DIALOG.policyNumber}
              value={resolvedRefund?.policyNumber ?? ''}
              onChange={() => undefined}
              disabled
              className={disabledFieldClassName}
            />
            <LabeledInput
              id="manual-refund-account-holder"
              label={MANUAL_REFUND_UPDATE_STATUS_DIALOG.accountHolder}
              value={resolvedRefund?.accountHolder ?? ''}
              onChange={() => undefined}
              disabled
              className={disabledFieldClassName}
            />
            <LabeledInput
              id="manual-refund-remark"
              label={MANUAL_REFUND_UPDATE_STATUS_DIALOG.remark}
              value={remark}
              onChange={setRemark}
              placeholder="Enter remark"
              disabled={isPending || isRefundDetailsPending}
              className={enabledFieldClassName}
            />
            <LabeledInput
              id="manual-refund-utr"
              label={MANUAL_REFUND_UPDATE_STATUS_DIALOG.utr}
              value={utr}
              onChange={(value) => {
                setUtr(value);
                if (utrError) setUtrError(undefined);
              }}
              placeholder={MANUAL_REFUND_UPDATE_STATUS_DIALOG.utrPlaceholder}
              disabled={isPending || isRefundDetailsPending}
              className={enabledFieldClassName}
              aria-invalid={Boolean(utrError)}
            />
            {utrError ? (
              <p className="text-destructive -mt-2 text-sm" role="alert">
                {utrError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <LabeledInput
              id="manual-refund-bank-account"
              label={MANUAL_REFUND_UPDATE_STATUS_DIALOG.bankAccount}
              value={getBankAccountDisplay(resolvedRefund)}
              onChange={() => undefined}
              disabled
              className={disabledFieldClassName}
            />
            <LabeledInput
              id="manual-refund-amount"
              label={MANUAL_REFUND_UPDATE_STATUS_DIALOG.refundAmount}
              value={formatRefundAmount(resolvedRefund?.refundAmount)}
              onChange={() => undefined}
              disabled
              className={disabledFieldClassName}
            />
            <div className="flex flex-col gap-2">
              <label
                htmlFor="manual-refund-priority"
                className="text-sm leading-none font-medium text-foreground"
              >
                {MANUAL_REFUND_UPDATE_STATUS_DIALOG.priority}
              </label>
              <SimpleSelect
                value={priority}
                options={MANUAL_REFUND_PRIORITY_FILTER_OPTIONS}
                onValueChange={setPriority}
                disabled={isPending || isRefundDetailsPending}
                className={enabledSelectClassName}
                contentClassName="min-w-[var(--spacing-pagination-select-width)]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-3.5 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="rounded-md"
            disabled={isPending || isRefundDetailsPending}
          >
            {MANUAL_REFUND_UPDATE_STATUS_DIALOG.back}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || isRefundDetailsPending}
            className="rounded-md border-transparent bg-[#8B5CF6] text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-[#7c3aed] hover:text-white"
          >
            {isPending
              ? MANUAL_REFUND_UPDATE_STATUS_DIALOG.updating
              : MANUAL_REFUND_UPDATE_STATUS_DIALOG.update}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
