import { POLICY_REFUND_DETAILS_SHEET } from '@/lib/constants/policyAutoRefund.constants';
import type {
  InitiatedByDetails,
  ManualRefundData,
} from '@/lib/types/manual-refunds/manualRefundsApi';
import type {
  PolicyRefundDetailsSheetViewModel,
  PolicyRefundTimelineStep,
} from '@/lib/types/policy-management/policyRefundDetailsSheet';
import { formatPolicyRefundTimelineTimestamp } from '@/lib/utils/policyRefundDetails.utils';

const formatInitiatedByDescription = (initiatedBy?: InitiatedByDetails | null): string => {
  const name = initiatedBy?.name?.trim();
  if (name) {
    return `Refund initiated by ${name}`;
  }

  const userType = (initiatedBy?.userType ?? initiatedBy?.user_type)?.trim();
  if (userType) {
    const label = userType
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    return `Refund initiated by ${label}`;
  }

  return POLICY_REFUND_DETAILS_SHEET.timelineSteps.manualInitiated.defaultDescription;
};

const buildManualRefundTimelineSteps = (refund: ManualRefundData): PolicyRefundTimelineStep[] => {
  const status = (refund.status ?? '').trim().toLowerCase();
  const isSettled = status === 'settled';
  const utr = refund.utr?.trim();

  return [
    {
      id: `manual-${refund.id}-initiated`,
      title: POLICY_REFUND_DETAILS_SHEET.timelineSteps.manualInitiated.title,
      description: formatInitiatedByDescription(refund.initiatedBy),
      timestamp: refund.createdOn
        ? formatPolicyRefundTimelineTimestamp(refund.createdOn)
        : undefined,
      status: 'completed',
    },
    {
      id: `manual-${refund.id}-completed`,
      title: POLICY_REFUND_DETAILS_SHEET.timelineSteps.manualCompleted.title,
      description: POLICY_REFUND_DETAILS_SHEET.timelineSteps.manualCompleted.description,
      timestamp:
        isSettled && refund.updatedOn
          ? formatPolicyRefundTimelineTimestamp(refund.updatedOn)
          : undefined,
      status: isSettled ? 'completed' : 'pending',
      alert:
        isSettled && utr
          ? {
              type: 'success',
              message: POLICY_REFUND_DETAILS_SHEET.successAlert(utr),
            }
          : undefined,
    },
  ];
};

const buildManualRefundSummaryDescription = (refund: ManualRefundData): string => {
  const isSettled = (refund.status ?? '').trim().toLowerCase() === 'settled';

  if (isSettled) {
    const utr = refund.utr?.trim();
    return utr
      ? `Policy cancelled, manual refund settlement is complete. UTR: ${utr}.`
      : 'Policy cancelled, manual refund settlement is complete.';
  }

  const amount =
    refund.refundAmount != null && !Number.isNaN(refund.refundAmount)
      ? `₹ ${refund.refundAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : undefined;

  if (amount) {
    return `Policy cancelled, manual refund of ${amount} is being processed offline.`;
  }

  return 'Policy cancelled, manual refund is being processed offline.';
};

export const mapManualRefundToSheetViewModel = (
  refund: ManualRefundData,
): PolicyRefundDetailsSheetViewModel => {
  const isSettled = (refund.status ?? '').trim().toLowerCase() === 'settled';

  const steps = buildManualRefundTimelineSteps(refund);

  return {
    summaryDescription: buildManualRefundSummaryDescription(refund),
    summaryVariant: isSettled ? 'manualSettled' : 'inProgress',
    requestId: String(refund.id),
    timelineGroups: [
      {
        id: `manual-${refund.id}`,
        index: 1,
        label: POLICY_REFUND_DETAILS_SHEET.attemptGroups.manual,
        manualRefundId: String(refund.id),
        refundDestination: refund.refundDestination?.trim() || undefined,
        steps,
      },
    ],
    timelineSteps: steps,
  };
};

/** @deprecated Use mapManualRefundToSheetViewModel */
export const mapManualRefundRowToSheetViewModel = mapManualRefundToSheetViewModel;
