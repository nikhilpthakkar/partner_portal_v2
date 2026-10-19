import {
  POLICY_REFUND_DETAILS_SHEET,
  POLICY_REFUND_IN_PROGRESS_BANNER,
  POLICY_REFUND_UI_STATE,
} from '@/lib/constants/policyAutoRefund.constants';
import type {
  PolicyRefundDetailsData,
  PolicyRefundEntry,
} from '@/lib/types/policy-management/policyRefundApi';
import type {
  PolicyRefundDetailsSheetViewModel,
  PolicyRefundTimelineAttemptGroup,
  PolicyRefundTimelineStep,
  PolicyRefundTimelineStepStatus,
} from '@/lib/types/policy-management/policyRefundDetailsSheet';
import { mapManualRefundToSheetViewModel } from '@/lib/adapter/manual-refunds/manualRefundDetailsSheet.adapter';
import { resolveActiveManualRefundFromDetails } from '@/lib/adapter/manual-refunds/manualRefundDetailsDialog.adapter';
import {
  formatPolicyRefundInitiatedDate,
  formatPolicyRefundTimelineTimestamp,
  getLatestPolicyRefundEntry,
  getPolicyRefundUiState,
  getRefundFailureReasonTimelineLabel,
  resolveRefundFailureReasonFromEntry,
  shouldUseActiveManualRefundDetailsSheet,
} from '@/lib/utils/policyRefundDetails.utils';

const COMPLETED_REFUND_STATUSES = new Set(['completed', 'success', 'successful', 'settled']);
const FAILED_REFUND_STATUSES = new Set(['failed', 'failure']);

const BANK_TRANSFER_INITIATED_STATUSES = new Set([
  'initiated',
  'in_progress',
  'pending',
  'processing',
  'failed',
  'completed',
  'success',
  'successful',
  'settled',
]);

