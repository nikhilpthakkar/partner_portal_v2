import {
  HealthCardData,
  HealthCardPdfData,
  HealthCardPdfFilters,
  HealthCardSharePayload,
  HealthCardShareResponse,
  HealthCardsFilters,
} from '@/lib/types/policy-management/policyHealthCardApi';
import { apiClient } from '../axios-client/apiClient';
import { ApiResponse } from '@/lib/types/Global';
import { serializeParams } from '@/lib/utils';

type FetchPolicyHealthCardParams = {
  partnerId: string;
  lob: string;
  policyId: string;
  productIds: string[];
};

type FetchPolicyHealthCardPdfParams = {
  partnerId: string;
  lob: string;
  policyId: string;
  uhid: string;
  productIds: string[];
};

type SharePolicyHealthCardParams = {
  partnerId: string;
  lob: string;
  payload: HealthCardSharePayload;
  productIds: string[];
};

export const fetchPolicyHealthCards = async ({
  partnerId,
  lob,
  policyId,
  productIds,
}: FetchPolicyHealthCardParams): Promise<ApiResponse<HealthCardData[], HealthCardsFilters>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policy/health-card/${policyId}`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchPolicyHealthCardPdf = async ({
  partnerId,
  lob,
  policyId,
  uhid,
  productIds,
}: FetchPolicyHealthCardPdfParams): Promise<
  ApiResponse<HealthCardPdfData, HealthCardPdfFilters>
> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policy/health-card/${policyId}/pdf/${uhid}`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const sharePolicyHealthCard = async ({
  partnerId,
  lob,
  payload,
  productIds,
}: SharePolicyHealthCardParams): Promise<HealthCardShareResponse> => {
  return await apiClient
    .post(`/lob/${lob}/partner/${partnerId}/policy/health-card/share`, payload, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};
