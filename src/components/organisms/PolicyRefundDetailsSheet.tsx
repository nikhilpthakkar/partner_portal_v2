'use client';

import { useMemo } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { PolicyRefundStatusTimeline } from '@/components/molecules/PolicyRefundStatusTimeline';
import { PolicyRefundDetailsContent } from '@/components/organisms/PolicyRefundSuccessDetailsDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { mapRefundDetailsToSheetViewModel } from '@/lib/adapter/policy-details/policyRefundDetailsSheet.adapter';
import { POLICY_REFUND_DETAILS_SHEET } from '@/lib/constants/policyAutoRefund.constants';
import type { PolicyRefundDetailsData } from '@/lib/types/policy-management/policyRefundApi';
import type { PolicyRefundDetailsSheetSummaryVariant } from '@/lib/types/policy-management/policyRefundDetailsSheet';
import { cn } from '@/lib/utils';
import { getPolicyRefundUiState } from '@/lib/utils/policyRefundDetails.utils';

const getSummaryClassName = (variant: PolicyRefundDetailsSheetSummaryVariant) => {
  if (variant === 'failed') {
    return 'border-red-200 bg-red-50 text-red-800';
  }

  if (variant === 'success' || variant === 'manualSettled') {
    return 'border-green-300 bg-green-50 text-green-800';
  }

  return 'border-blue-200 bg-blue-50 text-blue-600';
};

type PolicyRefundDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refundDetails?: PolicyRefundDetailsData;
  uiState?: string | null;
  originalPremium?: number | null;
};

export function PolicyRefundDetailsSheet({
  open,
  onOpenChange,
  refundDetails,
  uiState: uiStateProp,
  originalPremium,
}: PolicyRefundDetailsSheetProps) {
  const resolvedUiState = uiStateProp ?? getPolicyRefundUiState(refundDetails);

  const viewModel = useMemo(
    () => mapRefundDetailsToSheetViewModel(refundDetails, resolvedUiState),
    [refundDetails, resolvedUiState],
  );

  const handleCopyRequestId = async () => {
    if (!viewModel?.requestId) {
      return;
    }

    await navigator.clipboard.writeText(viewModel.requestId);
    toast.success(POLICY_REFUND_DETAILS_SHEET.copySuccessMessage);
  };

  if (!viewModel) {
    return null;
  }

  const summaryClassName = getSummaryClassName(viewModel.summaryVariant);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="fixed top-0 right-0 left-auto flex h-full w-full max-w-[432px] translate-x-0 translate-y-0 flex-col gap-4 overflow-hidden rounded-none border-l p-2 shadow-lg data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
      >
        <div className="flex h-14 shrink-0 items-center px-4 py-2">
          <DialogTitle className="text-xl font-bold leading-7 text-foreground">
            {POLICY_REFUND_DETAILS_SHEET.title}
          </DialogTitle>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className={cn('rounded-md border p-4', summaryClassName)}>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium leading-none">
                {POLICY_REFUND_DETAILS_SHEET.summaryTitle}
              </p>
              <p className="text-xs leading-[1.2]">{viewModel.summaryDescription}</p>
            </div>
          </div>

          <PolicyRefundStatusTimeline
            title={POLICY_REFUND_DETAILS_SHEET.timelineTitle}
            groups={viewModel.timelineGroups}
            renderGroupDetails={(group) =>
              refundDetails ? (
                <PolicyRefundDetailsContent
                  refundDetails={refundDetails}
                  refundRequestId={group.refundRequestId}
                  manualRefundId={group.manualRefundId}
                  refundDestination={group.refundDestination}
                  originalPremium={originalPremium}
                />
              ) : null
            }
          />

          <div className="rounded-md border border-border bg-card px-4 py-1.5">
            <div className="flex items-center gap-6 py-1.5">
              <p className="flex-1 text-sm leading-5 text-muted-foreground">
                {POLICY_REFUND_DETAILS_SHEET.requestIdLabel}
              </p>
              <div className="flex items-center gap-3.5 px-3">
                <p className="font-mono text-sm leading-5 text-foreground">{viewModel.requestId}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="size-3 shrink-0 p-0"
                  onClick={handleCopyRequestId}
                  aria-label={`Copy ${viewModel.requestId}`}
                >
                  <Copy className="size-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
