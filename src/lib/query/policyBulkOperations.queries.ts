import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import {
  fetchBulkActionList,
  fetchBulkActionStatusSummary,
  fetchBulkActionUploadedBy,
} from '@/lib/services/policy-management/api';
import { usePartnerStore } from '@/lib/store/partner.store';
import type { ApiErrorResponse, ApiResponse } from '@/lib/types/Global';
import type {
  BulkActionListApiResponse,
  BulkActionStatusSummaryData,
  BulkActionStatusSummaryFilters,
  BulkActionUploadedByResponse,
} from '@/lib/types/policy-bulk-operations';

export const BULK_ACTION_STATUS_SUMMARY_QUERY_KEY = ['bulk-action-status-summary'] as const;

export type BulkActionStatusSummaryQueryParams = {
  from: string | undefined;
  to: string | undefined;
  plan?: string[];
  uploadedBy?: string[];
};

export const useBulkActionStatusSummaryQuery = ({
  from,
  to,
  plan,
  uploadedBy,
}: BulkActionStatusSummaryQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<
    ApiResponse<BulkActionStatusSummaryData, BulkActionStatusSummaryFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [
      ...BULK_ACTION_STATUS_SUMMARY_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      from,
      to,
      plan,
      uploadedBy,
    ],
    queryFn: () =>
      fetchBulkActionStatusSummary({
        partnerId,
        lob,
        productIds,
        from: from ?? '',
        to: to ?? '',
        plan,
        uploadedBy,
      }),
    enabled: isReady && productIds.length > 0 && Boolean(from) && Boolean(to),
    refetchOnMount: 'always',
  });
};

export const BULK_ACTION_LIST_QUERY_KEY = ['bulk-action-list'] as const;

export type BulkActionListQueryParams = {
  from: string | undefined;
  to: string | undefined;
  plan?: string[];
  uploadedBy?: string[];
  page: number;
  size: number;
  listStatus?: string;
  actionPathSegment?: string;
};

export const useBulkActionListQuery = ({
  from,
  to,
  plan,
  uploadedBy,
  page,
  size,
  listStatus,
  actionPathSegment,
}: BulkActionListQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<BulkActionListApiResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [
      ...BULK_ACTION_LIST_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      from,
      to,
      plan,
      uploadedBy,
      page,
      size,
      listStatus,
      actionPathSegment,
    ],
    queryFn: () =>
      fetchBulkActionList({
        partnerId,
        lob,
        productIds,
        page,
        size,
        from: from ?? '',
        to: to ?? '',
        plan,
        uploadedBy,
        status: listStatus,
        actionPathSegment,
      }),
    enabled: isReady && productIds.length > 0 && Boolean(from) && Boolean(to),
    placeholderData: keepPreviousData,
  });
};

export const BULK_ACTION_UPLOADED_BY_QUERY_KEY = ['bulk-action-uploaded-by'] as const;

export type BulkActionUploadedByQueryParams = {
  startDate: string | undefined;
  endDate: string | undefined;
  planIds: string[];
  enabled?: boolean;
};

export const useBulkActionUploadedByQuery = ({
  startDate,
  endDate,
  planIds,
  enabled = true,
}: BulkActionUploadedByQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<BulkActionUploadedByResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [
      ...BULK_ACTION_UPLOADED_BY_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      startDate,
      endDate,
      planIds,
    ],
    queryFn: () =>
      fetchBulkActionUploadedBy({
        partnerId,
        lob,
        productIds,
        startDate: startDate ?? '',
        endDate: endDate ?? '',
        planIds,
      }),
    enabled:
      enabled &&
      isReady &&
      productIds.length > 0 &&
      Boolean(startDate) &&
      Boolean(endDate) &&
      planIds.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
