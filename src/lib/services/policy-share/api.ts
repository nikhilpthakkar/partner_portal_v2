import { ApiResponse } from '@/lib/types/Global';
import {
  PolicyShareFilters,
  PolicyShareTriggerResponse,
  PolicyShareRecipientResponse,
  PolicyShareTriggerPayload,
} from '@/lib/types/policy-management/policyShareApi';
import { apiClient } from '../axios-client/apiClient';
import { serializeParams } from '@/lib/utils';

type FetchGetAllRecipientsParams = {
  policyId: string;
  partnerId: string;
  lob: string;
  productIds: string[];
};

type PolicyShareTriggerParams = {
  partnerId: string;
  lob: string;
  payload: PolicyShareTriggerPayload;
  productIds: string[];
};

export const fetchAllRecipients = async ({
  policyId,
  partnerId,
  lob,
  productIds,
}: FetchGetAllRecipientsParams): Promise<
  ApiResponse<PolicyShareRecipientResponse[], PolicyShareFilters>
> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policy/share`, {
      params: { productIds, policyId },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const policyShareTrigger = async ({
  partnerId,
  lob,
  payload,
  productIds,
}: PolicyShareTriggerParams): Promise<
  ApiResponse<PolicyShareTriggerResponse, PolicyShareFilters>
> => {
  return await apiClient
    .post(`/lob/${lob}/partner/${partnerId}/policy/share`, payload, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};
