'use client';

import { Fragment, useEffect, useState } from 'react';
import { Download, Share2, SquarePen } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Breadcrumbs from '@/components/molecules/Breadcrumbs';
import { PAGE_LAYOUT_CLASS, PAGE_TITLE_CLASS } from '@/components/molecules/PageHeading';
import SegmentedTabs from '@/components/molecules/SegmentedTabs';
import EndorsePolicyDialog from '@/components/organisms/EndorsePolicyDialog';
import ShareDetailsDialog from '@/components/organisms/ShareDetailsDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClaimShareDialog } from '@/lib/hooks/useClaimShareDialog';
import { usePolicyShareDialog } from '@/lib/hooks/usePolicyShareDialog';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  useCachedPolicyDetailsQuery,
  usePolicyRefundDetailsQuery,
} from '@/lib/query/policyDetails.queries';
import { POLICY_DETAILS_RESPONSE } from '@/lib/constants/policyDetails.constants';
import type {
  PolicyClaimsHistoryRow,
  PolicyDetailsActionType,
  PolicyHealthCardActionType,
} from '@/lib/types/policy-management/policyDetails';
import { OTHERS_RECIPIENT_ID } from '@/lib/adapter/policy-share/policyShare.adapter';
import { cn, downloadFileFromUrl } from '@/lib/utils';
import PolicyDetailsTab from '@/features/policy-details/tabs/PolicyDetailsTab';
import PolicyClaimsHistoryTab from '@/features/policy-details/tabs/PolicyClaimsHistoryTab';
import PolicyEndorsementsTab from '@/features/policy-details/tabs/PolicyEndorsementsTab';
import PolicyCommunicationTab from '@/features/policy-details/tabs/PolicyCommunicationTab';
import PolicyHealthCardsTab from '@/features/policy-details/tabs/PolicyHealthCardsTab';
import {
  SHARE_CLAIM_STATUS_CONFIG,
  SHARE_HEALTH_CARD_CONFIG,
  SHARE_POLICY_CONFIG,
} from '@/lib/constants/policyShare.constants';
import { DEFAULT_POLICY_DETAILS_TAB } from '@/lib/constants/policy.constants';
import { toast } from 'sonner';
import { PolicyRefundStatusBanners } from '@/components/molecules/PolicyRefundStatusBanners';
import { PermissionGate } from '@/components/atoms/PermissionGate';
import { ENDORSE_ACTION_PERMISSIONS } from '@/lib/constants/auth.constants';
import {
  trackClaimStatusShareDialogView,
  trackClaimStatusShareSubmit,
} from '@/lib/segment/track/claims';
import {
  trackPolicyDetailsHeaderAction,
  trackPolicyDetailsPageView,
  trackPolicyDetailsSwitchTab,
  trackPolicyShareDialogSubmit,
  trackPolicyShareDialogView,
  trackShareHealthCardAction,
} from '@/lib/segment/track/policy';

const actionIconMap: Record<PolicyDetailsActionType, typeof Download> = {
  download: Download,
  share: Share2,
  endorse: SquarePen,
};

const POLICY_DETAILS_TABS = {
  POLICY_DETAILS: 'policy-details',
  ENDORSEMENTS: 'endorsements',
  CLAIMS_HISTORY: 'claims-history',
  COMMUNICATION: 'communication',
  HEALTH_CARDS: 'health-cards',
};

const ERROR_POLICY_STATUSES = new Set(['cancelled', 'preclosed', 'expired']);

const getPolicyStatusBadgeClass = (status: string) => {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === 'active') {
    return 'border-endorse-policy-badge-success-border bg-endorse-policy-badge-success-bg';
  }

  if (ERROR_POLICY_STATUSES.has(normalizedStatus)) {
    return 'border-endorse-policy-badge-error-border bg-endorse-policy-badge-error-bg';
  }

  return 'border-endorse-policy-badge-success-border bg-endorse-policy-badge-success-bg';
};

