'use client';

import { Button } from '@/components/ui/button';
import {
  POLICY_AUTO_REFUND_FAILED_RETRYABLE_BANNER,
  POLICY_REFUND_IN_PROGRESS_BANNER,
} from '@/lib/constants/policyAutoRefund.constants';

type PolicyAutoRefundFailedRetryableBannerProps = {
  onReinitiateRefund?: () => void;
  onViewStatus: () => void;
};

const BANNER_ACTION_BUTTON_CLASS =
  'h-8 shrink-0 rounded-md border-input bg-white px-3 text-xs font-medium text-foreground shadow-xs';

export function PolicyAutoRefundFailedRetryableBanner({
  onReinitiateRefund,
  onViewStatus,
}: PolicyAutoRefundFailedRetryableBannerProps) {
  return (
    <div className="flex w-full items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-red-800">
        <p className="text-xs font-medium leading-none">
          {POLICY_AUTO_REFUND_FAILED_RETRYABLE_BANNER.title}
        </p>
        <p className="text-xs leading-[1.2]">
          {POLICY_AUTO_REFUND_FAILED_RETRYABLE_BANNER.description}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={BANNER_ACTION_BUTTON_CLASS}
          onClick={onViewStatus}
        >
          {POLICY_REFUND_IN_PROGRESS_BANNER.actionLabel}
        </Button>
        {onReinitiateRefund ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={BANNER_ACTION_BUTTON_CLASS}
            onClick={onReinitiateRefund}
          >
            {POLICY_AUTO_REFUND_FAILED_RETRYABLE_BANNER.actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
