import { formatNumber } from '@/lib/utils';
import type { PolicyRefundCalculationData } from '@/lib/types/policy-management/policyRefundApi';
import { CURRENCY_UNIT_MAP } from '@/lib/constants/global.constants';

type FinancialPolicyEndorsementRefundBreakdownStepProps = {
  refundCalculation?: PolicyRefundCalculationData;
  isRefundCalculationLoading: boolean;
  isRefundCalculationError: boolean;
};

export const FinancialPolicyEndorsementRefundBreakdownStep = ({
  refundCalculation,
  isRefundCalculationLoading,
  isRefundCalculationError,
}: FinancialPolicyEndorsementRefundBreakdownStepProps) => {
  const getAmountDisplayValue = (amount?: number) => {
    if (isRefundCalculationLoading) {
      return 'Calculating...';
    }

    if (isRefundCalculationError) {
      return 'Unavailable';
    }

    return formatNumber(amount ?? 0, 2);
  };

  const deductionValue = isRefundCalculationLoading
    ? 'Calculating...'
    : isRefundCalculationError
      ? 'Unavailable'
      : `- ${formatNumber(refundCalculation?.updatedPremium.amount ?? 0)}`;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-endorse-policy-text text-sm font-medium leading-none">
        {'Step 2 of 3: Refund details'}
      </p>
      <div>
        <div className="bg-primary-foreground rounded-t-md border-endorse-policy-border border px-4 py-3">
          <p className="text-endorse-policy-text text-sm font-medium leading-none">
            {'Refund breakdown'}
          </p>
        </div>
        <div className="border-endorse-policy-border flex flex-col gap-3 border-x border-b-0 px-4 py-3">
          <div className="flex items-center justify-between text-xs leading-none">
            <span className="text-endorse-policy-muted">{'Calculation method'}</span>
            <span className="text-endorse-policy-text">{'Pro-rata basis'}</span>
          </div>
          <div className="flex items-center justify-between text-xs leading-none">
            <span className="text-endorse-policy-muted">{'Original premium'}</span>
            <span className="text-endorse-policy-text">
              {CURRENCY_UNIT_MAP.INR +
                getAmountDisplayValue(refundCalculation?.originalPremium.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs leading-none">
            <span className="text-endorse-policy-muted">{'Deduction'}</span>
            <span className="text-destructive">{deductionValue}</span>
          </div>
        </div>
        <div className="rounded-b-md border-endorse-policy-border flex border px-4 py-3">
          <div className="flex w-full items-center justify-between text-sm leading-5">
            <span className="text-endorse-policy-muted">{'Total refund amount'}</span>
            <span className="text-primary font-semibold">
              {CURRENCY_UNIT_MAP.INR +
                getAmountDisplayValue(refundCalculation?.refundPremium.amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
