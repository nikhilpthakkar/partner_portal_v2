'use client';

import { Button } from '@/components/ui/button';
import {
  POLICY_AUTO_REFUND_SUCCESS_BANNER,
  POLICY_REFUND_IN_PROGRESS_BANNER,
} from '@/lib/constants/policyAutoRefund.constants';

type PolicyAutoRefundSuccessBannerProps = {
  description?: string;
  onViewStatus?: () => void;
};

export function PolicyAutoRefundSuccessBanner({
  description = POLICY_AUTO_REFUND_SUCCESS_BANNER.description,
  onViewStatus,
}: PolicyAutoRefundSuccessBannerProps) {
  return (
    <div className="flex w-full items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-green-800">
        <p className="text-xs font-medium leading-none">{POLICY_AUTO_REFUND_SUCCESS_BANNER.title}</p>
        <p className="text-xs leading-[1.2]">{description}</p>
      </div>
      {onViewStatus ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 rounded-md border-input bg-white px-3 text-xs font-medium text-foreground shadow-xs"
          onClick={onViewStatus}
        >
          {POLICY_REFUND_IN_PROGRESS_BANNER.actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
