'use client';

import type { ClipboardEvent, ReactNode } from 'react';
import { LabeledInput } from '@/components/molecules/LabeledInput';
import { PolicyPartnerBankAccountDetailsCard } from '@/components/molecules/PolicyPartnerBankAccountDetailsCard';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';
import {
  getConfirmAccountNumberFieldClassName,
  type ConfirmAccountNumberFeedback,
} from '@/lib/utils/bankAccountForm.utils';
import { getIfscCodeFieldClassName } from '@/lib/utils/ifscCode.utils';
import type { PolicyRefundBankDetail } from '@/lib/types/policy-management/policyRefundApi';
import type {
  PolicyReinitiateRefundFormErrors,
  PolicyReinitiateRefundFormValues,
  PolicyRetryRefundOption,
} from '@/lib/types/policy-management/policyReinitiateRefund';

const preventAccountNumberClipboard = (event: ClipboardEvent<HTMLInputElement>) => {
  event.preventDefault();
};

type PolicyReinitiateRefundBankDetailsStepProps = {
  formValues: PolicyReinitiateRefundFormValues;
  formErrors: PolicyReinitiateRefundFormErrors;
  retryRefundOption?: PolicyRetryRefundOption;
  showStepLabel?: boolean;
  selectedBankAccount?: string;
  bankAccountSelectOptions?: Array<{ value: string; label: string }>;
  isRefundBankDetailsLoading?: boolean;
  hasPartnerBankDetailsError?: boolean;
  selectedPartnerBankDetails?: PolicyRefundBankDetail;
  selectedBankAccountError?: string;
  onSelectedBankAccountChange?: (value: string) => void;
  onFieldChange: (field: keyof PolicyReinitiateRefundFormValues, value: string) => void;
  confirmAccountNumberFeedback?: ConfirmAccountNumberFeedback | null;
  ifscCodeFormatError?: string | null;
};

type ReinitiateBankFieldProps = {
  error?: string;
  success?: string;
  errorTone?: 'default' | 'muted';
  children: ReactNode;
};

const endorsementDropdownTriggerStyles =
  'h-9 w-full justify-between rounded-md border-labeled-select-border bg-white px-4 py-2 text-sm font-medium text-labeled-select-text shadow-labeled-select-trigger';

const endorsementDropdownContentStyles =
  'rounded-md border border-labeled-select-border bg-white p-1 shadow-labeled-select';

const endorsementDropdownItemStyles =
  'focus:bg-labeled-select-accent-bg focus:text-labeled-select-accent data-[state=checked]:bg-labeled-select-accent-bg data-[state=checked]:text-labeled-select-accent [&>span]:hidden rounded-labeled-select-item px-2 py-1.5 text-sm text-labeled-select-text';

const ReinitiateBankField = ({
  error,
  success,
  errorTone = 'default',
  children,
}: ReinitiateBankFieldProps) => (
  <div className="flex flex-col gap-1">
    {children}
    {success ? (
      <p className="text-xs text-green-600">{success}</p>
    ) : error ? (
      <p
        className={
          errorTone === 'muted' ? 'text-xs text-muted-foreground' : 'text-xs text-destructive'
        }
      >
        {error}
      </p>
    ) : null}
  </div>
);

