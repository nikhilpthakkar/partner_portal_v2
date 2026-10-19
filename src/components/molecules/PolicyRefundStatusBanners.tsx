'use client';

import { useState } from 'react';
import { PolicyAutoRefundFailedBanner } from '@/components/molecules/PolicyAutoRefundFailedBanner';
import { PolicyAutoRefundFailedRetryableBanner } from '@/components/molecules/PolicyAutoRefundFailedRetryableBanner';
import { PolicyAutoRefundSuccessBanner } from '@/components/molecules/PolicyAutoRefundSuccessBanner';
import { PolicyManualRefundInitiatedBanner } from '@/components/molecules/PolicyManualRefundInitiatedBanner';
import { PolicyRefundInProgressBanner } from '@/components/molecules/PolicyRefundInProgressBanner';
import { PolicyInitiateRefundDialog } from '@/components/organisms/PolicyInitiateRefundDialog';
import { PolicyRefundDetailsSheet } from '@/components/organisms/PolicyRefundDetailsSheet';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { POLICY_REFUND_UI_STATE } from '@/lib/constants/policyAutoRefund.constants';
import { usePartnerStore } from '@/lib/store/partner.store';
import type { PolicyRefundDetailsData } from '@/lib/types/policy-management/policyRefundApi';
import { hasPermission } from '@/lib/utils/permissionUtils';
import {
  formatPolicyRefundInitiatedDate,
  getPolicyRefundExpectedCompletionDate,
  getPolicyRefundProgressDetails,
  getPolicyRefundSuccessBannerDescription,
  getPolicyRefundUiState,
  isPolicyRefundFailed,
  isPolicyRefundFailedRetryable,
  shouldShowPolicyRefundInProgressBanner,
  shouldShowPolicyRefundStatusBanners,
  shouldShowPolicyRefundSuccessBanner,
} from '@/lib/utils/policyRefundDetails.utils';

type PolicyRefundStatusBannersProps = {
  refundDetails?: PolicyRefundDetailsData;
  policyNumber: string;
  policyId: string;
  plan: string;
  insuredName: string;
  originalPremium?: number | null;
  onRefundInitiated: () => Promise<void>;
};

export function PolicyRefundStatusBanners({
  refundDetails,
  policyNumber,
  policyId,
  plan,
  insuredName,
  originalPremium,
  onRefundInitiated,
}: PolicyRefundStatusBannersProps) {
  const permissions = usePartnerStore((state) => state.permissions);
  const canInitiateRefund = hasPermission(permissions, PERMISSIONS.ADD_TCS_TDS_TRANSACTIONS);
  const [refundDetailsSheetOpen, setRefundDetailsSheetOpen] = useState(false);
  const [initiateRefundDialogOpen, setInitiateRefundDialogOpen] = useState(false);

  if (!shouldShowPolicyRefundStatusBanners(refundDetails)) {
    return null;
  }

  const uiState = getPolicyRefundUiState(refundDetails);
  const refundProgressDetails = getPolicyRefundProgressDetails(refundDetails);
  const initiatedDate = refundProgressDetails?.initiatedOn
    ? formatPolicyRefundInitiatedDate(refundProgressDetails.initiatedOn)
    : undefined;
  const expectedCompletionDate = refundProgressDetails?.initiatedOn
    ? getPolicyRefundExpectedCompletionDate(refundProgressDetails.initiatedOn)
    : undefined;
  const openViewStatus = () => setRefundDetailsSheetOpen(true);

  return (
    <>
      <div className="mb-2 flex flex-col gap-3">
        {shouldShowPolicyRefundInProgressBanner(refundDetails) ? (
          uiState === POLICY_REFUND_UI_STATE.MANUAL_INITIATED ? (
            <PolicyManualRefundInitiatedBanner
              requestId={refundProgressDetails?.requestId}
              onViewStatus={openViewStatus}
            />
          ) : (
            <PolicyRefundInProgressBanner
              requestId={refundProgressDetails?.requestId}
              initiatedDate={initiatedDate}
              expectedCompletionDate={expectedCompletionDate}
              onViewStatus={openViewStatus}
            />
          )
        ) : null}

        {shouldShowPolicyRefundSuccessBanner(refundDetails) ? (
          <PolicyAutoRefundSuccessBanner
            description={getPolicyRefundSuccessBannerDescription(refundDetails)}
            onViewStatus={
              uiState === POLICY_REFUND_UI_STATE.MANUAL_SETTLED ? openViewStatus : undefined
            }
          />
        ) : null}

        {isPolicyRefundFailedRetryable(refundDetails) ? (
          <PolicyAutoRefundFailedRetryableBanner
            onViewStatus={openViewStatus}
            onReinitiateRefund={
              canInitiateRefund ? () => setInitiateRefundDialogOpen(true) : undefined
            }
          />
        ) : null}

        {isPolicyRefundFailed(refundDetails) ? (
          <PolicyAutoRefundFailedBanner
            onInitiateRefundManually={() => setInitiateRefundDialogOpen(true)}
            showAction={false}
          />
        ) : null}
      </div>

      <PolicyRefundDetailsSheet
        open={refundDetailsSheetOpen}
        onOpenChange={setRefundDetailsSheetOpen}
        refundDetails={refundDetails}
        uiState={uiState}
        originalPremium={originalPremium}
      />

      {canInitiateRefund ? (
        <PolicyInitiateRefundDialog
          open={initiateRefundDialogOpen}
          onOpenChange={setInitiateRefundDialogOpen}
          policyNumber={policyNumber}
          policyId={policyId}
          plan={plan}
          insuredName={insuredName}
          refundDetails={refundDetails}
          entryMode="default"
          onSuccess={onRefundInitiated}
        />
      ) : null}
    </>
  );
}
