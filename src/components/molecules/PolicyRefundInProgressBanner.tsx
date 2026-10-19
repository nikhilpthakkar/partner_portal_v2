'use client';

import { Button } from '@/components/ui/button';
import { PolicyRefundInProgressMessage } from '@/components/molecules/PolicyRefundInProgressMessage';
import { POLICY_REFUND_IN_PROGRESS_BANNER } from '@/lib/constants/policyAutoRefund.constants';

type PolicyRefundInProgressBannerProps = {
  requestId?: string;
  initiatedDate?: string;
  expectedCompletionDate?: string;
  onViewStatus: () => void;
};

export function PolicyRefundInProgressBanner({
  requestId,
  initiatedDate,
  expectedCompletionDate,
  onViewStatus,
}: PolicyRefundInProgressBannerProps) {
  return (
    <div className="flex w-full items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-blue-600">
        <p className="text-xs font-medium leading-none">{POLICY_REFUND_IN_PROGRESS_BANNER.title}</p>
        <PolicyRefundInProgressMessage
          requestId={requestId}
          initiatedDate={initiatedDate}
          expectedCompletionDate={expectedCompletionDate}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shrink-0 rounded-md border-input bg-white px-3 text-xs font-medium text-foreground shadow-xs"
        onClick={onViewStatus}
      >
        {POLICY_REFUND_IN_PROGRESS_BANNER.actionLabel}
      </Button>
    </div>
  );
}
