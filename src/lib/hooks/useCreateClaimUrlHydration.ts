'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  CREATE_CLAIM_TYPE_OPTIONS,
  CreateClaimFlowStepId,
} from '@/lib/constants/createClaim.constants';
import { useCachedPolicyDetailsQuery } from '@/lib/query/policyDetails.queries';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import { clearClaimSessionForm, readClaimSessionForm } from '@/lib/utils/claimSessionStorage';
import {
  limitIncidentDescriptionWords,
  mapPolicyDetailsApiPolicyToRecentSearchPolicy,
  parseCreateClaimFlowUrlState,
  resolvePostClaimTypeStepFromUrl,
} from '@/lib/utils/createClaim';
import { CREATE_CLAIM_INCIDENT_WORD_LIMIT } from '@/lib/constants/createClaim.constants';
import type { ClaimSessionFormSnapshot } from '@/lib/types/claims-management/claimSession';
import type { CreateClaimUrlState } from './useCreateClaimUrlState';

export type UseCreateClaimUrlHydrationOptions = {
  canCreateClaim: boolean;
  hydrateClaimDetailsForm: (storedForm: ClaimSessionFormSnapshot) => void;
  resetClaimWorkflowState: (policy: RecentSearchPolicy) => void;
  selectedPolicy: RecentSearchPolicy | null;
  setSelectedClaimTypeId: (claimTypeId: string | null) => void;
  setSelectedPolicy: (policy: RecentSearchPolicy) => void;
  setWizardStep: (step: CreateClaimFlowStepId) => void;
  url: CreateClaimUrlState;
};

export function useCreateClaimUrlHydration({
  canCreateClaim,
  hydrateClaimDetailsForm,
  resetClaimWorkflowState,
  selectedPolicy,
  setSelectedClaimTypeId,
  setSelectedPolicy,
  setWizardStep,
  url,
}: UseCreateClaimUrlHydrationOptions) {
  const needsPolicyFromUrl = Boolean(
    url.urlPolicyNumber && (!selectedPolicy || selectedPolicy.policyNumber !== url.urlPolicyNumber),
  );
  const {
    data: policyFromUrlResponse,
    isSuccess: isPolicyFromUrlSuccess,
    isError: isPolicyFromUrlError,
    isPending: isPolicyFromUrlPending,
    isFetching: isPolicyFromUrlFetching,
  } = useCachedPolicyDetailsQuery({
    policyNumber: url.urlPolicyNumber,
    enabled: canCreateClaim && needsPolicyFromUrl,
  });

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate wizard from policy query + URL (incl. claim draft) */
  useEffect(() => {
    if (!canCreateClaim || !url.urlPolicyNumber || !needsPolicyFromUrl) return;
    if (isPolicyFromUrlError) {
      toast.error('Unable to load policy');
      url.clearCreateClaimUrl();
      return;
    }
    if (!isPolicyFromUrlSuccess) return;
    const apiPolicy = policyFromUrlResponse?.data?.policies?.[0];
    if (!apiPolicy) {
      toast.error('Policy not found');
      url.clearCreateClaimUrl();
      return;
    }
    if (apiPolicy.policyNumber.trim() !== url.urlPolicyNumber.trim()) {
      return;
    }
    const recent = mapPolicyDetailsApiPolicyToRecentSearchPolicy(apiPolicy);
    setSelectedPolicy(recent);
    const validClaimType =
      url.urlClaimType &&
      CREATE_CLAIM_TYPE_OPTIONS.some((option) => option.id === url.urlClaimType);

    if (!validClaimType) {
      setSelectedClaimTypeId(null);
      setWizardStep(CreateClaimFlowStepId.SelectClaimType);
      if (url.urlState || url.urlClaimSession) {
        toast.error('Missing or invalid claim type');
        url.replaceWithPolicyOnly(url.urlPolicyNumber);
      }
      return;
    }

    setSelectedClaimTypeId(url.urlClaimType);
    const postStep = resolvePostClaimTypeStepFromUrl(url.urlState);

    if (postStep === CreateClaimFlowStepId.AddClaimDetails) {
      const storedForm = url.urlClaimSession ? readClaimSessionForm(url.urlClaimSession) : null;

      if (storedForm) {
        hydrateClaimDetailsForm({
          ...storedForm,
          descriptionOfIncident: limitIncidentDescriptionWords(
            storedForm.descriptionOfIncident,
            CREATE_CLAIM_INCIDENT_WORD_LIMIT,
          ),
        });
        setWizardStep(CreateClaimFlowStepId.AddClaimDetails);
        if (!parseCreateClaimFlowUrlState(url.urlState)) {
          url.replacePostClaimTypeStep(
            url.urlPolicyNumber,
            url.urlClaimType,
            CreateClaimFlowStepId.AddClaimDetails,
          );
        }
      } else {
        resetClaimWorkflowState(recent);
        setWizardStep(CreateClaimFlowStepId.AddClaimDetails);
        if (url.urlClaimSession) {
          clearClaimSessionForm(url.urlClaimSession);
          url.replacePostClaimTypeStep(
            url.urlPolicyNumber,
            url.urlClaimType,
            CreateClaimFlowStepId.AddClaimDetails,
            { dropClaimSession: true },
          );
        } else if (!parseCreateClaimFlowUrlState(url.urlState)) {
          url.replacePostClaimTypeStep(
            url.urlPolicyNumber,
            url.urlClaimType,
            CreateClaimFlowStepId.AddClaimDetails,
          );
        }
      }
    } else if (postStep === CreateClaimFlowStepId.UploadRequiredDocuments) {
      const storedForm = url.urlClaimSession ? readClaimSessionForm(url.urlClaimSession) : null;
      if (storedForm) {
        hydrateClaimDetailsForm({
          ...storedForm,
          descriptionOfIncident: limitIncidentDescriptionWords(
            storedForm.descriptionOfIncident,
            CREATE_CLAIM_INCIDENT_WORD_LIMIT,
          ),
        });
      } else {
        resetClaimWorkflowState(recent);
      }
      setWizardStep(CreateClaimFlowStepId.UploadRequiredDocuments);
    } else {
      resetClaimWorkflowState(recent);
      setWizardStep(CreateClaimFlowStepId.BankVerification);
      if (url.urlClaimSession) {
        clearClaimSessionForm(url.urlClaimSession);
        url.replacePostClaimTypeStep(
          url.urlPolicyNumber,
          url.urlClaimType,
          CreateClaimFlowStepId.BankVerification,
          { dropClaimSession: true },
        );
      }
    }
  }, [
    canCreateClaim,
    url,
    needsPolicyFromUrl,
    isPolicyFromUrlSuccess,
    isPolicyFromUrlError,
    policyFromUrlResponse,
    hydrateClaimDetailsForm,
    resetClaimWorkflowState,
    setSelectedClaimTypeId,
    setSelectedPolicy,
    setWizardStep,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isPolicyFromUrlLoading =
    needsPolicyFromUrl &&
    (isPolicyFromUrlPending ||
      isPolicyFromUrlFetching ||
      isPolicyFromUrlError ||
      (isPolicyFromUrlSuccess && selectedPolicy?.policyNumber !== url.urlPolicyNumber));

  const showHydrationLoading =
    canCreateClaim && Boolean(url.urlPolicyNumber) && isPolicyFromUrlLoading;

  return {
    showHydrationLoading,
  };
}
