'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  useSkipDeathClaimBankDetailsMutation,
  useSubmitDeathClaimBankDetailsMutation,
} from '@/lib/query/createDeathClaim.queries';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import {
  readPartnerPortalApiErrorMessage,
  formatDeathClaimCreatedSuccessMessage,
} from '@/lib/utils/createClaim';

import type { CreateClaimUrlState } from './useCreateClaimUrlState';

export type UseDeathClaimBankVerificationOptions = {
  insuredNameField: string;
  isAccidentalDeathClaim: boolean;
  selectedPolicy: RecentSearchPolicy | null;
  url: CreateClaimUrlState;
};

export function useDeathClaimBankVerification({
  insuredNameField,
  isAccidentalDeathClaim,
  selectedPolicy,
  url,
}: UseDeathClaimBankVerificationOptions) {
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankDetailsFailureDialogOpen, setBankDetailsFailureDialogOpen] = useState(false);
  const [bankDetailsFailureMessage, setBankDetailsFailureMessage] = useState('');

  const submitDeathClaimBankDetailsMutation = useSubmitDeathClaimBankDetailsMutation();
  const skipDeathClaimBankDetailsMutation = useSkipDeathClaimBankDetailsMutation();

  const resetBankDetails = () => {
    setBankAccountNumber('');
    setBankIfscCode('');
  };

  const navigateToClaimsManagementSuccess = (message: string) => {
    toast.success(message);
    url.goToClaimsManagement();
  };

  const getDeathClaimPostBankSuccessToast = (): string => {
    if (!selectedPolicy) {
      return 'Claim submitted successfully.';
    }
    const insuredDisplay =
      insuredNameField.trim() ||
      selectedPolicy.persons?.[0]?.insured?.name?.trim() ||
      'the insured';
    const claimId = url.urlClaimRequestNumber.trim();
    if (!claimId) {
      return 'Claim submitted successfully.';
    }
    return formatDeathClaimCreatedSuccessMessage(
      insuredDisplay,
      selectedPolicy.policyNumber,
      claimId,
    );
  };

  const handleSkipDeathClaimBankStep = async () => {
    const machineInstanceId = url.urlMachineInstanceId.trim();
    if (isAccidentalDeathClaim && machineInstanceId) {
      try {
        const response = await skipDeathClaimBankDetailsMutation.mutateAsync({
          machineInstanceId,
        });
        if (!response.success) {
          toast.error(response.message || 'Unable to skip bank verification');
          return;
        }
        navigateToClaimsManagementSuccess(getDeathClaimPostBankSuccessToast());
      } catch (error) {
        toast.error(readPartnerPortalApiErrorMessage(error, 'Unable to skip bank verification'));
      }
      return;
    }
    navigateToClaimsManagementSuccess('Claim submitted successfully.');
  };

  const handleDismissBankFailureWithSkip = async () => {
    const machineInstanceId = url.urlMachineInstanceId.trim();
    if (!machineInstanceId) {
      setBankDetailsFailureDialogOpen(false);
      return;
    }
    try {
      const response = await skipDeathClaimBankDetailsMutation.mutateAsync({
        machineInstanceId,
      });
      if (!response.success) {
        toast.error(response.message || 'Unable to skip bank verification');
        return;
      }
      setBankDetailsFailureDialogOpen(false);
      navigateToClaimsManagementSuccess(getDeathClaimPostBankSuccessToast());
    } catch (error) {
      toast.error(readPartnerPortalApiErrorMessage(error, 'Unable to skip bank verification'));
    }
  };

  const handleSubmitClaim = async () => {
    if (!bankAccountNumber.trim() || !bankIfscCode.trim()) {
      toast.error('Enter account number and IFSC code');
      return;
    }
    const machineInstanceId = url.urlMachineInstanceId.trim();
    if (isAccidentalDeathClaim && machineInstanceId) {
      try {
        const response = await submitDeathClaimBankDetailsMutation.mutateAsync({
          machineInstanceId,
          payload: {
            account_number: bankAccountNumber.trim(),
            ifsc_code: bankIfscCode.trim(),
          },
        });
        if (!response.success) {
          setBankDetailsFailureMessage(response.message || 'Unable to save bank details');
          setBankDetailsFailureDialogOpen(true);
          return;
        }
        navigateToClaimsManagementSuccess(getDeathClaimPostBankSuccessToast());
      } catch (error) {
        setBankDetailsFailureMessage(
          readPartnerPortalApiErrorMessage(error, 'Unable to save bank details'),
        );
        setBankDetailsFailureDialogOpen(true);
      }
      return;
    }
    navigateToClaimsManagementSuccess('Claim submitted successfully.');
  };

  const bankStepMutationPending =
    submitDeathClaimBankDetailsMutation.isPending || skipDeathClaimBankDetailsMutation.isPending;

  return {
    bankAccountNumber,
    bankDetailsFailureDialogOpen,
    bankDetailsFailureMessage,
    bankIfscCode,
    bankStepMutationPending,
    handleDismissBankFailureWithSkip,
    handleSkipDeathClaimBankStep,
    handleSubmitClaim,
    resetBankDetails,
    setBankAccountNumber,
    setBankDetailsFailureDialogOpen,
    setBankIfscCode,
    skipDeathClaimBankDetailsPending: skipDeathClaimBankDetailsMutation.isPending,
  };
}

export type DeathClaimBankVerificationState = ReturnType<typeof useDeathClaimBankVerification>;
