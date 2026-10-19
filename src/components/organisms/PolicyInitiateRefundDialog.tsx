'use client';

import { Loader2 } from 'lucide-react';
import { PolicyInitiateRefundDestinationOptions } from '@/components/molecules/PolicyInitiateRefundDestinationOptions';
import { PolicyCashfreeReinitiateRefundDialog } from '@/components/organisms/PolicyCashfreeReinitiateRefundDialog';
import { PolicyManualRefundDetailsStep } from '@/components/organisms/PolicyManualRefundDetailsStep';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';
import { usePolicyInitiateRefundFlow } from '@/lib/hooks/usePolicyInitiateRefundFlow';
import { usePartnerStore } from '@/lib/store/partner.store';
import type { PolicyRefundDetailsData } from '@/lib/types/policy-management/policyRefundApi';
import { hasPermission } from '@/lib/utils/permissionUtils';

type PolicyInitiateRefundDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyNumber: string;
  policyId: string;
  plan: string;
  insuredName: string;
  refundDetails?: PolicyRefundDetailsData;
  entryMode?: 'default' | 'manual';
  onSuccess: () => Promise<void>;
};

export function PolicyInitiateRefundDialog({
  open,
  onOpenChange,
  policyNumber,
  policyId,
  plan,
  insuredName,
  refundDetails,
  entryMode = 'default',
  onSuccess,
}: PolicyInitiateRefundDialogProps) {
  const permissions = usePartnerStore((state) => state.permissions);
  const canInitiateRefund = hasPermission(permissions, PERMISSIONS.ADD_TCS_TDS_TRANSACTIONS);
  const {
    activeStep,
    refundDestination,
    isCashfreeModalOpen,
    handleRefundDestinationChange,
    closeCashfreeModal,
    handleBack,
    handlePrimaryAction,
    handleCashfreeSubmit,
    primaryActionLabel,
    isSubmitting,
    isCashfreeSubmitDisabled,
    isManualRefundSubmitDisabled,
    manualRefundForm,
    manualRefundFormErrors,
    handleManualRefundFieldChange,
    reinitiateRefundForm,
    reinitiateRefundFormErrors,
    handleReinitiateRefundFieldChange,
    confirmAccountNumberFeedback,
    ifscCodeFormatError,
    retryRefundOption,
    handleRetryRefundOptionChange,
    selectedBankAccount,
    bankAccountSelectOptions,
    isRefundBankDetailsLoading,
    hasPartnerBankDetailsError,
    selectedAccountDetails,
    selectedBankAccountError,
    handleSelectedBankAccountChange,
  } = usePolicyInitiateRefundFlow({
    open,
    policyNumber,
    policyId,
    plan,
    insuredName,
    refundDetails,
    entryMode,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  const showDestinationStep = activeStep === 1 && entryMode !== 'manual';
  const showManualRefundDetails = activeStep === 2 && refundDestination === 'float';

  if (!canInitiateRefund) {
    return null;
  }

  return (
    <>
      <Dialog open={open && !isCashfreeModalOpen} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton className="gap-4 p-6 sm:max-w-[720px]">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-lg font-semibold leading-none text-foreground">
              {POLICY_INITIATE_REFUND_DIALOG.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-muted-foreground">
              {POLICY_INITIATE_REFUND_DIALOG.selectedPolicyLabel}:{' '}
              <span className="text-foreground">{policyNumber}</span>
            </DialogDescription>
          </DialogHeader>

          {showDestinationStep ? (
            <PolicyInitiateRefundDestinationOptions
              refundDestination={refundDestination}
              onSelectManual={() => handleRefundDestinationChange('float')}
              onSelectCashfree={() => handleRefundDestinationChange('bank')}
            />
          ) : null}

          {showManualRefundDetails ? (
            <PolicyManualRefundDetailsStep
              formValues={manualRefundForm}
              formErrors={manualRefundFormErrors}
              onFieldChange={handleManualRefundFieldChange}
            />
          ) : null}

          <DialogFooter className="gap-2 pt-3.5 sm:justify-end">
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
              {POLICY_INITIATE_REFUND_DIALOG.backLabel}
            </Button>
            <Button
              type="button"
              onClick={handlePrimaryAction}
              disabled={
                isSubmitting || (showManualRefundDetails && isManualRefundSubmitDisabled)
              }
              className="bg-claims-details-action-button-bg text-claims-details-action-button-text hover:bg-claims-details-action-button-hover-bg hover:text-claims-details-action-button-hover-text shadow-claims-details-action-button"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                primaryActionLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PolicyCashfreeReinitiateRefundDialog
        open={open && isCashfreeModalOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeCashfreeModal();
          }
        }}
        refundDetails={refundDetails}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isCashfreeSubmitDisabled}
        retryRefundOption={retryRefundOption}
        onRetryRefundOptionChange={handleRetryRefundOptionChange}
        selectedBankAccount={selectedBankAccount}
        bankAccountSelectOptions={bankAccountSelectOptions}
        isRefundBankDetailsLoading={isRefundBankDetailsLoading}
        hasPartnerBankDetailsError={hasPartnerBankDetailsError}
        selectedAccountDetails={selectedAccountDetails}
        selectedBankAccountError={selectedBankAccountError}
        onSelectedBankAccountChange={handleSelectedBankAccountChange}
        formValues={reinitiateRefundForm}
        formErrors={reinitiateRefundFormErrors}
        onFieldChange={handleReinitiateRefundFieldChange}
        confirmAccountNumberFeedback={confirmAccountNumberFeedback}
        ifscCodeFormatError={ifscCodeFormatError}
        onBack={closeCashfreeModal}
        onSubmit={handleCashfreeSubmit}
      />
    </>
  );
}