const formatRequestIdLabel = (requestId: string) => {
  const trimmed = requestId.trim();
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

const formatRequestedByUserType = (userType: string | undefined): string | undefined => {
  const normalized = userType?.trim();
  if (!normalized) {
    return undefined;
  }

  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  return POLICY_REFUND_DETAILS_SHEET.timelineSteps.requestSubmitted.requestedBy(label);
};

const isRefundSettlementComplete = (refund: PolicyRefundEntry): boolean => {
  const status = refund.status?.trim().toLowerCase();
  const uiState = refund.uiState?.trim().toUpperCase();

  return (
    uiState === POLICY_REFUND_UI_STATE.SUCCESS ||
    (status ? COMPLETED_REFUND_STATUSES.has(status) : false)
  );
};

const isRefundFailed = (refund: PolicyRefundEntry): boolean => {
  const status = refund.status?.trim().toLowerCase();
  const uiState = refund.uiState?.trim().toUpperCase();

  return (
    uiState === POLICY_REFUND_UI_STATE.FAILED ||
    uiState === POLICY_REFUND_UI_STATE.FAILED_RETRYABLE ||
    (status ? FAILED_REFUND_STATUSES.has(status) : false)
  );
};

const isBankTransferInitiated = (refund: PolicyRefundEntry): boolean => {
  if (isRefundSettlementComplete(refund) || isRefundFailed(refund)) {
    return true;
  }

  const status = refund.status?.trim().toLowerCase();
  return status ? BANK_TRANSFER_INITIATED_STATUSES.has(status) : false;
};

const buildInProgressSummaryDescription = (refund: PolicyRefundEntry): string => {
  const initiatedDate = formatPolicyRefundInitiatedDate(refund.initiatedOn);
  if (!refund.requestId?.trim() || !initiatedDate) {
    return POLICY_REFUND_IN_PROGRESS_BANNER.descriptionFallback;
  }

  return `${POLICY_REFUND_IN_PROGRESS_BANNER.descriptionPrefix}${POLICY_REFUND_IN_PROGRESS_BANNER.requestIdLabel(formatRequestIdLabel(refund.requestId))}${POLICY_REFUND_IN_PROGRESS_BANNER.descriptionSuffix(initiatedDate)}`;
};

const countFailedRefunds = (refundDetails: PolicyRefundDetailsData | undefined): number => {
  const failedCount = (refundDetails?.refunds ?? []).filter(isRefundFailed).length;
  return failedCount > 0 ? failedCount : 1;
};

const buildSheetSummary = (
  refundDetails: PolicyRefundDetailsData | undefined,
  latestRefund: PolicyRefundEntry,
  uiState: string | null | undefined,
): Pick<PolicyRefundDetailsSheetViewModel, 'summaryDescription' | 'summaryVariant'> => {
  if (uiState === POLICY_REFUND_UI_STATE.SUCCESS) {
    return {
      summaryDescription: POLICY_REFUND_DETAILS_SHEET.summary.cashfreeCompleted(
        formatRequestIdLabel(latestRefund.requestId),
      ),
      summaryVariant: 'success',
    };
  }

  if (
    uiState === POLICY_REFUND_UI_STATE.FAILED ||
    uiState === POLICY_REFUND_UI_STATE.FAILED_RETRYABLE ||
    isRefundFailed(latestRefund)
  ) {
    return {
      summaryDescription: POLICY_REFUND_DETAILS_SHEET.summary.allCashfreeAttemptsFailed(
        countFailedRefunds(refundDetails),
      ),
      summaryVariant: 'failed',
    };
  }

  if (uiState === POLICY_REFUND_UI_STATE.IN_PROGRESS) {
    return {
      summaryDescription: buildInProgressSummaryDescription(latestRefund),
      summaryVariant: 'inProgress',
    };
  }

  return {
    summaryDescription: POLICY_REFUND_IN_PROGRESS_BANNER.descriptionFallback,
    summaryVariant: 'info',
  };
};

const buildTimelineSteps = (
  refund: PolicyRefundEntry,
  isEndorsementLed = false,
): PolicyRefundTimelineStep[] => {
  const requestSubmittedTimestamp = formatPolicyRefundTimelineTimestamp(refund.initiatedOn);
  const bankTransferInitiated = isBankTransferInitiated(refund);
  const settlementComplete = isRefundSettlementComplete(refund);
  const settlementFailed = isRefundFailed(refund);

  const getStepStatus = (isComplete: boolean): PolicyRefundTimelineStepStatus =>
    isComplete ? 'completed' : 'pending';

  const settlementStatus: PolicyRefundTimelineStepStatus = settlementFailed
    ? 'failed'
    : getStepStatus(settlementComplete);
  const utr = refund.utr?.trim() || refund.cashfreeTransferId?.trim();

  return [
    {
      id: `${refund.requestId}-request-submitted`,
      title: POLICY_REFUND_DETAILS_SHEET.timelineSteps.requestSubmitted.title,
      description: formatRequestedByUserType(refund.userType),
      timestamp: requestSubmittedTimestamp,
      status: 'completed',
    },
    {
      id: `${refund.requestId}-bank-transfer-initiated`,
      title: POLICY_REFUND_DETAILS_SHEET.timelineSteps.bankTransferInitiated.title,
      description: bankTransferInitiated
        ? isEndorsementLed
          ? POLICY_REFUND_DETAILS_SHEET.payoutDescriptions.initial
          : POLICY_REFUND_DETAILS_SHEET.payoutDescriptions.reinitiated
        : undefined,
      status: getStepStatus(bankTransferInitiated),
    },
    {
      id: `${refund.requestId}-bank-status`,
      title: POLICY_REFUND_DETAILS_SHEET.timelineSteps.bankStatus.title,
      description: POLICY_REFUND_DETAILS_SHEET.timelineSteps.bankStatus.description,
      timestamp:
        settlementComplete && refund.completedOn?.trim()
          ? formatPolicyRefundTimelineTimestamp(refund.completedOn)
          : undefined,
      status: settlementStatus,
      alert: settlementFailed
        ? {
            type: 'error',
            message: getRefundFailureReasonTimelineLabel(
              resolveRefundFailureReasonFromEntry(refund),
            ),
          }
        : settlementComplete && utr
          ? {
              type: 'success',
              message: POLICY_REFUND_DETAILS_SHEET.successAlert(utr),
            }
          : settlementComplete
            ? {
                type: 'success',
                message: 'Refund completed',
              }
            : undefined,
    },
  ];
};

const sortRefundsByInitiatedOnAscending = (refunds: PolicyRefundEntry[]): PolicyRefundEntry[] => {
  return [...refunds].sort((left, right) => {
    const leftTime = Date.parse(left.initiatedOn);
    const rightTime = Date.parse(right.initiatedOn);

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
      return 0;
    }

    if (Number.isNaN(leftTime)) {
      return 1;
    }

    if (Number.isNaN(rightTime)) {
      return -1;
    }

    return leftTime - rightTime;
  });
};

