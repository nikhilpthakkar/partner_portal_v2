import { CURRENCY_UNIT_MAP } from '@/lib/constants/global.constants';
import type { ApiResponse } from '@/lib/types/Global';
import type {
  PolicyClaimsFilters,
  PolicyClaimsResponse,
  PolicyClaim,
  PolicyClaimPayment,
} from '@/lib/types/policy-management/policyClaimsApi';
import type {
  PolicyClaimsHistoryAction,
  PolicyClaimsHistoryRow,
  PolicyClaimsHistoryTable,
  PolicyDetailsPanel,
} from '@/lib/types/policy-management/policyDetails';

const DEFAULT_CLAIMS_HISTORY_ACTIONS: PolicyClaimsHistoryAction[] = [
  { type: 'view' },
  { type: 'share' },
];

const resolveDateLabel = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return value;
  }

  return dateValue.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const resolveAmountLabel = (payments?: PolicyClaimPayment[]): string => {
  if (!payments?.length) {
    return '-';
  }

  const total = payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
  return `${CURRENCY_UNIT_MAP.INR}${total.toFixed(2)}`;
};

const toTitleCase = (value?: string): string => {
  if (!value) {
    return '-';
  }

  return value.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
};

const mapClaimRow = (claim: PolicyClaim): PolicyClaimsHistoryRow => ({
  id: claim.claimRequestNumber,
  claimId: claim.claimRequestNumber,
  date: resolveDateLabel(claim.fnolCompletedOn),
  amount: resolveAmountLabel(claim.payments),
  type: toTitleCase(claim.detailedStatus),
  status: claim.statusGroup,
  actions: DEFAULT_CLAIMS_HISTORY_ACTIONS,
});

const mapClaimsHistoryTable = (
  baseTable: PolicyClaimsHistoryTable,
  response?: ApiResponse<PolicyClaimsResponse, PolicyClaimsFilters>,
): PolicyClaimsHistoryTable => ({
  ...baseTable,
  rows: response?.data?.claims?.map(mapClaimRow) ?? [],
  pagination: {
    ...baseTable.pagination,
    page: response?.data?.pagination?.currentPage ?? baseTable.pagination.page,
    rowsPerPage: response?.data?.pagination?.pageSize ?? baseTable.pagination.rowsPerPage,
  },
});

export const mapPolicyClaimsToPanel = (
  basePanel: PolicyDetailsPanel,
  response?: ApiResponse<PolicyClaimsResponse, PolicyClaimsFilters>,
): PolicyDetailsPanel => {
  if (!basePanel.claimsHistory) {
    return basePanel;
  }

  return {
    ...basePanel,
    claimsHistory: mapClaimsHistoryTable(basePanel.claimsHistory, response),
  };
};

export const mapPolicyClaimsToTable = (
  baseTable: PolicyClaimsHistoryTable,
  response?: ApiResponse<PolicyClaimsResponse, PolicyClaimsFilters>,
): PolicyClaimsHistoryTable => mapClaimsHistoryTable(baseTable, response);
