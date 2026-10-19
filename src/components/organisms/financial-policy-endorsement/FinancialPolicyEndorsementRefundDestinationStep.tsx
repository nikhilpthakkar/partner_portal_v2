import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PolicyRefundBankDetail } from '@/lib/types/policy-management/policyRefundApi';
import type {
  BankValidationConfirmation,
  NewBankAccountFormValues,
} from '@/types/financialPolicyEndorsement';
import type { RefundDestination } from '@/lib/types/policy-endorsement';
import {
  getConfirmAccountNumberFieldClassName,
  type ConfirmAccountNumberFeedback,
} from '@/lib/utils/bankAccountForm.utils';
import { getIfscCodeFieldClassName } from '@/lib/utils/ifscCode.utils';
import { RefundDestinationOptionCard } from '@/components/molecules/RefundDestinationOptionCard';

type FinancialPolicyEndorsementRefundDestinationStepProps = {
  refundDestination: RefundDestination;
  onRefundDestinationChange: (value: RefundDestination) => void;
  hideRefundDestinationOptions?: boolean;
  stepLabel?: string;
  isShowingBankValidationConfirmation: boolean;
  bankValidationConfirmation: BankValidationConfirmation | null;
  selectedBankAccount: string;
  onSelectedBankAccountChange: (value: string) => void;
  bankAccountSelectOptions: Array<{ value: string; label: string }>;
  insuredOptions: Array<{ value: string; label: string }>;
  isInsuredOptionsLoading: boolean;
  isRefundBankDetailsLoading: boolean;
  isAddingNewBankAccount: boolean;
  newBankAccountForm: NewBankAccountFormValues;
  onNewBankAccountFormChange: (field: keyof NewBankAccountFormValues, value: string) => void;
  confirmAccountNumberFeedback?: ConfirmAccountNumberFeedback | null;
  ifscCodeFormatError?: string | null;
  bankNameOptions: string[];
  shouldShowExistingAccountError: boolean;
  selectedAccountDetails?: PolicyRefundBankDetail;
  selectedBankAccountError?: string;
  newBankAccountFormErrors?: Partial<Record<keyof NewBankAccountFormValues, string>>;
};

const endorsementDropdownTriggerStyles =
  'h-9 w-full justify-between rounded-md border-labeled-select-border bg-white px-4 py-2 text-sm font-medium text-labeled-select-text shadow-labeled-select-trigger';

const endorsementDropdownContentStyles =
  'rounded-md border border-labeled-select-border bg-white p-1 shadow-labeled-select';

const endorsementDropdownItemStyles =
  'focus:bg-labeled-select-accent-bg focus:text-labeled-select-accent data-[state=checked]:bg-labeled-select-accent-bg data-[state=checked]:text-labeled-select-accent [&>span]:hidden rounded-labeled-select-item px-2 py-1.5 text-sm text-labeled-select-text';

