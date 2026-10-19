import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { ApiErrorResponse } from '@/lib/types/Global';
import type {
  ManualRefundListResponse,
  UpdateManualRefundStatusPayload,
} from '@/lib/types/manual-refunds/manualRefundsApi';
import type { PolicyRefundDetailsResponse } from '@/lib/types/policy-management/policyRefundApi';
import { MANUAL_REFUND_TAB_STATUSES } from '@/lib/constants/manualRefunds.constants';
import { fetchManualRefunds, updateManualRefundStatus } from '@/lib/services/manual-refunds/api';
import { fetchPolicyRefundDetails } from '@/lib/services/policy-details/api';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { usePartnerStore } from '@/lib/store/partner.store';

export const MANUAL_REFUNDS_LIST_QUERY_KEY = ['manual-refunds-list'];
export const MANUAL_REFUND_DETAILS_QUERY_KEY = ['manual-refund-details'];

type ListManualRefundsQueryParams = {
  /** Selected plan IDs to send as productIds; defaults to store productIds when omitted. */
  productIds?: string[];
  status?: string;
  priority?: string;
  policyNumber?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  enabled?: boolean;
};

export const useManualRefundsListQuery = ({
  productIds: productIdsOverride,
  status,
  priority,
  policyNumber,
  fromDate,
  toDate,
  page = 1,
  size = 20,
  enabled = true,
}: ListManualRefundsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds: storeProductIds } = usePartnerStore();
  const productIds =
    productIdsOverride !== undefined && productIdsOverride.length > 0
      ? productIdsOverride
      : storeProductIds;

  return useQuery<ManualRefundListResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [
      ...MANUAL_REFUNDS_LIST_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      status,
      priority,
      policyNumber,
      fromDate,
      toDate,
      page,
      size,
    ],
    queryFn: () =>
      fetchManualRefunds({
        partnerId,
        lob,
        productIds,
        status,
        priority,
        policyNumber,
        fromDate,
        toDate,
        page,
        size,
      }),
    enabled:
      enabled &&
      isReady &&
      Array.isArray(storeProductIds) &&
      storeProductIds.length > 0 &&
      Array.isArray(productIds) &&
      productIds.length > 0,
  });
};

type ManualRefundStatusCountsParams = {
  productIds?: string[];
  priority?: string;
  fromDate?: string;
  toDate?: string;
  enabled?: boolean;
};

export const useManualRefundStatusCounts = ({
  productIds: productIdsOverride,
  priority,
  fromDate,
  toDate,
  enabled = true,
}: ManualRefundStatusCountsParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds: storeProductIds } = usePartnerStore();
  const productIds =
    productIdsOverride !== undefined && productIdsOverride.length > 0
      ? productIdsOverride
      : storeProductIds;

  const isQueryEnabled =
    enabled &&
    isReady &&
    Array.isArray(storeProductIds) &&
    storeProductIds.length > 0 &&
    Array.isArray(productIds) &&
    productIds.length > 0;

  const countQueries = useQueries({
    queries: MANUAL_REFUND_TAB_STATUSES.map((status) => ({
      queryKey: [
        ...MANUAL_REFUNDS_LIST_QUERY_KEY,
        'status-count',
        partnerId,
        lob,
        productIds,
        status,
        priority,
        fromDate,
        toDate,
      ],
      queryFn: () =>
        fetchManualRefunds({
          partnerId,
          lob,
          productIds,
          status,
          priority,
          fromDate,
          toDate,
          page: 1,
          size: 1,
        }),
      enabled: isQueryEnabled,
      select: (response: ManualRefundListResponse) =>
        response.data?.pagination?.totalElements ?? 0,
    })),
  });

  const statusCountMap = MANUAL_REFUND_TAB_STATUSES.reduce<
    Record<(typeof MANUAL_REFUND_TAB_STATUSES)[number], number>
  >(
    (accumulator, status, index) => {
      accumulator[status] = countQueries[index]?.data ?? 0;
      return accumulator;
    },
    { initiated: 0, settled: 0 },
  );

  return {
    statusCountMap,
    isPending: countQueries.some((query) => query.isPending),
  };
};

export const useUpdateManualRefundStatusMutation = () => {
  const queryClient = useQueryClient();
  const { partnerId, lob, isReady } = usePartnerConfigReady();

  return useMutation({
    mutationFn: async ({
      refundId,
      productIds,
      payload,
    }: {
      refundId: number;
      productIds: string[];
      payload: UpdateManualRefundStatusPayload;
    }) => {
      if (!isReady) {
        throw new Error('Partner configuration not ready');
      }

      if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('Product ID is required to update manual refund status');
      }

      return updateManualRefundStatus({
        partnerId,
        lob,
        refundId,
        productIds,
        payload,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MANUAL_REFUNDS_LIST_QUERY_KEY });
    },
  });
};

type ManualRefundDetailsQueryParams = {
  policyId?: string | null;
  plan?: string | null;
  productIds?: string[];
  enabled?: boolean;
};

export const useManualRefundDetailsQuery = ({
  policyId,
  plan,
  productIds: productIdsOverride,
  enabled = true,
}: ManualRefundDetailsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds: storeProductIds } = usePartnerStore();

  const resolvedPlan = plan?.trim() ?? '';
  const productIds =
    productIdsOverride !== undefined && productIdsOverride.length > 0
      ? productIdsOverride
      : resolvedPlan
        ? [resolvedPlan]
        : storeProductIds;
  const productIdsKey = [...productIds].sort().join(',');

  const isQueryReady =
    enabled &&
    isReady &&
    Boolean(partnerId) &&
    Boolean(lob) &&
    Boolean(policyId?.trim()) &&
    Boolean(resolvedPlan) &&
    productIds.length > 0;

  return useQuery<PolicyRefundDetailsResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [
      ...MANUAL_REFUND_DETAILS_QUERY_KEY,
      partnerId,
      lob,
      policyId,
      resolvedPlan,
      productIdsKey,
    ],
    queryFn: () =>
      fetchPolicyRefundDetails({
        partnerId,
        lob,
        policyId: policyId!.trim(),
        plan: resolvedPlan,
        productIds,
      }),
    enabled: isQueryReady,
    staleTime: 60_000,
  });
};
