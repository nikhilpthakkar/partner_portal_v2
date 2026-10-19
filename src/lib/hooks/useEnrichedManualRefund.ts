'use client';

import { useMemo } from 'react';
import { mergeManualRefundWithDetails } from '@/lib/adapter/manual-refunds/manualRefundDetailsDialog.adapter';
import { useManualRefundDetailsQuery } from '@/lib/query/manualRefunds.queries';
import type { ManualRefundData } from '@/lib/types/manual-refunds/manualRefundsApi';

type ManualRefundDataWithSnakeCase = ManualRefundData & {
  policy_ekey?: string | null;
  plan_id?: string | null;
};

const resolvePolicyEkey = (refund: ManualRefundData | null): string | undefined => {
  const withSnakeCase = refund as ManualRefundDataWithSnakeCase | null;
  return withSnakeCase?.policyEkey?.trim() || withSnakeCase?.policy_ekey?.trim() || undefined;
};

const resolvePlanId = (refund: ManualRefundData | null): string | undefined => {
  const withSnakeCase = refund as ManualRefundDataWithSnakeCase | null;
  return withSnakeCase?.planId?.trim() || withSnakeCase?.plan_id?.trim() || undefined;
};

type UseEnrichedManualRefundParams = {
  refund: ManualRefundData | null;
  enabled?: boolean;
};

export const useEnrichedManualRefund = ({
  refund,
  enabled = true,
}: UseEnrichedManualRefundParams) => {
  const policyId = resolvePolicyEkey(refund);
  const plan = resolvePlanId(refund);
  const productIds = plan ? [plan] : [];

  const { data, isPending, isError } = useManualRefundDetailsQuery({
    policyId,
    plan,
    productIds,
    enabled: enabled && Boolean(refund && policyId && plan),
  });

  const enrichedRefund = useMemo(() => {
    if (!refund) {
      return null;
    }

    return mergeManualRefundWithDetails(refund, data?.data);
  }, [refund, data?.data]);

  return {
    enrichedRefund,
    refundDetails: data?.data,
    isPending,
    isError,
  };
};
