import { addDays, format, isValid, parseISO } from 'date-fns';
import { resolveActiveManualRefundFromDetails } from '@/lib/adapter/manual-refunds/manualRefundDetailsDialog.adapter';
import {
  POLICY_AUTO_REFUND_SUCCESS_BANNER,
  POLICY_INITIATE_REFUND_DIALOG,
  POLICY_REFUND_UI_STATE,
} from '@/lib/constants/policyAutoRefund.constants';
import {
  POLICY_REFUND_FAILURE_REASON_DEFAULT_MESSAGE,
  POLICY_REFUND_FAILURE_REASON_MESSAGES,
  POLICY_REFUND_FAILURE_REASON_TIMELINE_DEFAULT_LABEL,
  POLICY_REFUND_FAILURE_REASON_TIMELINE_LABELS,
} from '@/lib/constants/policyRefundFailureReason.constants';
import type {
  PolicyRefundDetailsData,
  PolicyRefundDetailsUiState,
  PolicyRefundEntry,
} from '@/lib/types/policy-management/policyRefundApi';

export { resolveActiveManualRefundFromDetails };

const CANCELLATION_OR_PRECLOSED_STATUSES = new Set([
  'cancellation',
  'cancelled',
  'preclosed',
  'pre_closed',
  'preclosure',
  'pre_closure',
]);

const KNOWN_POLICY_REFUND_UI_STATES = new Set<string>(Object.values(POLICY_REFUND_UI_STATE));

const normalizePolicyRefundUiState = (
  value: string | null | undefined,
): PolicyRefundDetailsUiState | undefined => {
  const normalized = value?.trim().toUpperCase();
  if (!normalized || !KNOWN_POLICY_REFUND_UI_STATES.has(normalized)) {
    return undefined;
  }

  return normalized as PolicyRefundDetailsUiState;
};

export const isCancellationOrPreclosedPolicyStatus = (
  status: string | null | undefined,
): boolean => {
  if (!status?.trim()) {
    return false;
  }

  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return CANCELLATION_OR_PRECLOSED_STATUSES.has(normalized);
};

export const isManualRefundUiState = (uiState: string | null | undefined): boolean => {
  const normalized = uiState?.trim().toUpperCase();
  return (
    normalized === POLICY_REFUND_UI_STATE.MANUAL_INITIATED ||
    normalized === POLICY_REFUND_UI_STATE.MANUAL_SETTLED
  );
};

export const getPolicyRefundUiState = (
  refundDetails: PolicyRefundDetailsData | undefined,
): PolicyRefundDetailsUiState => {
  if (!refundDetails) {
    return POLICY_REFUND_UI_STATE.NONE;
  }

  const responseUiState = normalizePolicyRefundUiState(refundDetails.uiState);
  if (responseUiState) {
    return responseUiState;
  }

  const activeManualRefund = resolveActiveManualRefundFromDetails(refundDetails);
  const manualStatus = activeManualRefund?.status?.trim().toLowerCase();
  if (manualStatus === 'initiated') {
    return POLICY_REFUND_UI_STATE.MANUAL_INITIATED;
  }
  if (manualStatus === 'settled') {
    return POLICY_REFUND_UI_STATE.MANUAL_SETTLED;
  }

  return POLICY_REFUND_UI_STATE.NONE;
};

export const shouldUseActiveManualRefundDetailsSheet = (
  refundDetails: PolicyRefundDetailsData | undefined,
  uiState?: string | null,
): boolean => isManualRefundUiState(uiState ?? getPolicyRefundUiState(refundDetails));

export const getActiveManualRefundForDetails = (
  refundDetails: PolicyRefundDetailsData | undefined,
) => {
  if (!shouldUseActiveManualRefundDetailsSheet(refundDetails)) {
    return undefined;
  }

  return resolveActiveManualRefundFromDetails(refundDetails);
};

export type PolicyRefundProgressDetails = {
  requestId: string;
  initiatedOn: string;
};

