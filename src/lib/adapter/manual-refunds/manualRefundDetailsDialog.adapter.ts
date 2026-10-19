import { format } from 'date-fns';
import { MANUAL_REFUND_DETAILS_DIALOG } from '@/lib/constants/manualRefunds.constants';
import type { InitiatedByDetails, ManualRefundData } from '@/lib/types/manual-refunds/manualRefundsApi';
import type { ManualRefundDetailsDialogViewModel } from '@/lib/types/manual-refunds/manualRefundDetailsDialog';
import type { PolicyRefundDetailsData } from '@/lib/types/policy-management/policyRefundApi';
import { formatExactRefundAmount } from '@/lib/utils';

const FALLBACK_VALUE = '—';

type ManualRefundDataWithSnakeCase = ManualRefundData & {
  refund_amount?: number | null;
  instrument_type?: string | null;
  account_number?: string | null;
  account_holder?: string | null;
  bank_name?: string | null;
  refund_destination?: string | null;
  created_on?: string | null;
  updated_on?: string | null;
  initiated_by?: InitiatedByDetails | null;
};

type PolicyRefundDetailsDataWithSnakeCase = PolicyRefundDetailsData & {
  active_manual_refund?: ManualRefundDataWithSnakeCase | null;
};

const formatDialogDateTime = (value?: string | null): string => {
  if (!value?.trim()) {
    return FALLBACK_VALUE;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, 'd MMM yyyy, hh:mm a');
};

const normalizeManualRefundRecord = (
  raw: ManualRefundDataWithSnakeCase,
  refundDetails?: PolicyRefundDetailsData,
): ManualRefundData => ({
  id: raw.id,
  policyId: raw.policyId ?? null,
  policyEkey: raw.policyEkey ?? refundDetails?.policyEkey ?? null,
  policyNumber: raw.policyNumber ?? refundDetails?.policyNumber ?? null,
  partnerId: raw.partnerId ?? null,
  planId: raw.planId ?? refundDetails?.productId ?? null,
  instrumentType: raw.instrumentType ?? raw.instrument_type ?? null,
  accountNumber: raw.accountNumber ?? raw.account_number ?? null,
  ifsc: raw.ifsc ?? null,
  accountHolder: raw.accountHolder ?? raw.account_holder ?? null,
  bankName: raw.bankName ?? raw.bank_name ?? null,
  vpa: raw.vpa ?? null,
  refundAmount: raw.refundAmount ?? raw.refund_amount ?? null,
  status: raw.status ?? null,
  utr: raw.utr ?? null,
  remark: raw.remark ?? null,
  priority: raw.priority ?? null,
  refundDestination: raw.refundDestination ?? raw.refund_destination ?? null,
  initiatedBy: raw.initiatedBy ?? raw.initiated_by ?? null,
  createdOn: raw.createdOn ?? raw.created_on ?? null,
  updatedOn: raw.updatedOn ?? raw.updated_on ?? null,
});

export const resolveActiveManualRefundFromDetails = (
  refundDetails?: PolicyRefundDetailsData,
): ManualRefundData | undefined => {
  const raw =
    refundDetails?.activeManualRefund ??
    (refundDetails as PolicyRefundDetailsDataWithSnakeCase | undefined)?.active_manual_refund;

  if (!raw?.id) {
    return undefined;
  }

  return normalizeManualRefundRecord(raw, refundDetails);
};

const isSameManualRefundId = (
  left: number | string | null | undefined,
  right: number | string | null | undefined,
): boolean => {
  if (left == null || right == null) {
    return false;
  }

  return Number(left) === Number(right);
};

const resolveRefundDestinationKind = (
  refund?: Pick<ManualRefundData, 'refundDestination'> | null,
): 'customer' | 'partner' | '' => {
  const raw = refund?.refundDestination?.trim().toLowerCase() ?? '';

  if (raw === 'customer' || raw === 'user') {
    return 'customer';
  }

  if (raw === 'partner') {
    return 'partner';
  }

  return '';
};

const resolveRefundDestinationUserType = (
  refundDetails: PolicyRefundDetailsData | undefined,
  listRefund: ManualRefundData,
): 'customer' | 'partner' | '' => {
  const fromViewedRefund = resolveRefundDestinationKind(listRefund);
  if (fromViewedRefund) {
    return fromViewedRefund;
  }

  const activeManualRefund = resolveActiveManualRefundFromDetails(refundDetails);
  if (activeManualRefund && isSameManualRefundId(activeManualRefund.id, listRefund.id)) {
    return resolveRefundDestinationKind(activeManualRefund);
  }

  return '';
};

