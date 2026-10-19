import type { GroupBy } from '@/lib/types/overview';
import { apiClient } from '@/lib/services/axios-client/apiClient';
import type { DataSource } from '@/lib/constants/global.constants';
import type {
  AddLedgerTransactionApiResponse,
  AddLedgerTransactionRequestBody,
  CreateSupportTicketApiResponse,
  CreateSupportTicketRequestBody,
  FloatMonthCoverage,
  FloatMonthCoverageBreakdownRow,
  FloatMonthCoverageMetrics,
  RaiseLedgerDisputeRequestBody,
  RaiseLedgerDisputeApiResponse,
  TransactionSummaryApiEnvelope,
  TransactionSummaryTablePayload,
  TransactionSummaryTableRow,
} from '@/lib/types/financials';
import { serializeParams } from '@/lib/utils';
import { LEDGER_TRANSACTION_MESSAGES } from '@/lib/constants/financialsLedger.constants';

type FetchTransactionSummaryParams = {
  partnerId: string;
  lob: string;
  fromDate: string | Date;
  toDate: string | Date;
  productIds: string[];
  groupBy: GroupBy;
  page: number;
  size: number;
  utr: string;
  source: DataSource;
};

type FetchFloatMonthCoverageParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  lookBackPeriodDays: number;
  source: DataSource;
};

function pickMetricsFromSnapshot(snapshot: Record<string, unknown>): FloatMonthCoverageMetrics {
  const alertRaw = snapshot.alertThreshold;
  return {
    currentFloatBalance: Number(snapshot.currentFloatBalance ?? 0),
    sumTotalBalanceInLookBack: Number(
      snapshot.sumTotalBalanceInLookBack ?? snapshot.sumTotalSpentInLookBack ?? 0,
    ),
    sumTotalSpentInLookBack: Number(
      snapshot.sumTotalSpentInLookBack ?? snapshot.sumTotalBalanceInLookBack ?? 0,
    ),
    averagePerDaySpend: Number(snapshot.averagePerDaySpend ?? 0),
    remainingDaysInMonth: Number(snapshot.remainingDaysInMonth ?? 0),
    requiredBalanceForMonth: Number(snapshot.requiredBalanceForMonth ?? 0),
    isTopUpNeeded: Boolean(snapshot.isTopUpNeeded),
    topUpAmount: pickNumber(snapshot.topUpAmount),
    ...(typeof snapshot.coverageTill === 'string' ? { coverageTill: snapshot.coverageTill } : {}),
    ...(typeof alertRaw === 'number' || typeof alertRaw === 'string'
      ? { alertThreshold: Number(alertRaw) }
      : {}),
  };
}

function normalizeFloatMonthCoverageData(data: unknown): FloatMonthCoverage {
  if (data === null || typeof data !== 'object') {
    throw new Error('Unexpected float month coverage data');
  }

  const d = data as Record<string, unknown>;

  const combinedRaw = d.combined ?? d.snapshot;
  if (combinedRaw === null || typeof combinedRaw !== 'object') {
    throw new Error('Float month coverage missing combined or snapshot');
  }

  const combined = pickMetricsFromSnapshot(combinedRaw as Record<string, unknown>);
  const breakDown = Array.isArray(d.breakDown)
    ? (d.breakDown as FloatMonthCoverageBreakdownRow[])
    : [];

  return {
    combined,
    breakDown,
    lastFetched: typeof d.lastFetched === 'string' ? d.lastFetched : String(d.lastFetched ?? ''),
    lookBackPeriodDays: Number(d.lookBackPeriodDays ?? 0),
  };
}

function pickNumber(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function pickOptionalString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return undefined;
}

