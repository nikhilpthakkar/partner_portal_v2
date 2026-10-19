'use client';

import { RefundDestinationOptionCard } from '@/components/molecules/RefundDestinationOptionCard';
import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';
import type { RefundDestination } from '@/lib/types/policy-endorsement';

type PolicyInitiateRefundDestinationOptionsProps = {
  refundDestination: RefundDestination;
  onSelectManual: () => void;
  onSelectCashfree: () => void;
};

export function PolicyInitiateRefundDestinationOptions({
  refundDestination,
  onSelectManual,
  onSelectCashfree,
}: PolicyInitiateRefundDestinationOptionsProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium leading-none text-foreground">
        {POLICY_INITIATE_REFUND_DIALOG.stepOneLabel}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <RefundDestinationOptionCard
          isSelected={refundDestination === 'float'}
          title={POLICY_INITIATE_REFUND_DIALOG.floatOption.title}
          description={POLICY_INITIATE_REFUND_DIALOG.floatOption.description}
          onClick={onSelectManual}
        />
        <RefundDestinationOptionCard
          isSelected={refundDestination === 'bank'}
          title={POLICY_INITIATE_REFUND_DIALOG.bankOption.title}
          description={POLICY_INITIATE_REFUND_DIALOG.bankOption.description}
          onClick={onSelectCashfree}
        />
      </div>
    </div>
  );
}
