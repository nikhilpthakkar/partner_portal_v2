import type {
  ManualRefundListResponse,
  UpdateManualRefundStatusPayload,
  UpdateManualRefundStatusResponse,
} from '@/lib/types/manual-refunds/manualRefundsApi';
import { apiClient } from '@/lib/services/axios-client/apiClient';
import { serializeParams } from '@/lib/utils';

/** BFF expects UTC instants, e.g. 2026-07-10T18:30:00Z */
const toManualRefundApiDate = (value?: string): string | undefined => {
  if (!value?.trim()) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

type ListManualRefundsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  status?: string;
  priority?: string;
  policyNumber?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
};

export const fetchManualRefunds = async ({
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
}: ListManualRefundsParams): Promise<ManualRefundListResponse> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/manual-refunds`, {
      params: {
        productIds,
        status,
        priority,
        policyNumber,
        fromDate: toManualRefundApiDate(fromDate),
        toDate: toManualRefundApiDate(toDate),
        page,
        size,
      },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

type UpdateManualRefundStatusParams = {
  partnerId: string;
  lob: string;
  refundId: number;
  productIds: string[];
  payload: UpdateManualRefundStatusPayload;
};

export const updateManualRefundStatus = async ({
  partnerId,
  lob,
  refundId,
  productIds,
  payload,
}: UpdateManualRefundStatusParams): Promise<UpdateManualRefundStatusResponse> => {
  return await apiClient
    .patch(`/lob/${lob}/partner/${partnerId}/manual-refunds/${refundId}`, payload, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};
