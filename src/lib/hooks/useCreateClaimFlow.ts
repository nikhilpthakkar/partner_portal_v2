'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CREATE_CLAIM_TYPE_OPTIONS,
  CreateClaimFlowStepId,
} from '@/lib/constants/createClaim.constants';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { SegmentActionName } from '@/lib/constants/segments.constants';
import { usePartnerStore } from '@/lib/store/partner.store';
import { wizardStepIndex } from '@/lib/types/claims-management/createClaim';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { trackCreateClaimAction, trackCreateClaimPageView } from '@/lib/segment/track/claims';
import { createClaimSessionId } from '@/lib/utils/claimSessionStorage';
import { hasPermission } from '@/lib/utils/permissionUtils';
import {
  buildCreateClaimPolicySummaryRows,
  resolvePostClaimTypeStepFromUrl,
} from '@/lib/utils/createClaim';
import { useCreateClaimDetailsForm } from './useCreateClaimDetailsForm';
import { useCreateClaimDetailsSubmission } from './useCreateClaimDetailsSubmission';
import { useCreateClaimPolicySearch } from './useCreateClaimPolicySearch';
import { useCreateClaimUrlHydration } from './useCreateClaimUrlHydration';
import { useCreateClaimUrlState } from './useCreateClaimUrlState';
import { useDeathClaimBankVerification } from './useDeathClaimBankVerification';
import { useDeathClaimDocuments } from './useDeathClaimDocuments';