export const formatRequestIdLabel = (requestId: string) => {
  const trimmed = requestId.trim();
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

export const getPolicyRefundExpectedCompletionDate = (
  initiatedOn: string,
  daysAfterInitiation = 2,
): string | undefined => {
  const parsed = parseISO(initiatedOn);
  if (!isValid(parsed)) {
    return undefined;
  }

  return format(addDays(parsed, daysAfterInitiation), 'd MMMM yyyy');
};

export const getPolicyRefundSuccessBannerDescription = (
  refundDetails: PolicyRefundDetailsData | undefined,
): string => {
  if (!refundDetails) {
    return POLICY_AUTO_REFUND_SUCCESS_BANNER.description;
  }

  const uiState = getPolicyRefundUiState(refundDetails);

  if (uiState === POLICY_REFUND_UI_STATE.MANUAL_SETTLED) {
    const manualRefund = resolveActiveManualRefundFromDetails(refundDetails);
    const completedDate = manualRefund?.updatedOn
      ? formatPolicyRefundInitiatedDate(manualRefund.updatedOn)
      : undefined;
    const utr = manualRefund?.utr?.trim();

    if (completedDate && utr) {
      return POLICY_AUTO_REFUND_SUCCESS_BANNER.descriptionWithSettlement(
        POLICY_AUTO_REFUND_SUCCESS_BANNER.settlementTypeLabel.manual,
        completedDate,
        utr,
      );
    }

    return POLICY_AUTO_REFUND_SUCCESS_BANNER.manualSettledDescription;
  }

  if (uiState === POLICY_REFUND_UI_STATE.SUCCESS) {
    const refund = getLatestPolicyRefundEntry(refundDetails);
    const completedDate = refund?.completedOn
      ? formatPolicyRefundInitiatedDate(refund.completedOn)
      : undefined;
    const utr = refund?.utr?.trim();

    if (completedDate && utr) {
      return POLICY_AUTO_REFUND_SUCCESS_BANNER.descriptionWithSettlement(
        POLICY_AUTO_REFUND_SUCCESS_BANNER.settlementTypeLabel.cashfree,
        completedDate,
        utr,
      );
    }

    return POLICY_AUTO_REFUND_SUCCESS_BANNER.description;
  }

  return POLICY_AUTO_REFUND_SUCCESS_BANNER.description;
};

export const formatPolicyRefundInitiatedDate = (value: string): string | undefined => {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return undefined;
  }

  return format(parsed, 'd MMMM yyyy');
};

export const formatPolicyRefundTimelineTimestamp = (value: string): string | undefined => {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return undefined;
  }

  return format(parsed, 'dd/MM/yyyy, hh:mm a');
};

export const getPolicyRefundProgressDetails = (
  refundDetails: PolicyRefundDetailsData | undefined,
): PolicyRefundProgressDetails | undefined => {
  if (!refundDetails) {
    return undefined;
  }

  const activeManualRefund = getActiveManualRefundForDetails(refundDetails);
  if (activeManualRefund?.id != null) {
    return {
      requestId: String(activeManualRefund.id),
      initiatedOn: activeManualRefund.createdOn?.trim() ?? '',
    };
  }

  const primaryRefund = refundDetails.refunds?.[0];
  if (primaryRefund?.requestId?.trim()) {
    return {
      requestId: primaryRefund.requestId.trim(),
      initiatedOn: primaryRefund.initiatedOn?.trim() ?? '',
    };
  }

  return undefined;
};

export const getLatestPolicyRefundEntry = (
  refundDetails: PolicyRefundDetailsData | undefined,
): PolicyRefundEntry | undefined => {
  const refunds = refundDetails?.refunds ?? [];
  if (refunds.length === 0) {
    return undefined;
  }

  return refunds.reduce<PolicyRefundEntry | undefined>((latest, refund) => {
    if (!latest) {
      return refund;
    }

    const latestTime = parseISO(latest.initiatedOn).getTime();
    const refundTime = parseISO(refund.initiatedOn).getTime();

    if (Number.isNaN(refundTime)) {
      return latest;
    }

    if (Number.isNaN(latestTime)) {
      return refund;
    }

    return refundTime >= latestTime ? refund : latest;
  }, undefined);
};

export const shouldShowPolicyRefundStatusBanners = (
  refundDetails: PolicyRefundDetailsData | undefined,
): boolean => getPolicyRefundUiState(refundDetails) !== POLICY_REFUND_UI_STATE.NONE;

export const shouldShowPolicyRefundInProgressBanner = (
  refundDetails: PolicyRefundDetailsData | undefined,
): boolean => {
  const uiState = getPolicyRefundUiState(refundDetails);

  return (
    uiState === POLICY_REFUND_UI_STATE.MANUAL_INITIATED ||
    uiState === POLICY_REFUND_UI_STATE.IN_PROGRESS
  );
};

