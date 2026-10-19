'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PolicyManualRefundInitiatedMessage } from '@/components/molecules/PolicyManualRefundInitiatedMessage';
import { POLICY_MANUAL_REFUND_INITIATED_BANNER } from '@/lib/constants/policyAutoRefund.constants';

type PolicyManualRefundInitiatedBannerProps = {
  requestId?: string;
  onViewStatus: () => void;
};

export function PolicyManualRefundInitiatedBanner({
  requestId,
  onViewStatus,
}: PolicyManualRefundInitiatedBannerProps) {
  const { partner } = useParams<{ partner: string }>();

  return (
    <div className="flex w-full items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-blue-600">
        <p className="text-xs font-medium leading-none">
          {POLICY_MANUAL_REFUND_INITIATED_BANNER.title}
        </p>
        <PolicyManualRefundInitiatedMessage requestId={requestId} partner={partner} />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shrink-0 rounded-md border-input bg-white px-3 text-xs font-medium text-foreground shadow-xs"
        onClick={onViewStatus}
      >
        {POLICY_MANUAL_REFUND_INITIATED_BANNER.actionLabel}
      </Button>
    </div>
  );
}
