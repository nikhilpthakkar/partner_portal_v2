'use client';

import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';

type PolicyInitiateRefundModalFailedAlertProps = {
  title?: string;
  description?: string;
};

export function PolicyInitiateRefundModalFailedAlert({
  title = POLICY_INITIATE_REFUND_DIALOG.failedRefundAlert.title,
  description = POLICY_INITIATE_REFUND_DIALOG.failedRefundAlert.description,
}: PolicyInitiateRefundModalFailedAlertProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4">
      <div className="flex flex-col gap-1.5 text-red-800">
        <p className="text-xs font-medium leading-none">{title}</p>
        <p className="text-xs leading-[1.2]">{description}</p>
      </div>
    </div>
  );
}