/** Maps BFF transaction-summary rows (new `*Amount` fields or legacy names) to {@link TransactionSummaryTableRow}. */
/** @param absoluteIndex Optional stable index across paginated results (e.g. `(page-1)*pageSize + index`). */
export function normalizeTransactionSummaryRow(
  raw: Record<string, unknown>,
  index: number,
  absoluteIndex?: number,
): TransactionSummaryTableRow {
  const periodStart = String(raw.periodStart ?? '');
  const periodEnd = String(raw.periodEnd ?? '');
  const idSuffix = absoluteIndex !== undefined ? absoluteIndex : index;
  return {
    id: `${periodStart}|${periodEnd}|${idSuffix}`,
    periodStart,
    periodEnd,
    depositAmount: pickNumber(raw.depositAmount, raw.deposits),
    depositAdjustmentAmount: pickNumber(raw.depositAdjustmentAmount),
    issuanceAmount: pickNumber(raw.issuanceAmount, raw.premium),
    endorsementAmount: pickNumber(raw.endorsementAmount, raw.endorsmentAmount),
    premiumAdjustmentAmount: pickNumber(raw.premiumAdjustmentAmount),
    accountRefundAmount: pickNumber(raw.accountRefundAmount, raw.accountRefund),
    cancellationAmount: pickNumber(raw.cancellationAmount, raw.cancellationAmount),
    depositUtr: pickOptionalString(raw.depositUtr, raw.utr),
    remarks: pickOptionalString(raw.remarks),
    tcsAmount: pickNumber(raw.tcsAmount, raw.tcsTransactions, raw.tcs),
    tdsAmount: pickNumber(raw.tdsAmount, raw.tdsTransactions, raw.tds),
    totalBalance: pickNumber(raw.totalBalance),
  };
}

function unwrapFloatMonthCoveragePayload(raw: unknown): FloatMonthCoverage {
  if (raw === null || typeof raw !== 'object') {
    throw new Error('Unexpected float month coverage response shape');
  }

  if ('success' in raw && 'data' in raw) {
    const envelope = raw as { success: boolean; message: string; data: unknown };
    if (!envelope.success) {
      throw new Error(envelope.message || 'Failed to load float month coverage');
    }
    return normalizeFloatMonthCoverageData(envelope.data);
  }

  return normalizeFloatMonthCoverageData(raw);
}

export const fetchFloatMonthCoverage = async ({
  partnerId,
  lob,
  productIds,
  lookBackPeriodDays,
  source,
}: FetchFloatMonthCoverageParams): Promise<FloatMonthCoverage> => {
  const res = await apiClient.get<unknown>(
    `/lob/${lob}/partner/${partnerId}/float/month-coverage`,
    {
      params: { productIds, lookBackPeriodDays, source },
      paramsSerializer: serializeParams,
    },
  );
  return unwrapFloatMonthCoveragePayload(res.data);
};

export const fetchTransactionSummary = async ({
  partnerId,
  lob,
  fromDate,
  toDate,
  productIds,
  groupBy,
  page,
  size,
  utr,
  source,
}: FetchTransactionSummaryParams): Promise<TransactionSummaryTablePayload> => {
  const res = await apiClient.get<TransactionSummaryApiEnvelope>(
    `/lob/${lob}/partner/${partnerId}/transaction-summary`,
    {
      params: { fromDate, toDate, productIds, groupBy, page, size, utr, source },
      paramsSerializer: serializeParams,
    },
  );

  const body = res.data;
  if (!body.success) {
    throw new Error(body.message || 'Failed to load transaction summary');
  }

  const { transactions, pagination } = body.data;
  const pageIndex = pagination.currentPage ?? page;
  const pageSizeResolved = pagination.pageSize ?? size;
  const offset = (pageIndex - 1) * pageSizeResolved;

  return {
    pagination,
    transactions: (transactions as unknown[]).map((t, i) =>
      normalizeTransactionSummaryRow(t as Record<string, unknown>, i, offset + i),
    ),
  };
};

const TRANSACTION_SUMMARY_EXPORT_FALLBACK_FILE_NAME = 'transaction-summary-export';

const extractTransactionSummaryExportFileName = (
  contentDispositionHeader: string | null | undefined,
): string => {
  if (!contentDispositionHeader) {
    return TRANSACTION_SUMMARY_EXPORT_FALLBACK_FILE_NAME;
  }

  const utf8Match = contentDispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = contentDispositionHeader.match(/filename="?([^"]+)"?/i);
  if (filenameMatch?.[1]) {
    return filenameMatch[1];
  }

  return TRANSACTION_SUMMARY_EXPORT_FALLBACK_FILE_NAME;
};

