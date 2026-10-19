'use client';

import { Button } from '@/components/ui/button';
import { POLICY_AUTO_REFUND_FAILED_BANNER } from '@/lib/constants/policyAutoRefund.constants';

type PolicyAutoRefundFailedBannerProps = {
  onInitiateRefundManually: () => void;
  showAction?: boolean;
};

export function PolicyAutoRefundFailedBanner({
  onInitiateRefundManually,
  showAction = true,
}: PolicyAutoRefundFailedBannerProps) {
  return (
    <div className="flex w-full items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-red-800">
        <p className="text-xs font-medium leading-none">{POLICY_AUTO_REFUND_FAILED_BANNER.title}</p>
        <p className="text-xs leading-[1.2]">{POLICY_AUTO_REFUND_FAILED_BANNER.description}</p>
      </div>
      {showAction ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 rounded-md border-input bg-white px-3 text-xs font-medium text-foreground shadow-xs"
          onClick={onInitiateRefundManually}
        >
          {POLICY_AUTO_REFUND_FAILED_BANNER.actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
