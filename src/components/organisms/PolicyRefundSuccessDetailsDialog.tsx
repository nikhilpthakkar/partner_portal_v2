'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { POLICY_REFUND_UI_STATE } from '@/lib/constants/policyAutoRefund.constants';
import type {
  PolicyRefundDetailsData,
  PolicyRefundPremiumValue,
} from '@/lib/types/policy-management/policyRefundApi';
import {
  getLatestPolicyRefundEntry,
  getPolicyRefundUiState,
  getRefundFailureReasonTimelineLabel,
  resolveActiveManualRefundFromDetails,
  resolveRefundFailureReasonFromEntry,
} from '@/lib/utils/policyRefundDetails.utils';

type PolicyRefundSuccessDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refundDetails?: PolicyRefundDetailsData;
  originalPremium?: number | null;
};

type PolicyRefundDetailsContentProps = {
  refundDetails: PolicyRefundDetailsData;
  originalPremium?: number | null;
  refundRequestId?: string;
  manualRefundId?: string;
  refundDestination?: string;
};

type RefundSuccessDetails = {
  originalPremium?: number | null;
  currentPremium?: number | null;
  refundAmount?: number | null;
  mode: string;
  status: string;
  failureReason?: string | null;
  refundSource?: string | null;
  accountHolder?: string | null;
  accountNumber?: string | null;
  ifsc?: string | null;
};

const NOT_AVAILABLE = '-';

const formatCurrency = (amount?: number | null) =>
  typeof amount === 'number'
    ? `₹${new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)}`
    : NOT_AVAILABLE;

const getPremiumAmount = (premium?: PolicyRefundPremiumValue | null): number | null => {
  if (typeof premium === 'number') {
    return premium;
  }

  return typeof premium?.amount === 'number' ? premium.amount : null;
};

const formatRefundSource = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return NOT_AVAILABLE;
  }

  return trimmed
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatFailureReason = (failureReason?: string | null, isFailed?: boolean) => {
  if (!isFailed && !failureReason?.trim()) {
    return NOT_AVAILABLE;
  }

  return getRefundFailureReasonTimelineLabel(failureReason).replace(/^Failed — /, '');
};

const formatStatus = (status?: string | null) => {
  const normalized = status?.trim().toLowerCase();
  if (
    ['settled', 'completed', 'success', 'successful', 'manual_settled'].includes(normalized ?? '')
  ) {
    return 'Completed';
  }
  if (['failed', 'failure', 'failed_retryable'].includes(normalized ?? '')) {
    return 'Failed';
  }
  return 'In progress';
};

const getSuccessDetails = (
  refundDetails: PolicyRefundDetailsData,
  originalPremium?: number | null,
  refundRequestId?: string,
  manualRefundId?: string,
  refundDestination?: string,
): RefundSuccessDetails => {
  const uiState = getPolicyRefundUiState(refundDetails);
  const activeManualRefund = resolveActiveManualRefundFromDetails(refundDetails);
  const isManualUiState =
    uiState === POLICY_REFUND_UI_STATE.MANUAL_INITIATED ||
    uiState === POLICY_REFUND_UI_STATE.MANUAL_SETTLED;
  const manualRefund =
    manualRefundId && String(activeManualRefund?.id) === manualRefundId
      ? activeManualRefund
      : !refundRequestId && !manualRefundId && isManualUiState
        ? activeManualRefund
        : undefined;
  const refund = refundRequestId
    ? refundDetails.refunds?.find((entry) => entry.requestId?.trim() === refundRequestId.trim())
    : manualRefund
      ? undefined
      : (refundDetails.refunds?.[0] ?? getLatestPolicyRefundEntry(refundDetails));
  const accountDetails = refund?.customerAccountDetails;
  const status = formatStatus(manualRefund?.status ?? refund?.status ?? uiState);
  const rawFailureReason = resolveRefundFailureReasonFromEntry(refund);

  return {
    originalPremium:
      getPremiumAmount(refund?.originalPremium) ??
      getPremiumAmount(refundDetails.originalPremium) ??
      originalPremium,
    currentPremium:
      getPremiumAmount(refund?.currentPremium) ?? getPremiumAmount(refundDetails.currentPremium),
    refundAmount: manualRefund?.refundAmount ?? refund?.refundAmount ?? refundDetails.refundAmount,
    mode: manualRefund ? 'Manual refund' : 'Cashfree refund',
    status,
    failureReason: formatFailureReason(rawFailureReason, status === 'Failed'),
    refundSource: formatRefundSource(
      refundDestination ??
        manualRefund?.refundDestination ??
        refund?.refundSource ??
        refund?.source ??
        manualRefund?.refundSource ??
        manualRefund?.source ??
        refundDetails.refundSource ??
        refundDetails.source,
    ),
    accountHolder: manualRefund?.accountHolder ?? accountDetails?.name,
    accountNumber: manualRefund?.accountNumber ?? accountDetails?.number,
    ifsc: manualRefund?.ifsc ?? accountDetails?.ifsc,
  };
};

export function PolicyRefundSuccessDetailsDialog({
  open,
  onOpenChange,
  refundDetails,
  originalPremium,
}: PolicyRefundSuccessDetailsDialogProps) {
  if (!refundDetails) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Refund details</DialogTitle>
        </DialogHeader>
        <PolicyRefundDetailsContent
          refundDetails={refundDetails}
          originalPremium={originalPremium}
        />
      </DialogContent>
    </Dialog>
  );
}

export function PolicyRefundDetailsContent({
  refundDetails,
  originalPremium,
  refundRequestId,
  manualRefundId,
  refundDestination,
}: PolicyRefundDetailsContentProps) {
  const details = getSuccessDetails(
    refundDetails,
    originalPremium,
    refundRequestId,
    manualRefundId,
    refundDestination,
  );
  const statusClassName =
    details.status === 'Completed'
      ? 'bg-green-100 text-green-800'
      : details.status === 'Failed'
        ? 'bg-red-100 text-red-800'
        : 'bg-blue-100 text-blue-800';

  return (
    <div className="rounded-md border border-border bg-[#f8f8f8] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Refund details</p>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClassName}`}>
          {details.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <dt className="text-xs text-muted-foreground">Original premium</dt>
          <dd className="mt-1 text-xs font-medium text-foreground">
            {formatCurrency(details.originalPremium)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Current premium</dt>
          <dd className="mt-1 text-xs font-medium text-foreground">
            {formatCurrency(details.currentPremium)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Refund amount</dt>
          <dd className="mt-1 text-xs font-medium text-foreground">
            {formatCurrency(details.refundAmount)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Mode</dt>
          <dd className="mt-1 text-xs font-medium text-foreground">{details.mode}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Failure reason</dt>
          <dd className="mt-1 text-xs font-medium text-foreground">{details.failureReason}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Refund destination</dt>
          <dd className="mt-1 text-xs font-medium text-foreground">{details.refundSource}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">Bank account</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs text-muted-foreground">Account holder</dt>
            <dd className="mt-1 break-words text-xs font-medium text-foreground">
              {details.accountHolder?.trim() || NOT_AVAILABLE}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Account number</dt>
            <dd className="mt-1 text-xs font-medium text-foreground">
              {details.accountNumber?.trim() || NOT_AVAILABLE}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">IFSC</dt>
            <dd className="mt-1 text-xs font-medium text-foreground">
              {details.ifsc?.trim() || NOT_AVAILABLE}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
