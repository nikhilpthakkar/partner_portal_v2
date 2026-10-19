import type { DateRange } from 'react-day-picker';

import type { Pagination } from '@/lib/types/Global';
import type { GroupBy } from '@/lib/types/overview';

export type LedgerEntry = {
  id: string;
  date: string;
  deposits: number;
  premium: number;
  accountRefund: number;
  floatRefund: number;
  depositUtr: string;
  tcs: number;
  tds: number;
  totalBalance: number;
};

export type FloatBalance = {
  currentBalance: number;
  coversTillDate: string;
  coversDays: number;
  rechargeAmount: number;
  rechargeCoversTillDate: string;
  currentCoveragePercentage: number;
  alertThreshold: number;
};

export type FloatMonthCoverageMetrics = {
  currentFloatBalance: number;
  /** Legacy API field name */
  sumTotalBalanceInLookBack: number;
  /** Current API field name (`sumTotalSpentInLookBack`) */
  sumTotalSpentInLookBack?: number;
  averagePerDaySpend: number;
  remainingDaysInMonth: number;
  requiredBalanceForMonth: number;
  isTopUpNeeded: boolean;
  topUpAmount: number;
  coverageTill?: string;
  alertThreshold?: number;
};

export type FloatMonthCoverageBreakdownRow = FloatMonthCoverageMetrics & {
  productId: string;
};

export type FloatMonthCoverageApiData = {
  snapshot?: FloatMonthCoverageMetrics;
  combined?: FloatMonthCoverageMetrics;
  breakDown?: FloatMonthCoverageBreakdownRow[];
  lastFetched: string;
  lookBackPeriodDays: number;
};

/** Normalized client shape after `normalizeFloatMonthCoverageData` (snapshot + combined API → `combined`). */
export type FloatMonthCoverage = {
  combined: FloatMonthCoverageMetrics;
  breakDown: FloatMonthCoverageBreakdownRow[];
  lastFetched: string;
  lookBackPeriodDays: number;
};

/** When BFF wraps the payload like transaction-summary: `{ success, message, data }`. */
export type FloatMonthCoverageApiEnvelope = {
  success: boolean;
  message: string;
  data: FloatMonthCoverage | FloatMonthCoverageApiData;
  meta?: {
    timestamp?: string;
    traceId?: string;
    errors?: unknown[];
  };
};

export type LedgerFilters = {
  dateRange: DateRange;
  aggregateBy: 'Day' | 'Month' | 'Quarter';
  searchUtr: string;
};

/** @deprecated Use {@link TransactionSummaryTablePayload} from the transaction-summary API. */
export type LedgerResponse = {
  entries: LedgerEntry[];
  pagination: Pagination;
};

/** Single row from GET .../transaction-summary (`data.transactions[]`), normalized for the UI. */
export type TransactionSummaryRow = {
  periodStart: string;
  periodEnd: string;
  depositAmount: number;
  depositAdjustmentAmount: number;
  issuanceAmount: number;
  endorsementAmount: number;
  premiumAdjustmentAmount: number;
  accountRefundAmount: number;
  cancellationAmount: number;
  depositUtr?: string;
  remarks?: string;
  tcsAmount: number;
  tdsAmount: number;
  totalBalance: number;
};

export type TransactionSummaryTableRow = TransactionSummaryRow & { id: string };

export type TransactionSummaryPayload = {
  transactions: TransactionSummaryRow[];
  pagination: Pagination;
};

export type TransactionSummaryTablePayload = {
  transactions: TransactionSummaryTableRow[];
  pagination: Pagination;
};

export type TransactionSummaryMetaFilters = {
  fromDate: string;
  toDate: string;
  partnerId: string;
  lob: string;
  productIds: string[];
  groupBy: GroupBy;
};

export type TransactionSummaryApiEnvelope = {
  success: boolean;
  message: string;
  data: TransactionSummaryPayload;
  meta: {
    filters: TransactionSummaryMetaFilters;
    timestamp: string;
    traceId: string;
    errors: unknown[];
  };
};

/** Stored document reference after multipart upload (BFF returns signed URL + name). */
export type DisputeUploadedDocument = {
  url: string;
  name: string;
};

/**
 * BFF raise-dispute body (snake_case per API contract).
 * `document` is always an array of `{ url, name }` (omit when no files attached).
 */
export type RaiseLedgerDisputeRequestBody = {
  category: 'transaction_mismatch';
  description: string;
  disputePeriods: string[];
  documents?: { url: string; name: string }[];
};

export type RaiseDisputePayload = {
  entryIds: string[];
  description: string;
  disputePeriods: string[];
  documents: DisputeUploadedDocument[];
};

export type RaiseLedgerDisputeApiResponse = {
  message: string;
  reference_id: string;
};

export type CreateSupportTicketRequestBody = {
  category: string;
  description: string;
  documents?: DisputeUploadedDocument[];
};

export type CreateSupportTicketPayload = {
  category: string;
  description: string;
  documents: DisputeUploadedDocument[];
};

export type CreateSupportTicketApiResponse = {
  message: string;
  ticketId: string;
  userEmail: string;
  resolutionBy: string;
};

export type LedgerTransactionCategory = 'TCS' | 'TDS' | 'REFUND_DEPOSIT' | 'DEPOSIT';

export type AddLedgerTransactionRequestBody = {
  category: LedgerTransactionCategory;
  amount: number;
  notes: string;
  utrNumber: string;
  transactionDate: string;
  planId?: string;
  bankAccountNumber?: string;
};

export type AddLedgerTransactionPayload = AddLedgerTransactionRequestBody & {
  productIds: string[];
};

export type AddLedgerTransactionApiResponse = {
  message: string;
};

export type FinancialTab = 'ledger_summary' | 'reports' | 'settlement';
