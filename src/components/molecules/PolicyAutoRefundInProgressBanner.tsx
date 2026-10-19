'use client';

import { POLICY_AUTO_REFUND_IN_PROGRESS_BANNER } from '@/lib/constants/policyAutoRefund.constants';

type PolicyAutoRefundInProgressBannerProps = {
  description: string;
};

export function PolicyAutoRefundInProgressBanner({
  description,
}: PolicyAutoRefundInProgressBannerProps) {
  return (
    <div className="flex w-full items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-blue-800">
        <p className="text-xs font-medium leading-none">
          {POLICY_AUTO_REFUND_IN_PROGRESS_BANNER.title}
        </p>
        <p className="text-xs leading-[1.2]">{description}</p>
      </div>
    </div>
  );
}
