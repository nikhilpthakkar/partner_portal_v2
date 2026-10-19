'use client';

import { Loader2 } from 'lucide-react';
import { PolicyInitiateRefundModalFailedAlert } from '@/components/molecules/PolicyInitiateRefundModalFailedAlert';
import { PolicyRetryRefundOptions } from '@/components/molecules/PolicyRetryRefundOptions';
import { PolicyReinitiateRefundBankDetailsStep } from '@/components/organisms/PolicyReinitiateRefundBankDetailsStep';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';
import type { ConfirmAccountNumberFeedback } from '@/lib/utils/bankAccountForm.utils';
import type { PolicyRefundDetailsData, PolicyRefundBankDetail } from '@/lib/types/policy-management/policyRefundApi';
import type {
  PolicyReinitiateRefundFormErrors,
  PolicyReinitiateRefundFormValues,
  PolicyRetryRefundOption,
} from '@/lib/types/policy-management/policyReinitiateRefund';
import {
  getCashfreeRetryModalFailedAlert,
  shouldShowInitiateRefundModalFailedAlert,
} from '@/lib/utils/policyRefundDetails.utils';

type PolicyCashfreeReinitiateRefundDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refundDetails?: PolicyRefundDetailsData;
  isSubmitting: boolean;
  isSubmitDisabled?: boolean;
  formValues: PolicyReinitiateRefundFormValues;
  formErrors: PolicyReinitiateRefundFormErrors;
  retryRefundOption: PolicyRetryRefundOption;
  onRetryRefundOptionChange: (option: PolicyRetryRefundOption) => void;
  selectedBankAccount: string;
  bankAccountSelectOptions: Array<{ value: string; label: string }>;
  isRefundBankDetailsLoading: boolean;
  hasPartnerBankDetailsError: boolean;
  selectedAccountDetails?: PolicyRefundBankDetail;
  selectedBankAccountError?: string;
  onSelectedBankAccountChange: (value: string) => void;
  onFieldChange: (field: keyof PolicyReinitiateRefundFormValues, value: string) => void;
  confirmAccountNumberFeedback?: ConfirmAccountNumberFeedback | null;
  ifscCodeFormatError?: string | null;
  onBack: () => void;
  onSubmit: () => void;
};

export function PolicyCashfreeReinitiateRefundDialog({
  open,
  onOpenChange,
  refundDetails,
  isSubmitting,
  isSubmitDisabled = false,
  formValues,
  formErrors,
  retryRefundOption,
  onRetryRefundOptionChange,
  selectedBankAccount,
  bankAccountSelectOptions,
  isRefundBankDetailsLoading,
  hasPartnerBankDetailsError,
  selectedAccountDetails,
  selectedBankAccountError,
  onSelectedBankAccountChange,
  onFieldChange,
  confirmAccountNumberFeedback = null,
  ifscCodeFormatError = null,
  onBack,
  onSubmit,
}: PolicyCashfreeReinitiateRefundDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onBack();
    }
    onOpenChange(nextOpen);
  };

  const showFailedAlert = shouldShowInitiateRefundModalFailedAlert(refundDetails);
  const failedAlert = getCashfreeRetryModalFailedAlert(refundDetails);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton className="gap-4 p-6 sm:max-w-[720px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-semibold leading-none text-foreground">
            {POLICY_INITIATE_REFUND_DIALOG.bankOption.title}
          </DialogTitle>
        </DialogHeader>

        {showFailedAlert ? (
          <PolicyInitiateRefundModalFailedAlert
            title={failedAlert.title}
            description={failedAlert.description}
          />
        ) : null}

        <PolicyRetryRefundOptions
          retryRefundOption={retryRefundOption}
          onRetryRefundOptionChange={onRetryRefundOptionChange}
          disabled={isSubmitting}
        />

        <PolicyReinitiateRefundBankDetailsStep
          formValues={formValues}
          formErrors={formErrors}
          retryRefundOption={retryRefundOption}
          showStepLabel={false}
          selectedBankAccount={selectedBankAccount}
          bankAccountSelectOptions={bankAccountSelectOptions}
          isRefundBankDetailsLoading={isRefundBankDetailsLoading}
          hasPartnerBankDetailsError={hasPartnerBankDetailsError}
          selectedPartnerBankDetails={selectedAccountDetails}
          selectedBankAccountError={selectedBankAccountError}
          onSelectedBankAccountChange={onSelectedBankAccountChange}
          onFieldChange={onFieldChange}
          confirmAccountNumberFeedback={confirmAccountNumberFeedback}
          ifscCodeFormatError={ifscCodeFormatError}
        />

        <DialogFooter className="gap-2 pt-3.5 sm:justify-end">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            {POLICY_INITIATE_REFUND_DIALOG.backLabel}
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isSubmitDisabled}
            className="bg-claims-details-action-button-bg text-claims-details-action-button-text hover:bg-claims-details-action-button-hover-bg hover:text-claims-details-action-button-hover-text shadow-claims-details-action-button"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            ) : (
              POLICY_INITIATE_REFUND_DIALOG.submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