export default function PolicyDetails() {
  const data = POLICY_DETAILS_RESPONSE;
  const searchParams = useSearchParams();
  const policyNumber = searchParams.get('policyNumber') ?? '';
  const segmentBase = useSegmentPartnerBase();
  const { data: policyDetailsResponse, refetch: refetchPolicyDetails } =
    useCachedPolicyDetailsQuery({
      policyNumber: policyNumber,
      enabled: Boolean(policyNumber),
    });
  const selectedPolicy = policyDetailsResponse?.data?.policies?.[0];
  const policyId = selectedPolicy?.policyId;
  const policyPlan = selectedPolicy?.planDetails?.planId ?? '';
  const insuredName = selectedPolicy?.persons?.[0]?.insured?.name ?? '-';

  const [activeTab, setActiveTab] = useState(DEFAULT_POLICY_DETAILS_TAB);
  const [endorseDialogOpen, setEndorseDialogOpen] = useState(false);
  const [policyHeaderTitle, setPolicyHeaderTitle] = useState(policyNumber);
  const [policyStatus, setPolicyStatus] = useState<string | null>(null);

  const { data: policyRefundDetailsResponse, refetch: refetchPolicyRefundDetails } =
    usePolicyRefundDetailsQuery({
      policyId: policyId ?? '',
      plan: policyPlan,
      policyStatus,
      enabled: Boolean(policyId) && Boolean(policyPlan),
    });
  const policyRefundDetails = policyRefundDetailsResponse?.data;

  const [shareClaimNumber, setShareClaimNumber] = useState('');
  const [shareClaimStatus, setShareClaimStatus] = useState('');
  const {
    shareDialogOpen: policyShareDialogOpen,
    isRecipientsLoading: isPolicyRecipientsLoading,
    recipients: policyRecipients,
    effectiveSelectedId: policyEffectiveSelectedId,
    channels: policyChannels,
    dependentChannelsByMember: policyDependentChannelsByMember,
    activeDependentMemberId: policyActiveDependentMemberId,
    othersChannelErrors: policyOthersChannelErrors,
    setShareChannels: setPolicyShareChannels,
    onOpenChange: handlePolicyShareDialogOpen,
    openDialogForPolicy,
    openDialogForHealthCard,
    onSelectRecipient: handlePolicySelectRecipient,
    onDependentChannelsChange: handlePolicyDependentChannelsChange,
    onDependentActiveMemberChange: handlePolicyDependentActiveMemberChange,
    onChannelValueChange: handlePolicyChannelValueChange,
    othersRecipientName: policyOthersRecipientName,
    onOthersRecipientNameChange: handlePolicyOthersRecipientNameChange,
    canShare: canPolicyShare,
    submitShare: handlePolicyShareSubmit,
    shareTarget: policyShareTarget,
  } = usePolicyShareDialog();
  const {
    shareDialogOpen: claimShareDialogOpen,
    isRecipientsLoading: isClaimRecipientsLoading,
    recipients: claimRecipients,
    effectiveSelectedId: claimEffectiveSelectedId,
    channels: claimChannels,
    dependentChannelsByMember: claimDependentChannelsByMember,
    activeDependentMemberId: claimActiveDependentMemberId,
    othersChannelErrors: claimOthersChannelErrors,
    setShareChannels: setClaimShareChannels,
    onOpenChange: handleClaimShareDialogOpen,
    openDialogForClaim,
    onSelectRecipient: handleClaimSelectRecipient,
    onDependentChannelsChange: handleClaimDependentChannelsChange,
    onDependentActiveMemberChange: handleClaimDependentActiveMemberChange,
    onChannelValueChange: handleClaimChannelValueChange,
    canShare: canClaimShare,
    submitShare: handleClaimShareSubmit,
  } = useClaimShareDialog();

  const [policyCertificateUrl, setPolicyCertificateUrl] = useState<string>('');

  const handlePolicyShareClick = () => {
    if (policyId) {
      openDialogForPolicy(policyId);
    }
  };

  const handleClaimShareClick = (row: PolicyClaimsHistoryRow) => {
    setShareClaimNumber(row.claimId);
    setShareClaimStatus(row.status);
    openDialogForClaim(row.claimId, policyId ?? '', policyNumber);
  };

  const handleHealthCardAction = (type: PolicyHealthCardActionType, uhid: string) => {
    if (type === 'share' && policyId) {
      trackShareHealthCardAction(segmentBase, policyNumber);
      openDialogForHealthCard(policyId, uhid);
    }
  };

  useEffect(() => {
    trackPolicyDetailsPageView(segmentBase, policyNumber);
  }, [segmentBase, policyNumber]);

  const policyShareDialogConfig =
    policyShareTarget.type === 'health-card' ? SHARE_HEALTH_CARD_CONFIG : SHARE_POLICY_CONFIG;

  const renderTabContent = () => {
    switch (activeTab) {
      case POLICY_DETAILS_TABS.POLICY_DETAILS:
        return (
          <PolicyDetailsTab
            policyNumber={policyNumber}
            setPolicyHeaderTitle={setPolicyHeaderTitle}
            setPolicyStatus={setPolicyStatus}
            setPolicyCertificateUrl={setPolicyCertificateUrl}
          />
        );
      case POLICY_DETAILS_TABS.ENDORSEMENTS:
        return <PolicyEndorsementsTab policyNumber={policyNumber} />;
      case POLICY_DETAILS_TABS.CLAIMS_HISTORY:
        return (
          <PolicyClaimsHistoryTab
            policyNumber={policyNumber}
            onShareClick={handleClaimShareClick}
          />
        );
      case POLICY_DETAILS_TABS.COMMUNICATION:
        return <PolicyCommunicationTab policyNumber={policyNumber} policyId={policyId ?? ''} />;
      case POLICY_DETAILS_TABS.HEALTH_CARDS:
        return (
          <PolicyHealthCardsTab policyId={policyId} onHealthCardAction={handleHealthCardAction} />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(PAGE_LAYOUT_CLASS, 'gap-3 pb-4')}>
      <Breadcrumbs />
      <PolicyRefundStatusBanners
        refundDetails={policyRefundDetails}
        policyNumber={policyNumber}
        policyId={policyId ?? ''}
        plan={policyPlan}
        insuredName={insuredName}
        originalPremium={selectedPolicy?.premium?.amount}
        onRefundInitiated={async () => {
          await refetchPolicyDetails();
          await refetchPolicyRefundDetails();
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        {policyHeaderTitle ? (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={PAGE_TITLE_CLASS}>{policyHeaderTitle}</h1>
            {policyStatus && (
              <Badge
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-medium text-foreground',
                  getPolicyStatusBadgeClass(policyStatus),
                )}
              >
                {policyStatus}
              </Badge>
            )}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {data.actions.map((action) => {
            const Icon = actionIconMap[action.type];
            const isOutline = action.variant === 'outline';
            const buttonClassName = isOutline
              ? 'border-endorse-policy-action-border bg-endorse-policy-action-bg text-endorse-policy-text hover:bg-endorse-policy-action-hover shadow-endorse-policy-action'
              : 'bg-claims-details-action-button-bg text-claims-details-action-button-text hover:bg-claims-details-action-button-hover-bg hover:text-claims-details-action-button-hover-text shadow-claims-details-action-button';

            const button = (
              <Button
                type="button"
                variant={isOutline ? 'outline' : 'default'}
                size={action.iconOnly ? 'icon-sm' : 'sm'}
                className={cn('rounded-md', !action.iconOnly && 'gap-2 px-3 py-2', buttonClassName)}
                aria-label={action.iconOnly ? action.label : undefined}
                onClick={() => {
                  trackPolicyDetailsHeaderAction(segmentBase, {
                    action_name: action.label,
                    policy_number: policyNumber,
                  });

                  if (action.type === 'share' && policyId) {
                    handlePolicyShareClick();
                    return;
                  }
                  if (action.type === 'download') {
                    if (!policyCertificateUrl) {
                      toast.error('Policy certificate is not available');
                      return;
                    }
                    try {
                      downloadFileFromUrl(policyCertificateUrl, 'policy-certificate.pdf');
                      toast.success('Policy certificate download started');
                      return;
                    } catch {
                      toast.error('Failed to download policy certificate');
                    }
                  }
                  if (action.type === 'endorse') {
                    setEndorseDialogOpen(true);
                    return;
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                {!action.iconOnly && action.label}
              </Button>
            );

            if (action.type === 'endorse') {
              return (
                <PermissionGate key={action.id} anyOf={ENDORSE_ACTION_PERMISSIONS}>
                  {button}
                </PermissionGate>
              );
            }

            return <Fragment key={action.id}>{button}</Fragment>;
          })}
        </div>
      </div>
      <div>
        <SegmentedTabs
          value={activeTab}
          onValueChange={(value) => {
            trackPolicyDetailsSwitchTab(segmentBase, {
              entity_name: value,
              policy_number: policyNumber,
            });
            setActiveTab(value);
          }}
          tabs={data.tabs}
          className="w-full py-3 min-h-12 max-w-5xl"
          triggerClassName="h-10 py-4 px-2"
        />
      </div>
      {renderTabContent()}
      <ShareDetailsDialog
        open={policyShareDialogOpen}
        onOpenChange={handlePolicyShareDialogOpen}
        title={policyShareDialogConfig.title}
        description={policyShareDialogConfig.description}
        descriptionHighlight={
          policyShareTarget.type === 'health-card' ? policyShareTarget.uhid : policyNumber
        }
        recipients={policyRecipients}
        selectedRecipientId={policyEffectiveSelectedId}
        onSelectRecipient={handlePolicySelectRecipient}
        channels={policyChannels}
        onChannelsChange={setPolicyShareChannels}
        dependentChannelsByMember={policyDependentChannelsByMember}
        onDependentChannelsChange={handlePolicyDependentChannelsChange}
        activeDependentMemberId={policyActiveDependentMemberId}
        onDependentActiveMemberChange={handlePolicyDependentActiveMemberChange}
        onChannelValueChange={handlePolicyChannelValueChange}
        showOtherRecipientNameInput={policyShareTarget.type === 'health-card'}
        otherRecipientName={policyOthersRecipientName}
        onOtherRecipientNameChange={handlePolicyOthersRecipientNameChange}
        channelErrors={
          policyEffectiveSelectedId === OTHERS_RECIPIENT_ID ? policyOthersChannelErrors : undefined
        }
        loading={isPolicyRecipientsLoading}
        cancelLabel={policyShareDialogConfig.cancelLabel}
        shareLabel={policyShareDialogConfig.shareLabel}
        onCancel={() => handlePolicyShareDialogOpen(false)}
        onShare={() => {
          handlePolicyShareSubmit();
          trackPolicyShareDialogSubmit(segmentBase, policyNumber);
        }}
        canShare={canPolicyShare}
        showCloseButton
        sendSegmentEvent={() => {
          trackPolicyShareDialogView(segmentBase, policyNumber);
        }}
      />
      <ShareDetailsDialog
        open={claimShareDialogOpen}
        onOpenChange={handleClaimShareDialogOpen}
        title={SHARE_CLAIM_STATUS_CONFIG.title}
        description={SHARE_CLAIM_STATUS_CONFIG.description}
        descriptionHighlight={shareClaimNumber}
        claimBannerText={`Claim ID ${shareClaimNumber || '-'} | ${shareClaimStatus || 'NA'}`}
        recipients={claimRecipients}
        selectedRecipientId={claimEffectiveSelectedId}
        onSelectRecipient={handleClaimSelectRecipient}
        channels={claimChannels}
        onChannelsChange={setClaimShareChannels}
        dependentChannelsByMember={claimDependentChannelsByMember}
        onDependentChannelsChange={handleClaimDependentChannelsChange}
        activeDependentMemberId={claimActiveDependentMemberId}
        onDependentActiveMemberChange={handleClaimDependentActiveMemberChange}
        onChannelValueChange={handleClaimChannelValueChange}
        channelErrors={
          claimEffectiveSelectedId === OTHERS_RECIPIENT_ID ? claimOthersChannelErrors : undefined
        }
        loading={isClaimRecipientsLoading}
        cancelLabel={SHARE_CLAIM_STATUS_CONFIG.cancelLabel}
        shareLabel={SHARE_CLAIM_STATUS_CONFIG.shareLabel}
        onCancel={() => handleClaimShareDialogOpen(false)}
        onShare={() => {
          handleClaimShareSubmit();
          trackClaimStatusShareSubmit(segmentBase, shareClaimNumber);
        }}
        canShare={canClaimShare}
        showCloseButton
        sendSegmentEvent={() => {
          trackClaimStatusShareDialogView(segmentBase, shareClaimNumber);
        }}
      />
      <EndorsePolicyDialog
        open={endorseDialogOpen}
        onOpenChange={setEndorseDialogOpen}
        onClose={() => setEndorseDialogOpen(false)}
        onEndorsementSuccess={async () => {
          setEndorseDialogOpen(false);
          await refetchPolicyDetails();
          await refetchPolicyRefundDetails();
        }}
        policyNumber={policyNumber}
        policyId={policyId ?? ''}
        plan={policyPlan}
        insuredName={insuredName}
      />
    </div>
  );
}