type ExportTransactionSummaryParams = {
  partnerId: string;
  lob: string;
  fromDate: string | Date;
  toDate: string | Date;
  productIds: string[];
  groupBy: GroupBy;
  source: DataSource;
};

export const exportTransactionSummary = async ({
  partnerId,
  lob,
  fromDate,
  toDate,
  productIds,
  groupBy,
  source,
}: ExportTransactionSummaryParams): Promise<{ data: Blob; fileName: string }> => {
  const res = await apiClient.get(`/lob/${lob}/partner/${partnerId}/transaction-summary/export`, {
    params: { fromDate, toDate, productIds, groupBy, source },
    paramsSerializer: serializeParams,
    responseType: 'blob',
  });

  return {
    data: res.data,
    fileName: extractTransactionSummaryExportFileName(res.headers['content-disposition']),
  };
};

type RaiseLedgerDisputeParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  body: RaiseLedgerDisputeRequestBody;
};

type CreateSupportTicketParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  body: CreateSupportTicketRequestBody;
};

type AddLedgerTransactionParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  body: AddLedgerTransactionRequestBody;
};

export const raiseLedgerDispute = async ({
  partnerId,
  lob,
  productIds,
  body,
}: RaiseLedgerDisputeParams): Promise<RaiseLedgerDisputeApiResponse> => {
  const res = await apiClient.post<unknown>(
    `/lob/${lob}/partner/${partnerId}/transaction-summary/dispute`,
    body,
    {
      params: { productIds },
      paramsSerializer: serializeParams,
    },
  );

  const data = res.data;
  if (
    data !== null &&
    typeof data === 'object' &&
    'success' in data &&
    (data as { success?: boolean }).success === false
  ) {
    throw new Error((data as { message?: string }).message ?? 'Failed to raise dispute');
  }

  if (data === null || typeof data !== 'object' || !('reference_id' in data)) {
    throw new Error('Unexpected dispute response');
  }

  const referenceId = String((data as { reference_id: unknown }).reference_id ?? '').trim();
  if (!referenceId) {
    throw new Error('Unexpected dispute response: missing reference_id');
  }

  return {
    message: String((data as { message?: unknown }).message ?? 'Dispute submitted successfully'),
    reference_id: referenceId,
  };
};

export const createSupportTicket = async ({
  partnerId,
  lob,
  productIds,
  body,
}: CreateSupportTicketParams): Promise<CreateSupportTicketApiResponse> => {
  const res = await apiClient.post<unknown>(`/lob/${lob}/partner/${partnerId}/support`, body, {
    params: { productIds },
    paramsSerializer: serializeParams,
  });

  const data = res.data;
  if (
    data !== null &&
    typeof data === 'object' &&
    'success' in data &&
    (data as { success?: boolean }).success === false
  ) {
    throw new Error((data as { message?: string }).message ?? 'Failed to create support ticket');
  }

  const response = data as {
    message?: unknown;
    data?: {
      ticket_id?: unknown;
      user_email?: unknown;
      resolution_by?: unknown;
    };
  };

  return {
    message:
      data !== null && typeof data === 'object' && 'message' in data
        ? String(response.message ?? 'Support ticket created successfully')
        : 'Support ticket created successfully',
    ticketId: String(response.data?.ticket_id ?? ''),
    userEmail: String(response.data?.user_email ?? ''),
    resolutionBy: String(response.data?.resolution_by ?? ''),
  };
};

export const addLedgerTransaction = async ({
  partnerId,
  lob,
  productIds,
  body,
}: AddLedgerTransactionParams): Promise<AddLedgerTransactionApiResponse> => {
  const res = await apiClient.post<unknown>(
    `/lob/${lob}/partner/${partnerId}/transaction/add`,
    body,
    {
      params: { productIds },
      paramsSerializer: serializeParams,
    },
  );

  const data = res.data;
  const { failure, success } = LEDGER_TRANSACTION_MESSAGES[body.category];

  if (
    data !== null &&
    typeof data === 'object' &&
    'success' in data &&
    (data as { success?: boolean }).success === false
  ) {
    throw new Error((data as { message?: string }).message ?? failure);
  }

  return {
    message:
      data !== null && typeof data === 'object' && 'message' in data
        ? String((data as { message?: unknown }).message ?? success)
        : success,
  };
};