export function PolicyReinitiateRefundBankDetailsStep({
  formValues,
  formErrors,
  retryRefundOption = 'correct_bank_details',
  showStepLabel = true,
  selectedBankAccount = '',
  bankAccountSelectOptions = [],
  isRefundBankDetailsLoading = false,
  hasPartnerBankDetailsError = false,
  selectedPartnerBankDetails,
  selectedBankAccountError,
  onSelectedBankAccountChange,
  onFieldChange,
  confirmAccountNumberFeedback = null,
  ifscCodeFormatError = null,
}: PolicyReinitiateRefundBankDetailsStepProps) {
  const fields = POLICY_INITIATE_REFUND_DIALOG.reinitiateBankFields;
  const isPartnerBankAccountOption = retryRefundOption === 'partner_bank_account';
  const confirmAccountNumberHasError =
    Boolean(formErrors.confirmAccountNumber) || confirmAccountNumberFeedback?.type === 'error';
  const confirmAccountNumberErrorMessage =
    formErrors.confirmAccountNumber ??
    (confirmAccountNumberFeedback?.type === 'error' ? confirmAccountNumberFeedback.message : undefined);
  const confirmAccountNumberSuccessMessage =
    confirmAccountNumberFeedback?.type === 'success' ? confirmAccountNumberFeedback.message : undefined;
  const ifscCodeErrorMessage = formErrors.ifscCode ?? ifscCodeFormatError ?? undefined;
  const ifscCodeHasError = Boolean(ifscCodeErrorMessage);

  if (isPartnerBankAccountOption) {
    return (
      <div className="flex flex-col gap-4">
        {showStepLabel ? (
          <p className="text-sm font-medium leading-none text-foreground">
            {POLICY_INITIATE_REFUND_DIALOG.stepTwoCashfreeLabel}
          </p>
        ) : null}

        <div className="flex w-full max-w-sm flex-col gap-2">
          <Label className="text-sm leading-none font-medium text-foreground">
            {fields.selectBankAccount.label}
          </Label>
          <Select
            value={selectedBankAccount || undefined}
            onValueChange={onSelectedBankAccountChange}
            disabled={isRefundBankDetailsLoading || hasPartnerBankDetailsError}
          >
            <SelectTrigger className={endorsementDropdownTriggerStyles}>
              <SelectValue
                placeholder={
                  isRefundBankDetailsLoading
                    ? 'Loading accounts...'
                    : fields.selectBankAccount.placeholder
                }
              />
            </SelectTrigger>
            <SelectContent className={endorsementDropdownContentStyles}>
              {bankAccountSelectOptions.map((account) => (
                <SelectItem
                  key={account.value}
                  value={account.value}
                  className={endorsementDropdownItemStyles}
                >
                  {account.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedBankAccountError ? (
            <p className="text-xs text-destructive">{selectedBankAccountError}</p>
          ) : null}
        </div>

        <PolicyPartnerBankAccountDetailsCard
          accountDetails={selectedPartnerBankDetails}
          hasLoadError={hasPartnerBankDetailsError}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {showStepLabel ? (
        <p className="text-sm font-medium leading-none text-foreground">
          {POLICY_INITIATE_REFUND_DIALOG.stepTwoCashfreeLabel}
        </p>
      ) : null}

      <div className="rounded-md border border-border bg-primary-foreground p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium leading-none text-foreground">
            {fields.customerBankDetailsTitle}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <ReinitiateBankField
              error={formErrors.accountNumber}
              errorTone={
                formErrors.accountNumber === fields.accountNumber.invalidMessage
                  ? 'muted'
                  : 'default'
              }
            >
              <LabeledInput
                label={fields.accountNumber.label}
                placeholder={fields.accountNumber.placeholder}
                value={formValues.accountNumber}
                onChange={(value) => onFieldChange('accountNumber', value)}
                onCopy={preventAccountNumberClipboard}
                onCut={preventAccountNumberClipboard}
                onPaste={preventAccountNumberClipboard}
                aria-invalid={Boolean(formErrors.accountNumber)}
                className={formErrors.accountNumber ? 'border-destructive' : undefined}
              />
            </ReinitiateBankField>

            <ReinitiateBankField
              error={confirmAccountNumberErrorMessage}
              success={confirmAccountNumberSuccessMessage}
            >
              <LabeledInput
                label={fields.confirmAccountNumber.label}
                placeholder={fields.confirmAccountNumber.placeholder}
                value={formValues.confirmAccountNumber}
                onChange={(value) => onFieldChange('confirmAccountNumber', value)}
                onCopy={preventAccountNumberClipboard}
                onCut={preventAccountNumberClipboard}
                onPaste={preventAccountNumberClipboard}
                aria-invalid={confirmAccountNumberHasError}
                className={getConfirmAccountNumberFieldClassName({
                  feedback: confirmAccountNumberFeedback,
                  hasFormError: Boolean(formErrors.confirmAccountNumber),
                })}
              />
            </ReinitiateBankField>

            <ReinitiateBankField error={formErrors.accountHolderName}>
              <LabeledInput
                label={fields.accountHolderName.label}
                placeholder={fields.accountHolderName.placeholder}
                value={formValues.accountHolderName}
                onChange={(value) => onFieldChange('accountHolderName', value)}
                aria-invalid={Boolean(formErrors.accountHolderName)}
                className={formErrors.accountHolderName ? 'border-destructive' : undefined}
              />
            </ReinitiateBankField>

            <ReinitiateBankField error={ifscCodeErrorMessage}>
              <LabeledInput
                label={fields.ifscCode.label}
                placeholder={fields.ifscCode.placeholder}
                value={formValues.ifscCode}
                onChange={(value) => onFieldChange('ifscCode', value)}
                maxLength={11}
                aria-invalid={ifscCodeHasError}
                className={getIfscCodeFieldClassName({
                  hasFormError: Boolean(formErrors.ifscCode),
                  hasFormatError: Boolean(ifscCodeFormatError),
                })}
              />
            </ReinitiateBankField>
          </div>

          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs leading-none text-yellow-800">{fields.transferNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
