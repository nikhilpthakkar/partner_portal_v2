import { POLICY_REFUND_DETAILS_SHEET } from '@/lib/constants/policyAutoRefund.constants';
import type { PolicyManualRefund } from '@/lib/types/policy-management/policyRefundApi';
import type {
  PolicyRefundDetailsSheetViewModel,
  PolicyRefundTimelineAttemptGroup,
} from '@/lib/types/policy-management/policyRefundDetailsSheet';
import { formatPolicyRefundTimelineTimestamp } from '@/lib/utils/policyRefundDetails.utils';

const formatInitiatedByDescription = (
  initiatedBy?: PolicyManualRefund['initiatedBy'],
): string | undefined => {
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

const buildManualRefundTimelineGroup = (
  refund: PolicyManualRefund,
): PolicyRefundTimelineAttemptGroup => {
  const status = (refund.status ?? '').trim().toLowerCase();
  const isSettled = status === 'settled';
  const utr = refund.utr?.trim();

  return {
    id: `manual-${refund.id}`,
    index: 1,
    label: POLICY_REFUND_DETAILS_SHEET.attemptGroups.manual,
    steps: [
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
    ],
  };
};

const buildManualSettledSummary = (
  refund: Pick<PolicyManualRefund, 'id' | 'utr'>,
): Pick<PolicyRefundDetailsSheetViewModel, 'summaryDescription' | 'summaryVariant'> => {
  const utr = refund.utr?.trim();

  return {
    summaryDescription: utr
      ? POLICY_REFUND_DETAILS_SHEET.successAlert(utr)
      : POLICY_REFUND_DETAILS_SHEET.summary.manualCompleted(`#${refund.id}`),
    summaryVariant: 'manualSettled',
  };
};

const buildManualRefundSummaryDescription = (refund: PolicyManualRefund): string => {
  const isSettled = (refund.status ?? '').trim().toLowerCase() === 'settled';

  if (isSettled) {
    return POLICY_REFUND_DETAILS_SHEET.summary.manualCompleted(`#${refund.id}`);
  }

  return POLICY_REFUND_DETAILS_SHEET.summary.manualInProgress(`#${refund.id}`);
};

export const mapActiveManualRefundToSheetViewModel = (
  activeManualRefund: PolicyManualRefund | null | undefined,
): PolicyRefundDetailsSheetViewModel | null => {
  if (!activeManualRefund?.id) {
    return null;
  }

  const isSettled = (activeManualRefund.status ?? '').trim().toLowerCase() === 'settled';
  const timelineGroup = buildManualRefundTimelineGroup(activeManualRefund);
  const settledSummary = isSettled
    ? buildManualSettledSummary(activeManualRefund)
    : {
        summaryDescription: buildManualRefundSummaryDescription(activeManualRefund),
        summaryVariant: 'info' as const,
      };

  return {
    ...settledSummary,
    requestId: String(activeManualRefund.id),
    timelineGroups: [timelineGroup],
    timelineSteps: timelineGroup.steps,
  };
};
