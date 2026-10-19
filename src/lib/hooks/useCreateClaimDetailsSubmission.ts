'use client';

import { toast } from 'sonner';
import {
  CREATE_CLAIM_TYPE_OPTIONS,
  CreateClaimFlowStepId,
} from '@/lib/constants/createClaim.constants';
import { useCreateDeathClaimMutation } from '@/lib/query/createDeathClaim.queries';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import { buildCreateDeathClaimRequestBody } from '@/lib/utils/buildDeathClaimRequest';
import { readPartnerPortalApiErrorMessage } from '@/lib/utils/createClaim';
import type { CreateClaimDetailsFormState } from './useCreateClaimDetailsForm';
import type { CreateClaimPostStepIdentifiers, CreateClaimUrlState } from './useCreateClaimUrlState';

export type UseCreateClaimDetailsSubmissionOptions = {
  detailsForm: CreateClaimDetailsFormState;
  selectedClaimTypeId: string | null;
  selectedPolicy: RecentSearchPolicy | null;
  setWizardStep: (step: CreateClaimFlowStepId) => void;
  url: CreateClaimUrlState;
};

export function useCreateClaimDetailsSubmission({
  detailsForm,
  selectedClaimTypeId,
  selectedPolicy,
  setWizardStep,
  url,
}: UseCreateClaimDetailsSubmissionOptions) {
  const createDeathClaimMutation = useCreateDeathClaimMutation();
  const accidentalDeathClaimTypeId = CREATE_CLAIM_TYPE_OPTIONS[0].id;

  const navigateToUploadDocumentsStep = (identifiers?: CreateClaimPostStepIdentifiers) => {
    if (!selectedPolicy || !selectedClaimTypeId) return;
    url.replacePostClaimTypeStep(
      selectedPolicy.policyNumber,
      selectedClaimTypeId,
      CreateClaimFlowStepId.UploadRequiredDocuments,
      { identifiers },
    );
    setWizardStep(CreateClaimFlowStepId.UploadRequiredDocuments);
  };

  const handleContinueToUploadDocuments = async () => {
    if (!selectedPolicy || !selectedClaimTypeId) return;
    if (selectedClaimTypeId !== accidentalDeathClaimTypeId) {
      navigateToUploadDocumentsStep();
      return;
    }

    try {
      const payload = buildCreateDeathClaimRequestBody({
        coverId: selectedClaimTypeId,
        policyNumber: selectedPolicy.policyNumber,
        selectedPolicy,
        insuredNameField: detailsForm.insuredNameField,
        informantName: detailsForm.informantName,
        informantPhone: detailsForm.informantPhone,
        informantEmail: detailsForm.informantEmail,
        nomineeName: detailsForm.nomineeName,
        nomineePhone: detailsForm.nomineePhone,
        nomineeEmail: detailsForm.nomineeEmail,
        nomineeDateOfBirth: detailsForm.nomineeDateOfBirth,
        dateOfIncident: detailsForm.dateOfIncident,
        dateOfIntimation: detailsForm.dateOfIntimation,
        descriptionOfIncident: detailsForm.descriptionOfIncident,
      });
      const response = await createDeathClaimMutation.mutateAsync(payload);
      const claimRequestNumber = response.data?.claimRequestNumber?.trim();
      const machineInstanceId = response.data?.machineInstanceId?.trim();
      if (!response.success || !claimRequestNumber || !machineInstanceId) {
        toast.error(response.message || 'Unable to create claim');
        return;
      }
      navigateToUploadDocumentsStep({ claimRequestNumber, machineInstanceId });
    } catch (error) {
      toast.error(readPartnerPortalApiErrorMessage(error, 'Unable to create claim'));
    }
  };

  return {
    createDeathClaimPending:
      selectedClaimTypeId === accidentalDeathClaimTypeId && createDeathClaimMutation.isPending,
    handleContinueToUploadDocuments,
  };
}

export type CreateClaimDetailsSubmissionState = ReturnType<typeof useCreateClaimDetailsSubmission>;
