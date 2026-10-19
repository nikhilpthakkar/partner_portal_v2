'use client';

import { useMemo } from 'react';
import {
  mapManualRefundToDetailsDialogViewModel,
} from '@/lib/adapter/manual-refunds/manualRefundDetailsDialog.adapter';
import { ManualRefundDetailsDialog } from '@/components/organisms/ManualRefundDetailsDialog';
import { useEnrichedManualRefund } from '@/lib/hooks/useEnrichedManualRefund';
import type { ManualRefundData } from '@/lib/types/manual-refunds/manualRefundsApi';

type ViewManualRefundDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: ManualRefundData | null;
  onEditDetails?: (refund: ManualRefundData) => void;
};

export default function ViewManualRefundDetailsSheet({
  open,
  onOpenChange,
  refund,
  onEditDetails,
}: ViewManualRefundDetailsSheetProps) {
  const { enrichedRefund, refundDetails, isPending, isError } = useEnrichedManualRefund({
    refund,
    enabled: open,
  });

  const viewModel = useMemo(() => {
    if (!enrichedRefund) {
      return null;
    }

    return mapManualRefundToDetailsDialogViewModel(enrichedRefund, refundDetails);
  }, [enrichedRefund, refundDetails]);

  const handleEditDetails = () => {
    if (!enrichedRefund || !onEditDetails) {
      return;
    }

    onEditDetails(enrichedRefund);
  };

  return (
    <ManualRefundDetailsDialog
      open={open}
      onOpenChange={onOpenChange}
      viewModel={viewModel ?? undefined}
      isLoading={open && isPending && !viewModel}
      isError={open && isError && !viewModel}
      onEditDetails={onEditDetails ? handleEditDetails : undefined}
    />
  );
}
