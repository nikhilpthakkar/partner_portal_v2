import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addLedgerTransaction,
  createSupportTicket,
  fetchFloatMonthCoverage,
  fetchTransactionSummary,
  exportTransactionSummary,
  raiseLedgerDispute,
} from '@/lib/services/financials/api';
import { uploadPolicyEndorsementDocument } from '@/lib/services/policy-details/api';
import type {
  AddLedgerTransactionPayload,
  AddLedgerTransactionRequestBody,
  CreateSupportTicketPayload,
  CreateSupportTicketRequestBody,
  FloatMonthCoverage,
  LedgerFilters,
  RaiseDisputePayload,
  RaiseLedgerDisputeRequestBody,
  TransactionSummaryTablePayload,
} from '@/lib/types/financials';
import type { GroupBy } from '@/lib/types/overview';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { useDataSource } from '@/lib/hooks/useDataSourceUrlState';
import { usePartnerStore } from '@/lib/store/partner.store';
import { useFinancialsStore } from '@/lib/store/financials.store';
import { segmentPartnerBaseFromPartner } from '@/lib/segment/partnerBase';
import { trackFinancialsDisputeDocumentUploadException } from '@/lib/segment/track/financials';
import { readPartnerPortalApiErrorMessage } from '@/lib/utils/createClaim';
import { toast } from 'sonner';

export const FLOAT_BALANCE_QUERY_KEY = ['float-balance'];

export const FLOAT_MONTH_COVERAGE_LOOK_BACK_DAYS = 30;
export const LEDGER_QUERY_KEY = ['ledger'];

const AGGREGATE_TO_GROUP_BY: Record<LedgerFilters['aggregateBy'], GroupBy> = {
  Day: 'DAILY',
  Month: 'MONTHLY',
  Quarter: 'QUARTERLY',
};

function buildRaiseDisputeRequestBody(payload: RaiseDisputePayload): RaiseLedgerDisputeRequestBody {
  const body: RaiseLedgerDisputeRequestBody = {
    category: 'transaction_mismatch',
    description: payload.description,
    disputePeriods: payload.disputePeriods,
  };
  const docs = payload.documents;
  if (docs.length > 0) {
    body.documents = docs.map((d) => ({ url: d.url, name: d.name }));
  }
  return body;
}

function buildCreateSupportTicketRequestBody(
  payload: CreateSupportTicketPayload,
): CreateSupportTicketRequestBody {
  const body: CreateSupportTicketRequestBody = {
    category: payload.category,
    description: payload.description,
  };
  const docs = payload.documents;
  if (docs.length > 0) {
    body.documents = docs.map((d) => ({ url: d.url, name: d.name }));
  }
  return body;
}

export const useFloatBalanceQuery = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const dataSource = useDataSource();

  return useQuery<FloatMonthCoverage>({
    queryKey: [
      ...FLOAT_BALANCE_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      FLOAT_MONTH_COVERAGE_LOOK_BACK_DAYS,
      dataSource,
    ],
    queryFn: () =>
      fetchFloatMonthCoverage({
        partnerId,
        lob,
        productIds,
        lookBackPeriodDays: FLOAT_MONTH_COVERAGE_LOOK_BACK_DAYS,
        source: dataSource,
      }),
    enabled: isReady && productIds.length > 0,
  });
};

export const useLedgerQuery = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const dataSource = useDataSource();
  const { page, pageSize, filters } = useFinancialsStore();

  const fromDateKey = filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : '';
  const toDateKey = filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : '';

  return useQuery<TransactionSummaryTablePayload>({
    queryKey: [
      ...LEDGER_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      page,
      pageSize,
      filters.aggregateBy,
      filters.searchUtr,
      fromDateKey,
      toDateKey,
      dataSource,
    ],
    queryFn: () =>
      fetchTransactionSummary({
        partnerId,
        lob,
        fromDate: fromDateKey,
        toDate: toDateKey,
        productIds,
        groupBy: AGGREGATE_TO_GROUP_BY[filters.aggregateBy],
        page,
        size: pageSize,
        utr: filters.searchUtr,
        source: dataSource,
      }),
    enabled: isReady && productIds.length > 0 && Boolean(fromDateKey && toDateKey),
  });
};

