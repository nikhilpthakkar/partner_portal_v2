'use client';

import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';
import type { PolicyRetryRefundOption } from '@/lib/types/policy-management/policyReinitiateRefund';

const RETRY_REFUND_OPTIONS: Array<{
  value: PolicyRetryRefundOption;
  label: string;
}> = [
  {
    value: 'correct_bank_details',
    label: POLICY_INITIATE_REFUND_DIALOG.retryRefundOptions.correctBankDetails.title,
  },
  {
    value: 'add_bank_account',
    label: POLICY_INITIATE_REFUND_DIALOG.retryRefundOptions.addBankAccount.title,
  },
  {
    value: 'partner_bank_account',
    label: POLICY_INITIATE_REFUND_DIALOG.retryRefundOptions.partnerBankAccount.title,
  },
];

type PolicyRetryRefundOptionsProps = {
  retryRefundOption: PolicyRetryRefundOption;
  onRetryRefundOptionChange: (option: PolicyRetryRefundOption) => void;
  disabled?: boolean;
};

export function PolicyRetryRefundOptions({
  retryRefundOption,
  onRetryRefundOptionChange,
  disabled = false,
}: PolicyRetryRefundOptionsProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium leading-none text-foreground">
        {POLICY_INITIATE_REFUND_DIALOG.optionsToRetryRefundLabel}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {RETRY_REFUND_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-foreground"
          >
            <input
              type="radio"
              name="retry-refund-option"
              value={option.value}
              checked={retryRefundOption === option.value}
              onChange={() => onRetryRefundOptionChange(option.value)}
              className="size-4 accent-[#8B5CF6]"
              disabled={disabled}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
