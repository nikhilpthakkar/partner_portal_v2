import { apiClient } from '@/lib/services/axios-client/apiClient';
import type {
  CreateDeathClaimRequestBody,
  CreateDeathClaimResponse,
  DeathClaimBankDetailsOperationResponse,
  DeathClaimRequiredDocumentsResponse,
  SubmitDeathClaimBankDetailsPayload,
  SubmitDeathClaimDocumentItem,
  SubmitDeathClaimDocumentsResponse,
} from '@/lib/types/claims-management/deathClaimApi';
import { serializeParams } from '@/lib/utils';

type PostCreateDeathClaimParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  payload: CreateDeathClaimRequestBody;
};

type FetchDeathClaimRequiredDocumentsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  coverId: string;
};

export async function postCreateDeathClaim({
  partnerId,
  lob,
  productIds,
  payload,
}: PostCreateDeathClaimParams): Promise<CreateDeathClaimResponse> {
  const { data } = await apiClient.post<CreateDeathClaimResponse>(
    `/lob/${lob}/partner/${partnerId}/death-claims`,
    payload,
    {
      params: { productIds },
      paramsSerializer: serializeParams,
    },
  );
  return data;
}

export async function fetchDeathClaimRequiredDocuments({
  partnerId,
  lob,
  productIds,
  coverId,
}: FetchDeathClaimRequiredDocumentsParams): Promise<DeathClaimRequiredDocumentsResponse> {
  const { data } = await apiClient.get<DeathClaimRequiredDocumentsResponse>(
    `/lob/${lob}/partner/${partnerId}/death-claims/required-documents`,
    {
      params: { coverId, productIds },
      paramsSerializer: serializeParams,
    },
  );
  return data;
}

type PostSubmitDeathClaimDocumentsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  machineInstanceId: string;
  payload: SubmitDeathClaimDocumentItem[];
};

export async function postSubmitDeathClaimDocuments({
  partnerId,
  lob,
  productIds,
  machineInstanceId,
  payload,
}: PostSubmitDeathClaimDocumentsParams): Promise<SubmitDeathClaimDocumentsResponse> {
  const { data } = await apiClient.post<SubmitDeathClaimDocumentsResponse>(
    `/lob/${lob}/partner/${partnerId}/death-claims/${machineInstanceId}/documents`,
    payload,
    {
      params: { productIds },
      paramsSerializer: serializeParams,
    },
  );
  return data;
}

type PostDeathClaimBankDetailsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  machineInstanceId: string;
  payload: SubmitDeathClaimBankDetailsPayload;
};

export async function postSubmitDeathClaimBankDetails({
  partnerId,
  lob,
  productIds,
  machineInstanceId,
  payload,
}: PostDeathClaimBankDetailsParams): Promise<DeathClaimBankDetailsOperationResponse> {
  const { data } = await apiClient.post<DeathClaimBankDetailsOperationResponse>(
    `/lob/${lob}/partner/${partnerId}/death-claims/${machineInstanceId}/bank-details`,
    payload,
    {
      params: { productIds },
      paramsSerializer: serializeParams,
    },
  );
  return data;
}

type PostDeathClaimSkipBankDetailsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  machineInstanceId: string;
};

export async function postSkipDeathClaimBankDetails({
  partnerId,
  lob,
  productIds,
  machineInstanceId,
}: PostDeathClaimSkipBankDetailsParams): Promise<DeathClaimBankDetailsOperationResponse> {
  const { data } = await apiClient.post<DeathClaimBankDetailsOperationResponse>(
    `/lob/${lob}/partner/${partnerId}/death-claims/${machineInstanceId}/bank-details/skip`,
    {},
    {
      params: { productIds },
      paramsSerializer: serializeParams,
    },
  );
  return data;
}
