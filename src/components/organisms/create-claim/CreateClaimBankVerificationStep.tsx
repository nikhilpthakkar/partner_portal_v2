'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CREATE_CLAIM_BANK_FORM,
  CREATE_CLAIM_BANK_VERIFICATION_FOOTER,
  CREATE_CLAIM_BANK_VERIFICATION_SECTION,
  CREATE_CLAIM_FOOTER,
} from '@/lib/constants/createClaim.constants';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import type { CreateClaimPolicySummaryRow } from '@/lib/utils/createClaim';
import { CreateClaimPolicySidebar } from '@/components/molecules/create-claim/CreateClaimPolicySidebar';
import { CreateClaimSelectionSummary } from '@/components/molecules/create-claim/CreateClaimSelectionSummary';

export type CreateClaimBankVerificationStepProps = {
  selectedPolicy: RecentSearchPolicy;
  insuredSummaryName: string;
  sidebarRows: CreateClaimPolicySummaryRow[];
  bankAccountNumber: string;
  bankIfscCode: string;
  onBankAccountChange: (value: string) => void;
  onBankIfscChange: (value: string) => void;
  onBack?: () => void;
  /** Optional — e.g. death-claim flow. Rendered left of submit. */
  onSkip?: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
  skipDisabled?: boolean;
};

export function CreateClaimBankVerificationStep({
  selectedPolicy,
  insuredSummaryName,
  sidebarRows,
  bankAccountNumber,
  bankIfscCode,
  onBankAccountChange,
  onBankIfscChange,
  onBack,
  onSkip,
  onSubmit,
  submitDisabled = false,
  skipDisabled = false,
}: CreateClaimBankVerificationStepProps) {
  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold leading-none text-pagination-text">
          {CREATE_CLAIM_BANK_VERIFICATION_SECTION.title}
        </h2>
        <p className="text-sm leading-5 text-pagination-text-muted">
          {CREATE_CLAIM_BANK_VERIFICATION_SECTION.subtitle}
        </p>
      </div>

      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="overflow-hidden rounded-[14px] border border-pagination-border bg-white">
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
              <p className="text-base font-semibold leading-none text-pagination-text">
                {CREATE_CLAIM_BANK_FORM.cardHeading}
              </p>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="bank-account-create-claim"
                    className="text-sm font-medium leading-none text-pagination-text"
                  >
                    {CREATE_CLAIM_BANK_FORM.accountNumber}
                  </label>
                  <Input
                    id="bank-account-create-claim"
                    value={bankAccountNumber}
                    onChange={(e) => onBankAccountChange(e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    inputMode="numeric"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="bank-ifsc-create-claim"
                    className="text-sm font-medium leading-none text-pagination-text"
                  >
                    {CREATE_CLAIM_BANK_FORM.ifscCode}
                  </label>
                  <Input
                    id="bank-ifsc-create-claim"
                    value={bankIfscCode}
                    onChange={(e) => onBankIfscChange(e.target.value.toUpperCase())}
                    placeholder=""
                    autoComplete="off"
                    maxLength={11}
                    className="uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <CreateClaimPolicySidebar
          rows={sidebarRows}
          rowDensity="comfortable"
          className="bg-accent border-pagination-border shrink-0 shadow-xs w-full rounded-[10px] border px-4 py-2 lg:w-width-280 lg:sticky lg:top-4 lg:max-h-[min(650px,calc(100vh-140px))] lg:overflow-y-auto"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CreateClaimSelectionSummary
          insuredName={insuredSummaryName}
          policyNumber={selectedPolicy.policyNumber}
        />
        <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-auto">
          {onBack ? (
            <Button
              type="button"
              variant="secondary"
              className="h-9 px-4 text-sm font-medium shadow-xs"
              onClick={onBack}
            >
              {CREATE_CLAIM_FOOTER.backCta}
            </Button>
          ) : null}
          {onSkip ? (
            <Button
              type="button"
              variant="secondary"
              className="h-9 px-4 text-sm font-medium shadow-xs"
              onClick={onSkip}
              disabled={skipDisabled}
            >
              {CREATE_CLAIM_BANK_VERIFICATION_FOOTER.skipCta}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="default"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="h-9 bg-create-claim-button px-4 text-sm font-medium text-create-claim-button-text shadow-xs hover:bg-create-claim-button-hover"
          >
            {CREATE_CLAIM_BANK_VERIFICATION_FOOTER.submitCta}
          </Button>
        </div>
      </div>
    </div>
  );
}
