'use client';

import Link from 'next/link';
import {
  MANUAL_REFUNDS_MODULE_ROUTE_SEGMENT,
  POLICY_MANUAL_REFUND_INITIATED_BANNER,
} from '@/lib/constants/policyAutoRefund.constants';
import { formatRequestIdLabel } from '@/lib/utils/policyRefundDetails.utils';

type PolicyManualRefundInitiatedMessageProps = {
  requestId?: string;
  partner: string;
};

export function PolicyManualRefundInitiatedMessage({
  requestId,
  partner,
}: PolicyManualRefundInitiatedMessageProps) {
  const manualRefundsHref = `/${partner}/dashboard/${MANUAL_REFUNDS_MODULE_ROUTE_SEGMENT}`;
  const hasRequestId = Boolean(requestId?.trim());

  if (hasRequestId) {
    return (
      <p className="text-xs leading-[1.2]">
        {POLICY_MANUAL_REFUND_INITIATED_BANNER.descriptionPrefix(
          formatRequestIdLabel(requestId!),
        )}
        <Link
          href={manualRefundsHref}
          className="font-medium underline underline-offset-2 hover:text-blue-700"
        >
          {POLICY_MANUAL_REFUND_INITIATED_BANNER.manualRefundModuleLinkLabel}
        </Link>
        {POLICY_MANUAL_REFUND_INITIATED_BANNER.descriptionSuffix}
      </p>
    );
  }

  return (
    <p className="text-xs leading-[1.2]">
      {POLICY_MANUAL_REFUND_INITIATED_BANNER.descriptionFallback}{' '}
      <Link
        href={manualRefundsHref}
        className="font-medium underline underline-offset-2 hover:text-blue-700"
      >
        {POLICY_MANUAL_REFUND_INITIATED_BANNER.manualRefundModuleLinkLabel}
      </Link>
      .
    </p>
  );
}
