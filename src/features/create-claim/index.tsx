'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Breadcrumbs from '@/components/molecules/Breadcrumbs';
import { PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import CancelledPolicyDialog from '@/components/organisms/CancelledPolicyDialog';
import ClaimCreationNotSupportedDialog from '@/components/organisms/ClaimCreationNotSupportedDialog';
import RaiseDisputeModal from '@/components/organisms/RaiseDisputeModal';
import ShareDetailsDialog from '@/components/organisms/ShareDetailsDialog';
import { CreateClaimStepper } from '@/components/organisms/create-claim/CreateClaimStepper';
import { FallbackState } from '@/components/templates/FallbackState';
import { ACCESS_DENIED_MESSAGE } from '@/lib/constants/auth.constants';
import { BankDetailsFailureDialog } from '@/components/organisms/create-claim/BankDetailsFailureDialog';
import { CreateClaimHydrationLoading } from '@/components/organisms/create-claim/CreateClaimHydrationLoading';
import { CreateClaimStepContent } from '@/components/organisms/create-claim/CreateClaimStepContent';
import { OTHERS_RECIPIENT_ID } from '@/lib/adapter/policy-share/policyShare.adapter';
import { SHARE_POLICY_INFO_TEXT } from '@/lib/constants/policy.constants';
import { SHARE_POLICY_CONFIG } from '@/lib/constants/policyShare.constants';
import { useCreateClaimFlow } from '@/lib/hooks/useCreateClaimFlow';
import { usePolicyShareDialog } from '@/lib/hooks/usePolicyShareDialog';
import { useCoveragePlanMappingQuery } from '@/lib/query/overview.queries';
import { isPlanEligibleForInAppClaimCreation } from '@/lib/utils/coveragePlanMapping.utils';
import { isCancelledPolicyStatus } from '@/lib/utils/policyStatus.utils';

export default function CreateClaimFlow() {
  const flow = useCreateClaimFlow();
  const router = useRouter();
  const { partner } = useParams<{ partner: string }>();
  const [cancelledPolicyDialogOpen, setCancelledPolicyDialogOpen] = useState(false);
  const [claimNotSupportedDialogOpen, setClaimNotSupportedDialogOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [sharePolicyNumber, setSharePolicyNumber] = useState('');
  const { data: coveragePlanMapping } = useCoveragePlanMappingQuery();
  const {
    shareDialogOpen,
    isRecipientsLoading,
    recipients,
    effectiveSelectedId,
    channels,
    dependentChannelsByMember,
    activeDependentMemberId,
    othersChannelErrors,
    setShareChannels,
    onOpenChange: handleShareDialogOpen,
    openDialogForPolicy,
    onSelectRecipient: handleSelectRecipient,
    onDependentChannelsChange: handleDependentChannelsChange,
    onDependentActiveMemberChange: handleDependentActiveMemberChange,
    onChannelValueChange: handleChannelValueChange,
    canShare,
    submitShare: handleShareSubmit,
  } = usePolicyShareDialog();

  const selectedRow = useMemo(
    () => flow.tableRows.find((tableRow) => tableRow.id === flow.selectedRowId),
    [flow.selectedRowId, flow.tableRows],
  );

  const navigateToPolicyDetails = (policyNumber: string) => {
    router.push(
      `/${partner}/dashboard/policy-management/policy-details?policyNumber=${encodeURIComponent(policyNumber)}`,
    );
  };

  const showCancelledPolicyDialog = () => {
    setCancelledPolicyDialogOpen(true);
  };

  const handleSeePolicyDetails = () => {
    if (!selectedRow) {
      return;
    }
    if (isCancelledPolicyStatus(selectedRow.status)) {
      showCancelledPolicyDialog();
      return;
    }
    navigateToPolicyDetails(selectedRow.policyNumber);
  };

  const isSelectedPolicyEligibleForInAppClaim = useMemo(() => {
    const mappings = coveragePlanMapping?.data?.coverage_mappings ?? [];
    return isPlanEligibleForInAppClaimCreation(mappings, selectedRow?.productName);
  }, [coveragePlanMapping?.data?.coverage_mappings, selectedRow?.productName]);

  const handleContinueToClaimType = () => {
    if (!selectedRow) {
      return;
    }
    if (isCancelledPolicyStatus(selectedRow.status)) {
      showCancelledPolicyDialog();
      return;
    }
    if (!isSelectedPolicyEligibleForInAppClaim) {
      setClaimNotSupportedDialogOpen(true);
      return;
    }
    flow.handleContinueToClaimType();
  };

  if (!flow.canCreateClaim) {
    return <FallbackState message={ACCESS_DENIED_MESSAGE} />;
  }

  if (flow.showHydrationLoading) {
    return <CreateClaimHydrationLoading currentStepIndex={flow.hydrationStepIndex} />;
  }

  return (
    <div className={PAGE_LAYOUT_CLASS}>
      <BankDetailsFailureDialog
        open={flow.bankDetailsFailureDialogOpen}
        message={flow.bankDetailsFailureMessage}
        skipPending={flow.skipDeathClaimBankDetailsPending}
        onOpenChange={flow.setBankDetailsFailureDialogOpen}
        onSkip={() => void flow.handleDismissBankFailureWithSkip()}
      />
      <ClaimCreationNotSupportedDialog
        open={claimNotSupportedDialogOpen}
        onOpenChange={setClaimNotSupportedDialogOpen}
        onContactSupport={() => {
          setClaimNotSupportedDialogOpen(false);
          setSupportModalOpen(true);
        }}
      />
      {supportModalOpen && (
        <RaiseDisputeModal open onOpenChange={setSupportModalOpen} />
      )}
      <CancelledPolicyDialog
        open={cancelledPolicyDialogOpen}
        onOpenChange={setCancelledPolicyDialogOpen}
        onSharePolicy={() => {
          if (!selectedRow) {
            return;
          }
          setCancelledPolicyDialogOpen(false);
          openDialogForPolicy(selectedRow.id);
          setSharePolicyNumber(selectedRow.policyNumber);
        }}
        onSeePolicyDetails={() => {
          if (!selectedRow) {
            return;
          }
          setCancelledPolicyDialogOpen(false);
          navigateToPolicyDetails(selectedRow.policyNumber);
        }}
      />
      <ShareDetailsDialog
        open={shareDialogOpen}
        onOpenChange={handleShareDialogOpen}
        title={SHARE_POLICY_CONFIG.title}
        description={SHARE_POLICY_CONFIG.description}
        descriptionHighlight={sharePolicyNumber}
        recipients={recipients}
        selectedRecipientId={effectiveSelectedId}
        onSelectRecipient={handleSelectRecipient}
        channels={channels}
        onChannelsChange={setShareChannels}
        dependentChannelsByMember={dependentChannelsByMember}
        onDependentChannelsChange={handleDependentChannelsChange}
        activeDependentMemberId={activeDependentMemberId}
        onDependentActiveMemberChange={handleDependentActiveMemberChange}
        onChannelValueChange={handleChannelValueChange}
        channelErrors={
          effectiveSelectedId === OTHERS_RECIPIENT_ID ? othersChannelErrors : undefined
        }
        loading={isRecipientsLoading}
        cancelLabel={SHARE_POLICY_CONFIG.cancelLabel}
        shareLabel={SHARE_POLICY_CONFIG.shareLabel}
        onCancel={() => handleShareDialogOpen(false)}
        onShare={handleShareSubmit}
        canShare={canShare}
        showCloseButton
        claimBannerText={SHARE_POLICY_INFO_TEXT}
        sendSegmentEvent={() => {}}
      />
      <Breadcrumbs />
      <CreateClaimStepper
        currentStepIndex={flow.currentFlowStepIdx}
        onStepClick={flow.handleNavigateToStep}
      />
      <CreateClaimStepContent
        flow={flow}
        onSeePolicyDetails={handleSeePolicyDetails}
        onContinueToClaimType={handleContinueToClaimType}
      />
    </div>
  );
}
