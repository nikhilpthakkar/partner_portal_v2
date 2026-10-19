'use client';

import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';
import type { PolicyRefundBankDetail } from '@/lib/types/policy-management/policyRefundApi';

type PolicyPartnerBankAccountDetailsCardProps = {
  accountDetails?: PolicyRefundBankDetail;
  hasLoadError?: boolean;
};

export function PolicyPartnerBankAccountDetailsCard({
  accountDetails,
  hasLoadError = false,
}: PolicyPartnerBankAccountDetailsCardProps) {
  const fields = POLICY_INITIATE_REFUND_DIALOG.reinitiateBankFields;

  if (hasLoadError) {
    return (
      <div className="rounded-md border border-border bg-primary-foreground p-4">
        <p className="text-sm font-medium leading-none text-foreground">
          {fields.partnerBankDetailsTitle}
        </p>
        <p className="mt-4 text-sm leading-5 text-muted-foreground">
          Unable to load partner bank accounts. Please try again in a moment.
        </p>
      </div>
    );
  }

  if (!accountDetails) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-primary-foreground p-4">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium leading-none text-foreground">
          {fields.partnerBankDetailsTitle}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-none text-muted-foreground">{fields.accountNumber.label}</p>
            <p className="text-sm leading-none text-foreground">{accountDetails.accountNumber}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-none text-muted-foreground">{fields.ifscCode.label}</p>
            <p className="text-sm leading-none text-foreground">{accountDetails.ifsc}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-none text-muted-foreground">{fields.selectBank.label}</p>
            <p className="text-sm leading-none text-foreground">{accountDetails.bankName}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-none text-muted-foreground">
              {fields.accountHolderName.label}
            </p>
            <p className="text-sm leading-none text-foreground">{accountDetails.accountHolder}</p>
          </div>
        </div>

        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-xs leading-none text-yellow-800">{fields.transferNote}</p>
        </div>
      </div>
    </div>
  );
}