const buildTimelineGroups = (
  refundDetails: PolicyRefundDetailsData | undefined,
): PolicyRefundTimelineAttemptGroup[] => {
  const chronologicalRefunds = sortRefundsByInitiatedOnAscending(
    refundDetails?.refunds ?? [],
  ).filter((refund) => Boolean(refund.requestId?.trim()));

  return chronologicalRefunds
    .map((refund, index) => ({
      id: `cashfree-${refund.requestId}`,
      index: index + 1,
      label:
        index === 0
          ? POLICY_REFUND_DETAILS_SHEET.attemptGroups.endorsementLed
          : POLICY_REFUND_DETAILS_SHEET.attemptGroups.cashfreeLed,
      refundRequestId: refund.requestId.trim(),
      steps: buildTimelineSteps(refund, index === 0),
    }))
    .reverse();
};

export const mapRefundDetailsToSheetViewModel = (
  refundDetails: PolicyRefundDetailsData | undefined,
  uiState?: string | null,
): PolicyRefundDetailsSheetViewModel | null => {
  const resolvedUiState = uiState ?? getPolicyRefundUiState(refundDetails);

  if (shouldUseActiveManualRefundDetailsSheet(refundDetails, resolvedUiState)) {
    const activeManualRefund = resolveActiveManualRefundFromDetails(refundDetails);
    if (activeManualRefund) {
      const manualViewModel = mapManualRefundToSheetViewModel(activeManualRefund);
      const previousRefundGroups = buildTimelineGroups(refundDetails);
      const manualGroup = manualViewModel.timelineGroups[0];

      return {
        ...manualViewModel,
        timelineGroups: manualGroup
          ? [{ ...manualGroup, index: previousRefundGroups.length + 1 }, ...previousRefundGroups]
          : previousRefundGroups,
      };
    }
  }

  return mapPolicyRefundDetailsToSheetViewModel(refundDetails, undefined, resolvedUiState);
};

export const mapPolicyRefundDetailsToSheetViewModel = (
  refundDetails: PolicyRefundDetailsData | undefined,
  requestIdOverride?: string,
  uiState?: string | null,
): PolicyRefundDetailsSheetViewModel | null => {
  const latestRefund = getLatestPolicyRefundEntry(refundDetails);
  const requestId = requestIdOverride?.trim() || latestRefund?.requestId?.trim();

  if (!requestId) {
    return null;
  }

  const summary = latestRefund
    ? buildSheetSummary(
        refundDetails,
        latestRefund,
        uiState ?? getPolicyRefundUiState(refundDetails),
      )
    : {
        summaryDescription: POLICY_REFUND_IN_PROGRESS_BANNER.descriptionFallback,
        summaryVariant: 'info' as const,
      };

  const timelineGroups = buildTimelineGroups(refundDetails);

  return {
    ...summary,
    requestId,
    timelineGroups,
    timelineSteps:
      timelineGroups[0]?.steps ?? (latestRefund ? buildTimelineSteps(latestRefund) : []),
  };
};
