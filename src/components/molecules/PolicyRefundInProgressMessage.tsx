'use client';

import { POLICY_REFUND_IN_PROGRESS_BANNER } from '@/lib/constants/policyAutoRefund.constants';
import { formatRequestIdLabel } from '@/lib/utils/policyRefundDetails.utils';

type PolicyRefundInProgressMessageProps = {
  requestId?: string;
  initiatedDate?: string;
  expectedCompletionDate?: string;
  fallback?: string;
};

export function PolicyRefundInProgressMessage({
  requestId,
  initiatedDate,
  expectedCompletionDate,
  fallback = POLICY_REFUND_IN_PROGRESS_BANNER.descriptionFallback,
}: PolicyRefundInProgressMessageProps) {
  if (!requestId?.trim() || !initiatedDate?.trim()) {
    return <p className="text-xs leading-[1.2]">{fallback}</p>;
  }

  return (
    <p className="text-xs leading-[1.2]">
      {POLICY_REFUND_IN_PROGRESS_BANNER.descriptionPrefix}
      <span className="font-medium">
        {POLICY_REFUND_IN_PROGRESS_BANNER.requestIdLabel(formatRequestIdLabel(requestId))}
      </span>
      {POLICY_REFUND_IN_PROGRESS_BANNER.descriptionSuffix(initiatedDate)}
      {expectedCompletionDate
        ? POLICY_REFUND_IN_PROGRESS_BANNER.expectedCompletionSuffix(expectedCompletionDate)
        : null}
    </p>
  );
}