export const shouldShowPolicyRefundSuccessBanner = (
  refundDetails: PolicyRefundDetailsData | undefined,
): boolean => {
  const uiState = getPolicyRefundUiState(refundDetails);

  return (
    uiState === POLICY_REFUND_UI_STATE.SUCCESS || uiState === POLICY_REFUND_UI_STATE.MANUAL_SETTLED
  );
};

export const isPolicyRefundFailedRetryable = (
  refundDetails: PolicyRefundDetailsData | undefined,
): boolean => getPolicyRefundUiState(refundDetails) === POLICY_REFUND_UI_STATE.FAILED_RETRYABLE;

export const isPolicyRefundFailed = (refundDetails: PolicyRefundDetailsData | undefined): boolean =>
  getPolicyRefundUiState(refundDetails) === POLICY_REFUND_UI_STATE.FAILED;

export const resolveRefundFailureReasonFromEntry = (
  refund?: PolicyRefundEntry | null,
): string | undefined => {
  const failureReason =
    refund?.failureReason ??
    (refund as (PolicyRefundEntry & { failure_reason?: string | null }) | null | undefined)
      ?.failure_reason;

  return failureReason?.trim() || undefined;
};

export const getRefundFailureReasonTimelineLabel = (
  failureReason: string | null | undefined,
): string => {
  const trimmedFailureReason = failureReason?.trim();
  if (!trimmedFailureReason) {
    return `Failed — ${POLICY_REFUND_FAILURE_REASON_TIMELINE_DEFAULT_LABEL}`;
  }

  const mappedLabel =
    POLICY_REFUND_FAILURE_REASON_TIMELINE_LABELS[
      trimmedFailureReason as keyof typeof POLICY_REFUND_FAILURE_REASON_TIMELINE_LABELS
    ];

  return `Failed — ${mappedLabel ?? POLICY_REFUND_FAILURE_REASON_TIMELINE_DEFAULT_LABEL}`;
};

export const getReinitiateRefundEntry = (
  refundDetails: PolicyRefundDetailsData | undefined,
): PolicyRefundEntry | undefined => {
  const refunds = refundDetails?.refunds ?? [];
  if (refunds.length === 0) {
    return undefined;
  }

  return refunds.find((refund) => refund.retryable) ?? getLatestPolicyRefundEntry(refundDetails);
};

export const mapRefundUserTypeToEntityType = (userType: string | undefined): string => {
  const normalizedUserType = userType?.trim().toLowerCase() ?? '';
  if (normalizedUserType === 'customer') {
    return 'user';
  }

  return normalizedUserType || 'user';
};

export const shouldShowInitiateRefundModalFailedAlert = (
  refundDetails: PolicyRefundDetailsData | undefined,
  entryMode: 'default' | 'manual' = 'default',
): boolean => {
  if (entryMode === 'manual') {
    return isPolicyRefundFailed(refundDetails);
  }

  return isPolicyRefundFailedRetryable(refundDetails) || isPolicyRefundFailed(refundDetails);
};

const getRefundFailureReasonMessage = (failureReason: string | undefined): string => {
  if (!failureReason) {
    return POLICY_REFUND_FAILURE_REASON_DEFAULT_MESSAGE;
  }

  return (
    POLICY_REFUND_FAILURE_REASON_MESSAGES[
      failureReason as keyof typeof POLICY_REFUND_FAILURE_REASON_MESSAGES
    ] ?? POLICY_REFUND_FAILURE_REASON_DEFAULT_MESSAGE
  );
};

export const getCashfreeRetryModalFailedAlert = (
  refundDetails: PolicyRefundDetailsData | undefined,
): { title: string; description: string } => {
  const refundEntry = getReinitiateRefundEntry(refundDetails);
  const userType = refundEntry?.userType?.trim().toLowerCase() ?? '';
  const issueLabel =
    userType === 'partner'
      ? undefined
      : POLICY_INITIATE_REFUND_DIALOG.cashfreeRetryModal.failedAlert.defaultIssueLabel;

  return {
    title: issueLabel ? `Refund failed — ${issueLabel}` : 'Refund failed',
    description: getRefundFailureReasonMessage(refundEntry?.failureReason?.trim()),
  };
};