export function useCreateClaimFlow() {
  const url = useCreateClaimUrlState();
  const segmentBase = useSegmentPartnerBase();
  const permissions = usePartnerStore((state) => state.permissions);
  const canCreateClaim = hasPermission(permissions, PERMISSIONS.UPDATE_CLAIMS);

  const [wizardStep, setWizardStep] = useState<CreateClaimFlowStepId>(
    CreateClaimFlowStepId.SearchPolicy,
  );
  const [selectedPolicy, setSelectedPolicy] = useState<RecentSearchPolicy | null>(null);
  const [selectedClaimTypeId, setSelectedClaimTypeId] = useState<string | null>(null);
  const claimDetailsDraftRef = useRef<{
    claimSession: string;
    claimTypeId: string;
    policyNumber: string;
  } | null>(null);

  const accidentalDeathClaimTypeId = CREATE_CLAIM_TYPE_OPTIONS[0].id;
  const isAccidentalDeathClaim = selectedClaimTypeId === accidentalDeathClaimTypeId;

  const detailsForm = useCreateClaimDetailsForm({
    selectedClaimTypeId,
    selectedPolicy,
    urlClaimSession: url.urlClaimSession,
    wizardStep,
  });
  const documents = useDeathClaimDocuments({
    isAccidentalDeathClaim,
    selectedClaimTypeId,
    selectedPolicy,
    setWizardStep,
    url,
    wizardStep,
  });
  const bankVerification = useDeathClaimBankVerification({
    insuredNameField: detailsForm.insuredNameField,
    isAccidentalDeathClaim,
    selectedPolicy,
    url,
  });

  const resetClaimWorkflowState = useCallback(
    (policy: RecentSearchPolicy) => {
      detailsForm.resetClaimDetailsForm(policy);
      documents.resetDocuments();
      bankVerification.resetBankDetails();
    },
    [detailsForm, documents, bankVerification],
  );

  const hydration = useCreateClaimUrlHydration({
    canCreateClaim,
    hydrateClaimDetailsForm: detailsForm.hydrateClaimDetailsForm,
    resetClaimWorkflowState,
    selectedPolicy,
    setSelectedClaimTypeId,
    setSelectedPolicy,
    setWizardStep,
    url,
  });

  const policySearch = useCreateClaimPolicySearch({
    setSelectedPolicy,
    setWizardStep,
    url,
  });

  const detailsSubmission = useCreateClaimDetailsSubmission({
    detailsForm,
    selectedClaimTypeId,
    selectedPolicy,
    setWizardStep,
    url,
  });

  useEffect(() => {
    if (canCreateClaim) {
      trackCreateClaimPageView(segmentBase);
    }
  }, [canCreateClaim, segmentBase]);

  const handleBackToSearchPolicy = () => {
    setSelectedClaimTypeId(null);
    setWizardStep(CreateClaimFlowStepId.SearchPolicy);
    url.clearCreateClaimUrl();
  };

  const handleBackToClaimType = () => {
    if (selectedPolicy) {
      if (selectedClaimTypeId && url.urlClaimSession) {
        claimDetailsDraftRef.current = {
          claimSession: url.urlClaimSession,
          claimTypeId: selectedClaimTypeId,
          policyNumber: selectedPolicy.policyNumber,
        };
      }
      url.replaceWithPolicyOnly(selectedPolicy.policyNumber);
    }
    setWizardStep(CreateClaimFlowStepId.SelectClaimType);
  };

  const handleGoToClaimDetails = () => {
    if (!selectedClaimTypeId || !selectedPolicy) return;
    const reusableDraft =
      claimDetailsDraftRef.current?.policyNumber === selectedPolicy.policyNumber &&
      claimDetailsDraftRef.current.claimTypeId === selectedClaimTypeId
        ? claimDetailsDraftRef.current
        : null;
    const claimSession = reusableDraft?.claimSession ?? createClaimSessionId();

    if (!reusableDraft) {
      resetClaimWorkflowState(selectedPolicy);
    }
    setWizardStep(CreateClaimFlowStepId.AddClaimDetails);
    url.replacePostClaimTypeStep(
      selectedPolicy.policyNumber,
      selectedClaimTypeId,
      CreateClaimFlowStepId.AddClaimDetails,
      { claimSession, preserveExistingIdentifiers: false },
    );
  };

  const handleBackToClaimDetails = () => {
    if (!selectedPolicy || !selectedClaimTypeId) return;
    setWizardStep(CreateClaimFlowStepId.AddClaimDetails);
    url.replacePostClaimTypeStep(
      selectedPolicy.policyNumber,
      selectedClaimTypeId,
      CreateClaimFlowStepId.AddClaimDetails,
    );
  };

  const handleBackToUploadDocuments = () => {
    if (!selectedPolicy || !selectedClaimTypeId) return;
    setWizardStep(CreateClaimFlowStepId.UploadRequiredDocuments);
    url.replacePostClaimTypeStep(
      selectedPolicy.policyNumber,
      selectedClaimTypeId,
      CreateClaimFlowStepId.UploadRequiredDocuments,
    );
  };

  const handleNavigateToStep = (step: CreateClaimFlowStepId) => {
    if (wizardStepIndex(step) >= wizardStepIndex(wizardStep)) return;

    switch (step) {
      case CreateClaimFlowStepId.SearchPolicy:
        handleBackToSearchPolicy();
        return;
      case CreateClaimFlowStepId.SelectClaimType:
        handleBackToClaimType();
        return;
      case CreateClaimFlowStepId.AddClaimDetails:
        handleBackToClaimDetails();
        return;
      case CreateClaimFlowStepId.UploadRequiredDocuments:
        handleBackToUploadDocuments();
        return;
      case CreateClaimFlowStepId.BankVerification:
      default:
        return;
    }
  };

  const insuredSummaryName = selectedPolicy?.persons?.[0]?.insured?.name?.trim() || '—';
  const policySummaryStatus = selectedPolicy?.status?.toLowerCase() ?? '';
  const sidebarRowsSelectedPolicy =
    selectedPolicy != null
      ? buildCreateClaimPolicySummaryRows(selectedPolicy, insuredSummaryName)
      : [];

  const selectedPolicyNumber = selectedPolicy?.policyNumber;

  const handleTrackedSearch = () => {
    trackCreateClaimAction(segmentBase, {
      action_name: SegmentActionName.SEARCH_POLICY,
      entity_name: policySearch.searchFilter,
      value: policySearch.searchQuery.trim() || 'empty_query',
    });
    policySearch.handleSearch();
  };

  const handleTrackedSearchFilterChange = (value: string) => {
    trackCreateClaimAction(segmentBase, {
      action_name: SegmentActionName.CHANGE_SEARCH_FILTER,
      entity_name: value,
      value: policySearch.searchQuery.trim() || 'empty_query',
    });
    policySearch.handleSearchFilterChange(value);
  };

  const handleTrackedContinueToClaimType = () => {
    const row = policySearch.tableRows.find(
      (tableRow) => tableRow.id === policySearch.selectedRowId,
    );
    trackCreateClaimAction(segmentBase, {
      action_name: SegmentActionName.SELECT_POLICY_FOR_CLAIM,
      policy_number: row?.policyNumber,
    });
    policySearch.handleContinueToClaimType();
  };

  const handleTrackedSelectClaimTypeId = (claimTypeId: string | null) => {
    if (claimTypeId) {
      trackCreateClaimAction(segmentBase, {
        action_name: SegmentActionName.SELECT_CLAIM_TYPE,
        entity_name: claimTypeId,
        policy_number: selectedPolicyNumber,
      });
    }
    setSelectedClaimTypeId(claimTypeId);
  };

  const handleTrackedGoToClaimDetails = () => {
    trackCreateClaimAction(segmentBase, {
      action_name: SegmentActionName.CONTINUE_CREATE_CLAIM_STEP,
      entity_name: CreateClaimFlowStepId.SelectClaimType,
      policy_number: selectedPolicyNumber,
    });
    handleGoToClaimDetails();
  };

  const handleTrackedContinueToUploadDocuments = () => {
    trackCreateClaimAction(segmentBase, {
      action_name: SegmentActionName.SUBMIT_CREATE_CLAIM_DETAILS,
      entity_name: selectedClaimTypeId ?? undefined,
      policy_number: selectedPolicyNumber,
    });
    void detailsSubmission.handleContinueToUploadDocuments();
  };

  const handleTrackedUploadSlotFile =
    (slotId: string): ReturnType<typeof documents.handleUploadSlotFile> =>
    (event) => {
      const fileName = event.target.files?.[0]?.name;
      if (fileName) {
        trackCreateClaimAction(segmentBase, {
          action_name: SegmentActionName.UPLOAD_CREATE_CLAIM_DOCUMENT,
          entity_name: slotId,
          policy_number: selectedPolicyNumber,
          claim_number: url.urlClaimRequestNumber.trim() || undefined,
          value: fileName,
        });
      }
      documents.handleUploadSlotFile(slotId)(event);
    };

  const handleTrackedContinueToVerification = () => {
    trackCreateClaimAction(segmentBase, {
      action_name: SegmentActionName.SUBMIT_CREATE_CLAIM_DOCUMENTS,
      policy_number: selectedPolicyNumber,
      claim_number: url.urlClaimRequestNumber.trim() || undefined,
    });
    void documents.handleContinueToVerification();
  };

  const handleTrackedSubmitClaim = () => {
    trackCreateClaimAction(segmentBase, {
      action_name: SegmentActionName.SUBMIT_CREATE_CLAIM,
      policy_number: selectedPolicyNumber,
      claim_number: url.urlClaimRequestNumber.trim() || undefined,
    });
    void bankVerification.handleSubmitClaim();
  };

  const handleTrackedDismissBankFailureWithSkip = () => {
    trackCreateClaimAction(segmentBase, {
      action_name: SegmentActionName.SKIP_CREATE_CLAIM_BANK_VERIFICATION,
      policy_number: selectedPolicyNumber,
      claim_number: url.urlClaimRequestNumber.trim() || undefined,
    });
    void bankVerification.handleDismissBankFailureWithSkip();
  };

  const hydrationStepIndex =
    !url.urlClaimType || !CREATE_CLAIM_TYPE_OPTIONS.some((option) => option.id === url.urlClaimType)
      ? wizardStepIndex(CreateClaimFlowStepId.SelectClaimType)
      : wizardStepIndex(resolvePostClaimTypeStepFromUrl(url.urlState));

  return {
    ...detailsForm,
    ...documents,
    ...bankVerification,
    ...hydration,
    ...policySearch,
    ...detailsSubmission,
    canCreateClaim,
    currentFlowStepIdx: wizardStepIndex(wizardStep),
    handleBackToClaimDetails,
    handleBackToClaimType,
    handleBackToClaimsManagement: url.goToClaimsManagement,
    handleBackToSearchPolicy,
    handleBackToUploadDocuments,
    handleContinueToClaimType: handleTrackedContinueToClaimType,
    handleContinueToUploadDocuments: handleTrackedContinueToUploadDocuments,
    handleContinueToVerification: handleTrackedContinueToVerification,
    handleDismissBankFailureWithSkip: handleTrackedDismissBankFailureWithSkip,
    handleGoToClaimDetails: handleTrackedGoToClaimDetails,
    handleNavigateToStep,
    handleSearch: handleTrackedSearch,
    handleSearchFilterChange: handleTrackedSearchFilterChange,
    handleSubmitClaim: handleTrackedSubmitClaim,
    handleUploadSlotFile: handleTrackedUploadSlotFile,
    insuredSummaryName,
    isAccidentalDeathClaim,
    policySummaryStatus,
    selectedClaimTypeId,
    selectedPolicy,
    setSelectedClaimTypeId: handleTrackedSelectClaimTypeId,
    sidebarRowsSelectedPolicy,
    wizardStep,
    hydrationStepIndex,
  };
}

export type CreateClaimFlowState = ReturnType<typeof useCreateClaimFlow>;