const BankValidationConfirmationCard = ({
  bankValidationConfirmation,
}: {
  bankValidationConfirmation: BankValidationConfirmation;
}) => {
  const VerificationIcon = bankValidationConfirmation.isNameMatch ? Check : X;
  const verificationIconClassName = bankValidationConfirmation.isNameMatch
    ? 'text-endorse-policy-badge-success-text'
    : 'text-destructive';

  return (
    <>
      {!bankValidationConfirmation.isNameMatch ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-800 text-xs leading-none">
            {'The account holder details do not match with the bank details'}
          </p>
        </div>
      ) : null}
      <div className="rounded-endorse-policy-card border-endorse-policy-border bg-primary-foreground shadow-endorse-policy-card flex flex-col gap-4 border p-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-endorse-policy-text text-lg font-semibold leading-none">
            {'Verifying account details'}
          </p>
          <p className="text-endorse-policy-muted text-sm leading-5">
            {'To check if the entered bank account details match with the account holder'}
          </p>
        </div>
        <div className="rounded-md border-endorse-policy-border bg-muted/20 flex flex-col gap-4 border p-4">
          <div className="flex flex-col gap-2">
            <p className="text-endorse-policy-text text-sm font-medium leading-none">
              {'Policy holder name'}
            </p>
            <div className="border-endorse-policy-border bg-primary-foreground flex h-9 items-center gap-2 rounded-md border px-4">
              <p className="text-endorse-policy-text flex-1 truncate text-sm leading-5">
                {bankValidationConfirmation.policyHolderName}
              </p>
              <VerificationIcon className={`${verificationIconClassName} h-4 w-4 shrink-0`} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-endorse-policy-text text-sm font-medium leading-none">
              {'Bank account name'}
            </p>
            <div className="border-endorse-policy-border bg-primary-foreground flex h-9 items-center gap-2 rounded-md border px-4">
              <p className="text-endorse-policy-text flex-1 truncate text-sm leading-5">
                {bankValidationConfirmation.bankAccountName}
              </p>
              <VerificationIcon className={`${verificationIconClassName} h-4 w-4 shrink-0`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

type ExistingAccountDetailsCardProps = {
  selectedAccountDetails?: PolicyRefundBankDetail;
  shouldShowExistingAccountError: boolean;
};

const ExistingAccountDetailsCard = ({
  selectedAccountDetails,
  shouldShowExistingAccountError,
}: ExistingAccountDetailsCardProps) => {
  if (shouldShowExistingAccountError) {
    return (
      <div className="rounded-md border-endorse-policy-border bg-primary-foreground border p-4">
        <p className="text-endorse-policy-text text-sm font-medium leading-none">
          {'Unable to load bank accounts'}
        </p>
        <p className="text-endorse-policy-muted mt-2 text-sm leading-5">
          {'Please try again in a moment.'}
        </p>
      </div>
    );
  }

  if (!selectedAccountDetails) {
    return null;
  }

  return (
    <div className="rounded-md border-endorse-policy-border bg-primary-foreground flex flex-col gap-2 border p-4">
      <p className="text-endorse-policy-text text-sm font-medium leading-none">
        {'Account details'}
      </p>
      <div className="flex flex-col gap-2 text-xs leading-none">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-endorse-policy-muted">{'Account number'}</p>
            <p className="text-endorse-policy-text">{selectedAccountDetails.accountNumber}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-endorse-policy-muted">{'IFSC code'}</p>
            <p className="text-endorse-policy-text">{selectedAccountDetails.ifsc}</p>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-endorse-policy-muted">{'Bank name'}</p>
            <p className="text-endorse-policy-text">{selectedAccountDetails.bankName}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-endorse-policy-muted">{'Account holder'}</p>
            <p className="text-endorse-policy-text">{selectedAccountDetails.accountHolder}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

type NewBankAccountFormCardProps = {
  newBankAccountForm: NewBankAccountFormValues;
  onNewBankAccountFormChange: (field: keyof NewBankAccountFormValues, value: string) => void;
  confirmAccountNumberFeedback?: ConfirmAccountNumberFeedback | null;
  ifscCodeFormatError?: string | null;
  insuredOptions: Array<{ value: string; label: string }>;
  isInsuredOptionsLoading: boolean;
  bankNameOptions: string[];
  isRefundBankDetailsLoading: boolean;
  newBankAccountFormErrors?: Partial<Record<keyof NewBankAccountFormValues, string>>;
};

const NewBankAccountFormCard = ({
  newBankAccountForm,
  onNewBankAccountFormChange,
  confirmAccountNumberFeedback = null,
  ifscCodeFormatError = null,
  insuredOptions,
  isInsuredOptionsLoading,
  bankNameOptions,
  isRefundBankDetailsLoading,
  newBankAccountFormErrors,
}: NewBankAccountFormCardProps) => {
  const [isAccountNumberFocused, setIsAccountNumberFocused] = useState(false);
  const confirmAccountNumberHasError =
    Boolean(newBankAccountFormErrors?.confirmAccountNumber) ||
    confirmAccountNumberFeedback?.type === 'error';
  const confirmAccountNumberErrorMessage =
    newBankAccountFormErrors?.confirmAccountNumber ??
    (confirmAccountNumberFeedback?.type === 'error'
      ? confirmAccountNumberFeedback.message
      : undefined);
  const confirmAccountNumberSuccessMessage =
    confirmAccountNumberFeedback?.type === 'success'
      ? confirmAccountNumberFeedback.message
      : undefined;
  const ifscCodeErrorMessage =
    newBankAccountFormErrors?.ifscCode ?? ifscCodeFormatError ?? undefined;
  const ifscCodeHasError = Boolean(ifscCodeErrorMessage);

  const maskedAccountNumber = newBankAccountForm.accountNumber
    ? '*'.repeat(newBankAccountForm.accountNumber.length)
    : '';

  return (
    <div className="rounded-md border-endorse-policy-border bg-primary-foreground flex flex-col gap-4 border p-4">
      <div className="flex w-full max-w-sm flex-col gap-2">
        <p className="text-endorse-policy-text text-sm font-medium leading-none">{'Select bank'}</p>
        <Select
          value={newBankAccountForm.bankName}
          onValueChange={(value) => onNewBankAccountFormChange('bankName', value)}
          disabled={isRefundBankDetailsLoading || bankNameOptions.length === 0}
        >
          <SelectTrigger className={endorsementDropdownTriggerStyles}>
            <SelectValue
              placeholder={
                isRefundBankDetailsLoading
                  ? 'Loading banks...'
                  : bankNameOptions.length === 0
                    ? 'No banks available'
                    : 'Bank name'
              }
            />
          </SelectTrigger>
          <SelectContent className={endorsementDropdownContentStyles}>
            {bankNameOptions.map((bankName) => (
              <SelectItem key={bankName} value={bankName} className={endorsementDropdownItemStyles}>
                {bankName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {newBankAccountFormErrors?.bankName ? (
          <p className="text-destructive text-xs leading-none">
            {newBankAccountFormErrors.bankName}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-endorse-policy-text text-sm font-medium leading-none">
          {'Customer bank account details'}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-endorse-policy-text text-sm font-medium leading-none">
              {'Account number'}
            </p>
            <Input
              value={
                isAccountNumberFocused ? newBankAccountForm.accountNumber : maskedAccountNumber
              }
              onChange={(event) => onNewBankAccountFormChange('accountNumber', event.target.value)}
              onFocus={() => setIsAccountNumberFocused(true)}
              onBlur={() => setIsAccountNumberFocused(false)}
              onCopy={(event) => event.preventDefault()}
              onCut={(event) => event.preventDefault()}
              onPaste={(event) => event.preventDefault()}
              placeholder="Enter account number"
              className="h-9 rounded-md border-endorse-policy-border bg-white"
            />
            {newBankAccountFormErrors?.accountNumber ? (
              <p className="text-destructive text-xs leading-none">
                {newBankAccountFormErrors.accountNumber}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-endorse-policy-text text-sm font-medium leading-none">
              {'Confirm account number'}
            </p>
            <Input
              value={newBankAccountForm.confirmAccountNumber}
              onChange={(event) =>
                onNewBankAccountFormChange('confirmAccountNumber', event.target.value)
              }
              onCopy={(event) => event.preventDefault()}
              onCut={(event) => event.preventDefault()}
              onPaste={(event) => event.preventDefault()}
              placeholder="Enter account number"
              aria-invalid={confirmAccountNumberHasError}
              className={`h-9 rounded-md bg-white ${getConfirmAccountNumberFieldClassName({
                feedback: confirmAccountNumberFeedback,
                hasFormError: Boolean(newBankAccountFormErrors?.confirmAccountNumber),
                defaultClassName: 'border-endorse-policy-border shadow-xs',
              })}`}
            />
            {confirmAccountNumberSuccessMessage ? (
              <p className="text-xs leading-none text-green-600">
                {confirmAccountNumberSuccessMessage}
              </p>
            ) : confirmAccountNumberErrorMessage ? (
              <p className="text-destructive text-xs leading-none">
                {confirmAccountNumberErrorMessage}
              </p>
            ) : null}
          </div>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <p className="text-endorse-policy-text text-sm font-medium leading-none">
              {'Select insured'}
            </p>
            <Select
              value={newBankAccountForm.insuredPersonId}
              onValueChange={(value) => onNewBankAccountFormChange('insuredPersonId', value)}
              disabled={isInsuredOptionsLoading || insuredOptions.length === 0}
            >
              <SelectTrigger className={endorsementDropdownTriggerStyles}>
                <SelectValue
                  placeholder={
                    isInsuredOptionsLoading
                      ? 'Loading insured...'
                      : insuredOptions.length === 0
                        ? 'No insured available'
                        : 'Select insured'
                  }
                />
              </SelectTrigger>
              <SelectContent className={endorsementDropdownContentStyles}>
                {insuredOptions.map((insuredOption) => (
                  <SelectItem
                    key={insuredOption.value}
                    value={insuredOption.value}
                    className={endorsementDropdownItemStyles}
                  >
                    {insuredOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newBankAccountFormErrors?.insuredPersonId ? (
              <p className="text-destructive text-xs leading-none">
                {newBankAccountFormErrors.insuredPersonId}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-endorse-policy-text text-sm font-medium leading-none">
              {'IFSC code'}
            </p>
            <Input
              value={newBankAccountForm.ifscCode}
              onChange={(event) => onNewBankAccountFormChange('ifscCode', event.target.value)}
              onPaste={(event) => event.preventDefault()}
              placeholder="Enter IFSC code"
              maxLength={11}
              aria-invalid={ifscCodeHasError}
              className={`h-9 rounded-md bg-white uppercase ${getIfscCodeFieldClassName({
                hasFormError: Boolean(newBankAccountFormErrors?.ifscCode),
                hasFormatError: Boolean(ifscCodeFormatError),
                defaultClassName: 'border-endorse-policy-border shadow-xs',
              })}`}
            />
            {ifscCodeErrorMessage ? (
              <p className="text-destructive text-xs leading-none">{ifscCodeErrorMessage}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-endorse-policy-notice border border-yellow-200 bg-endorse-policy-notice-bg px-4 py-3">
        <p className="text-endorse-policy-notice-text text-sm leading-5">
          {'Note: Bank transfers may take up to 3-4 business days'}
        </p>
      </div>
    </div>
  );
};

export const FinancialPolicyEndorsementRefundDestinationStep = ({
  refundDestination,
  onRefundDestinationChange,
  hideRefundDestinationOptions = false,
  stepLabel,
  isShowingBankValidationConfirmation,
  bankValidationConfirmation,
  selectedBankAccount,
  onSelectedBankAccountChange,
  bankAccountSelectOptions,
  insuredOptions,
  isInsuredOptionsLoading,
  isRefundBankDetailsLoading,
  isAddingNewBankAccount,
  newBankAccountForm,
  onNewBankAccountFormChange,
  confirmAccountNumberFeedback = null,
  ifscCodeFormatError = null,
  bankNameOptions,
  shouldShowExistingAccountError,
  selectedAccountDetails,
  selectedBankAccountError,
  newBankAccountFormErrors,
}: FinancialPolicyEndorsementRefundDestinationStepProps) => {
  return (
    <div className="flex flex-col gap-4">
      {stepLabel ? (
        <p className="text-sm font-medium leading-none text-foreground">{stepLabel}</p>
      ) : !hideRefundDestinationOptions ? (
        <p className="text-endorse-policy-text text-sm font-medium leading-none">
          {'Step 3 of 3: Select refund mode'}
        </p>
      ) : null}
      {!hideRefundDestinationOptions ? (
        <div className="flex flex-col gap-2 md:flex-row">
          <RefundDestinationOptionCard
            isSelected={refundDestination === 'float'}
            title="Refund to float - Instant settlement"
            description="Credit directly to partner float account"
            onClick={() => onRefundDestinationChange('float')}
          />
          <RefundDestinationOptionCard
            isSelected={refundDestination === 'bank'}
            title="Bank transfer - Settlement in 3 days"
            description="Transfer to partner or customer bank account"
            onClick={() => onRefundDestinationChange('bank')}
          />
        </div>
      ) : null}

      {refundDestination === 'bank' ? (
        isShowingBankValidationConfirmation && bankValidationConfirmation ? (
          <BankValidationConfirmationCard bankValidationConfirmation={bankValidationConfirmation} />
        ) : (
          <>
            <div className="flex w-full max-w-sm flex-col gap-2">
              <p className="text-endorse-policy-text text-sm font-medium leading-none">
                {'Select bank account'}
              </p>
              <Select value={selectedBankAccount} onValueChange={onSelectedBankAccountChange}>
                <SelectTrigger className={endorsementDropdownTriggerStyles}>
                  <SelectValue
                    placeholder={isRefundBankDetailsLoading ? 'Loading accounts...' : ''}
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
                <p className="text-destructive text-xs leading-none">{selectedBankAccountError}</p>
              ) : null}
            </div>

            {isAddingNewBankAccount ? (
              <NewBankAccountFormCard
                newBankAccountForm={newBankAccountForm}
                onNewBankAccountFormChange={onNewBankAccountFormChange}
                confirmAccountNumberFeedback={confirmAccountNumberFeedback}
                ifscCodeFormatError={ifscCodeFormatError}
                insuredOptions={insuredOptions}
                isInsuredOptionsLoading={isInsuredOptionsLoading}
                bankNameOptions={bankNameOptions}
                isRefundBankDetailsLoading={isRefundBankDetailsLoading}
                newBankAccountFormErrors={newBankAccountFormErrors}
              />
            ) : (
              <ExistingAccountDetailsCard
                selectedAccountDetails={selectedAccountDetails}
                shouldShowExistingAccountError={shouldShowExistingAccountError}
              />
            )}
          </>
        )
      ) : null}
    </div>
  );
};