const resolveRefundDestinationBadgeClassName = (destinationKind: string): string => {
  if (destinationKind === 'customer') {
    return 'bg-blue-100 text-secondary-foreground border-transparent';
  }

  if (destinationKind === 'partner') {
    return 'bg-orange-100 text-secondary-foreground border-transparent';
  }

  return 'bg-muted text-secondary-foreground border-transparent';
};

const resolveRefundStatus = (status: string): {
  label: string;
  badgeClassName: string;
} => {
  if (status === 'settled') {
    return {
      label: MANUAL_REFUND_DETAILS_DIALOG.statusLabels.successful,
      badgeClassName: 'bg-green-100 text-secondary-foreground border-transparent',
    };
  }

  return {
    label: MANUAL_REFUND_DETAILS_DIALOG.statusLabels.initiated,
    badgeClassName: 'bg-orange-100 text-secondary-foreground border-transparent',
  };
};

export const mergeManualRefundWithDetails = (
  listRefund: ManualRefundData,
  refundDetails?: PolicyRefundDetailsData,
): ManualRefundData => {
  const activeManualRefund = resolveActiveManualRefundFromDetails(refundDetails);
  const policyContext = {
    policyNumber: listRefund.policyNumber ?? refundDetails?.policyNumber ?? null,
    policyEkey: listRefund.policyEkey ?? refundDetails?.policyEkey ?? null,
    planId: listRefund.planId ?? refundDetails?.productId ?? null,
    partnerId: listRefund.partnerId ?? null,
  };

  if (!activeManualRefund) {
    return {
      ...listRefund,
      ...policyContext,
    };
  }

  if (!isSameManualRefundId(activeManualRefund.id, listRefund.id)) {
    return {
      ...listRefund,
      ...policyContext,
    };
  }

  return {
    ...listRefund,
    ...activeManualRefund,
    ...policyContext,
    policyNumber:
      activeManualRefund.policyNumber ?? policyContext.policyNumber,
    policyEkey: activeManualRefund.policyEkey ?? policyContext.policyEkey,
    planId: activeManualRefund.planId ?? policyContext.planId,
    partnerId: activeManualRefund.partnerId ?? policyContext.partnerId,
    bankName: activeManualRefund.bankName ?? listRefund.bankName ?? null,
    refundDestination:
      activeManualRefund.refundDestination ?? listRefund.refundDestination ?? null,
  };
};

export const mapManualRefundToDetailsDialogViewModel = (
  refund: ManualRefundData,
  refundDetails?: PolicyRefundDetailsData,
): ManualRefundDetailsDialogViewModel => {
  const status = (refund.status ?? '').trim().toLowerCase();
  const isSettled = status === 'settled';
  const refundStatus = resolveRefundStatus(status);
  const destinationKind = resolveRefundDestinationUserType(refundDetails, refund);
  const destinationTypeLabel =
    destinationKind === 'customer'
      ? MANUAL_REFUND_DETAILS_DIALOG.destinationTypes.customer
      : destinationKind === 'partner'
        ? MANUAL_REFUND_DETAILS_DIALOG.destinationTypes.partner
        : FALLBACK_VALUE;

  return {
    policyNumber: refund.policyNumber?.trim() || FALLBACK_VALUE,
    refundStatusLabel: refundStatus.label,
    refundStatusBadgeClassName: refundStatus.badgeClassName,
    refundId: String(refund.id),
    refundAmount: formatExactRefundAmount(refund.refundAmount),
    initiatedOn: formatDialogDateTime(refund.createdOn),
    completedOn: isSettled ? formatDialogDateTime(refund.updatedOn) : FALLBACK_VALUE,
    utrReference: refund.utr?.trim() || FALLBACK_VALUE,
    destinationKind,
    destinationTypeLabel,
    destinationTypeBadgeClassName: resolveRefundDestinationBadgeClassName(destinationKind),
    accountHolderName: refund.accountHolder?.trim() || FALLBACK_VALUE,
    accountNumber: refund.accountNumber?.trim() || refund.vpa?.trim() || FALLBACK_VALUE,
    ifscCode: refund.ifsc?.trim() || FALLBACK_VALUE,
    canEditDetails: status === 'initiated',
  };
};