export const useExportTransactionSummaryMutation = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const dataSource = useDataSource();
  const filters = useFinancialsStore((s) => s.filters);

  return useMutation({
    mutationFn: async () => {
      if (!isReady || productIds.length === 0) {
        throw new Error('Partner configuration not ready');
      }
      const from = filters.dateRange.from;
      const to = filters.dateRange.to;
      if (!from || !to) {
        throw new Error('Select a date range');
      }
      const fromDate = format(from, 'yyyy-MM-dd');
      const toDate = format(to, 'yyyy-MM-dd');
      return exportTransactionSummary({
        partnerId,
        lob,
        fromDate,
        toDate,
        productIds,
        groupBy: AGGREGATE_TO_GROUP_BY[filters.aggregateBy],
        source: dataSource,
      });
    },
  });
};

/** Ledger dispute document: same BFF multipart endpoint as policy endorsement uploads. */
const DISPUTE_DOCUMENT_REQUEST_CONTEXT = 'POLICY';

export const useDisputeDocumentUploadMutation = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation({
    mutationFn: async (documents: File[]) => {
      if (!isReady || productIds.length === 0) {
        throw new Error('Partner configuration not ready');
      }
      if (documents.length === 0) {
        throw new Error('No files to upload');
      }
      const baseRef = Date.now();
      return Promise.all(
        documents.map((document, index) =>
          uploadPolicyEndorsementDocument({
            partnerId,
            lob,
            productIds,
            payload: {
              requestContext: DISPUTE_DOCUMENT_REQUEST_CONTEXT,
              documentType: 'OTHER',
              referenceId: `${baseRef}-${index}-${document.name}`,
              document,
            },
          }),
        ),
      );
    },
    onSuccess: (_, documents) => {
      const n = documents.length;
      toast.success(n === 1 ? 'Document uploaded' : `${n} documents uploaded`);
    },
    onError: (error) => {
      const message = readPartnerPortalApiErrorMessage(
        error,
        'Failed to upload document... Please try again.',
      );
      trackFinancialsDisputeDocumentUploadException(
        segmentPartnerBaseFromPartner(lob, partnerId, productIds),
        message,
      );
      toast.error(message);
    },
  });
};

export const useRaiseDisputeMutation = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const { closeDisputeModal, clearSelection } = useFinancialsStore();

  return useMutation({
    mutationFn: async (payload: RaiseDisputePayload) => {
      if (!isReady || productIds.length === 0) {
        throw new Error('Partner configuration not ready');
      }
      if (payload.entryIds.length === 0) {
        throw new Error('No ledger entries selected');
      }

      const body = buildRaiseDisputeRequestBody(payload);
      return raiseLedgerDispute({ partnerId, lob, productIds, body });
    },
    onSuccess: (result) => {
      closeDisputeModal();
      clearSelection();
      const ref = result.reference_id;
      toast.success('Dispute raised', {
        description: `Your dispute was raised. We will get back with a resolution in 1-2 days. Dispute reference number is #${ref}, the details have been sent to your registered email.`,
        duration: 8000,
        classNames: {
          description: '!text-[#0A0A0A]',
        },
      });
    },
    onError: () => {
      toast.error('Failed to raise dispute. Please try again.');
    },
  });
};

export const useCreateSupportTicketMutation = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const { clearSelection } = useFinancialsStore();

  return useMutation({
    mutationFn: async (payload: CreateSupportTicketPayload) => {
      if (!isReady || productIds.length === 0) {
        throw new Error('Partner configuration not ready');
      }

      const body = buildCreateSupportTicketRequestBody(payload);
      return createSupportTicket({ partnerId, lob, productIds, body });
    },
    onSuccess: (result) => {
      clearSelection();
      if (!result.ticketId) {
        toast.success(result.message || 'Support ticket created successfully');
      }
    },
    onError: () => {
      toast.error('Failed to create support ticket. Please try again.');
    },
  });
};

export const useAddLedgerTransactionMutation = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddLedgerTransactionPayload) => {
      if (!isReady) {
        throw new Error('Partner configuration not ready');
      }
      if (payload.productIds.length === 0) {
        throw new Error('No products selected');
      }

      const body: AddLedgerTransactionRequestBody = {
        category: payload.category,
        amount: payload.amount,
        notes: payload.notes,
        utrNumber: payload.utrNumber,
        transactionDate: payload.transactionDate,
      };

      if (payload.planId) {
        body.planId = payload.planId;
      }

      if (payload.bankAccountNumber) {
        body.bankAccountNumber = payload.bankAccountNumber;
      }

      return addLedgerTransaction({
        partnerId,
        lob,
        productIds: payload.productIds,
        body,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: FLOAT_BALANCE_QUERY_KEY });
    },
  });
};
