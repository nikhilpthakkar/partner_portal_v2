import type { ApiResponse } from '@/lib/types/Global';
import type {
  PolicyDetailsFilters,
  PolicyDetailsResponse,
} from '@/lib/types/policy-management/policyDetailsApi';
import type {
  PolicyClaimsFilters,
  PolicyClaimsResponse,
} from '@/lib/types/policy-management/policyClaimsApi';
import type {
  PolicyEndorsementsFilters,
  PolicyEndorsementsResponse,
} from '@/lib/types/policy-management/policyEndorsementsApi';
import type {
  PolicyCommunicationFilters,
  PolicyCommunicationResponse,
} from '@/lib/types/policy-management/policyCommunicationApi';
import type { PolicyEndorsementResponse } from '@/lib/types/policy-management/policyEndorsementApi';
import type {
  PolicyEndorsementDocumentUploadPayload,
  PolicyEndorsementDocumentUploadResponse,
  PolicyEndorsePolicyPayload,
  PolicyEndorsePolicyResponse,
  PolicyRefundBankDetailsResponse,
  PolicyRefundCalculationResponse,
  PolicyRefundDetailsResponse,
  PolicyValidateBankAccountPayload,
  PolicyValidateBankAccountResponse,
} from '@/lib/types/policy-management/policyRefundApi';
import type { PolicyManualRefundRequestPayload, PolicyManualRefundResponse } from '@/lib/types/policy-management/policyManualRefund';
import type { PolicyReinitiateRefundRequestPayload, PolicyReinitiateRefundResponse } from '@/lib/types/policy-management/policyReinitiateRefund';
import { apiClient } from '@/lib/services/axios-client/apiClient';
import { serializeParams } from '@/lib/utils';

type FetchPolicyDetailsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  policyNumber: string;
  page?: number;
  size?: number;
};

type FetchPolicyClaimsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  policyNumber: string;
  page?: number;
  size?: number;
};

type FetchPolicyEndorsementsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  policyNumber: string;
  page?: number;
  size?: number;
  includeFullData?: boolean;
};

type FetchPolicyCommunicationsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  policyNumber: string;
  page: number;
  pageSize: number;
};

type FetchPolicyEndorsementTypeApplicableParams = {
  partnerId: string;
  lob: string;
  policyId: string;
  plan: string;
  productIds: string[];
};

type FetchPolicyRefundCalculationParams = {
  partnerId: string;
  lob: string;
  policyId: string;
  plan: string;
  cancelDate: string;
  productIds: string[];
};

type FetchPolicyRefundBankDetailsParams = {
  partnerId: string;
  lob: string;
  policyId: string;
  plan: string;
  productIds: string[];
};

type FetchPolicyRefundDetailsParams = {
  partnerId: string;
  lob: string;
  policyId: string;
  plan: string;
  productIds: string[];
};

type PostValidateBankAccountParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  payload: PolicyValidateBankAccountPayload;
};

type PostEndorsePolicyParams = {
  partnerId: string;
  lob: string;
  policyId: string;
  productIds: string[];
  payload: PolicyEndorsePolicyPayload;
};

type PostPolicyManualRefundParams = {
  partnerId: string;
  lob: string;
  policyId: string;
  productIds: string[];
  payload: PolicyManualRefundRequestPayload;
};

type PostPolicyReinitiateRefundParams = {
  partnerId: string;
  lob: string;
  policyId: string;
  productIds: string[];
  payload: PolicyReinitiateRefundRequestPayload;
};

type UploadPolicyEndorsementDocumentParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  payload: PolicyEndorsementDocumentUploadPayload;
};

export const fetchPolicyDetails = async ({
  partnerId,
  lob,
  productIds,
  policyNumber,
  page,
  size,
}: FetchPolicyDetailsParams): Promise<ApiResponse<PolicyDetailsResponse, PolicyDetailsFilters>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policies`, {
      params: { productIds, policyNumber, page, size },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchCachedPolicyDetails = async ({
  partnerId,
  lob,
  productIds,
  policyNumber,
}: FetchPolicyDetailsParams): Promise<ApiResponse<PolicyDetailsResponse, PolicyDetailsFilters>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policies/${policyNumber}`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchPolicyClaims = async ({
  partnerId,
  lob,
  productIds,
  policyNumber,
  page,
  size,
}: FetchPolicyClaimsParams): Promise<ApiResponse<PolicyClaimsResponse, PolicyClaimsFilters>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims`, {
      params: {
        productIds,
        policyNumber,
        page,
        size,
      },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchCachedPolicyClaims = async ({
  partnerId,
  lob,
  productIds,
  policyNumber,
  page,
  size,
}: FetchPolicyClaimsParams): Promise<ApiResponse<PolicyClaimsResponse, PolicyClaimsFilters>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims`, {
      params: {
        productIds,
        policyNumber,
        page,
        size,
      },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchPolicyEndorsements = async ({
  partnerId,
  lob,
  productIds,
  policyNumber,
  page,
  size,
  includeFullData = true,
}: FetchPolicyEndorsementsParams): Promise<
  ApiResponse<PolicyEndorsementsResponse, PolicyEndorsementsFilters>
> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policies/${policyNumber}/endorsements`, {
      params: { productIds, page, size, includeFullData },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchPolicyCommunications = async ({
  partnerId,
  lob,
  productIds,
  policyNumber,
  page,
  pageSize,
}: FetchPolicyCommunicationsParams): Promise<
  ApiResponse<PolicyCommunicationResponse, PolicyCommunicationFilters>
> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/communications/entity/POLICY/id/${policyNumber}`, {
      params: { productIds, page, page_size: pageSize },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchPolicyEndorsementTypeApplicable = async ({
  partnerId,
  lob,
  policyId,
  plan,
  productIds,
}: FetchPolicyEndorsementTypeApplicableParams): Promise<PolicyEndorsementResponse> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policy/${policyId}/endorsementTypeApplicable`, {
      params: { planId: plan, productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchPolicyRefundCalculation = async ({
  partnerId,
  lob,
  policyId,
  plan,
  cancelDate,
  productIds,
}: FetchPolicyRefundCalculationParams): Promise<PolicyRefundCalculationResponse> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policy/${policyId}/calculate-refund`, {
      params: { plan, cancelDate, productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchPolicyRefundBankDetails = async ({
  partnerId,
  lob,
  policyId,
  plan,
  productIds,
}: FetchPolicyRefundBankDetailsParams): Promise<PolicyRefundBankDetailsResponse> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policy/${policyId}/bank-details`, {
      params: { plan, productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchPolicyRefundDetails = async ({
  partnerId,
  lob,
  policyId,
  plan,
  productIds,
}: FetchPolicyRefundDetailsParams): Promise<PolicyRefundDetailsResponse> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policy/${policyId}/refund-details`, {
      params: { plan, productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const postValidateBankAccount = async ({
  partnerId,
  lob,
  productIds,
  payload,
}: PostValidateBankAccountParams): Promise<PolicyValidateBankAccountResponse> => {
  return await apiClient
    .post(`/lob/${lob}/partner/${partnerId}/validate-bank-account`, payload, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const postEndorsePolicy = async ({
  partnerId,
  lob,
  policyId,
  productIds,
  payload,
}: PostEndorsePolicyParams): Promise<PolicyEndorsePolicyResponse> => {
  return await apiClient
    .post(`/lob/${lob}/partner/${partnerId}/policy/${policyId}/endorse-policy`, payload, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const postPolicyManualRefund = async ({
  partnerId,
  lob,
  policyId,
  productIds,
  payload,
}: PostPolicyManualRefundParams): Promise<PolicyManualRefundResponse> => {
  return await apiClient
    .post(`/lob/${lob}/partner/${partnerId}/policy/${policyId}/manual-refunds`, payload, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const postPolicyReinitiateRefund = async ({
  partnerId,
  lob,
  policyId,
  productIds,
  payload,
}: PostPolicyReinitiateRefundParams): Promise<PolicyReinitiateRefundResponse> => {
  return await apiClient
    .post(`/lob/${lob}/partner/${partnerId}/policy/${policyId}/refunds/reinitiate`, payload, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const uploadPolicyEndorsementDocument = async ({
  partnerId,
  lob,
  productIds,
  payload,
}: UploadPolicyEndorsementDocumentParams): Promise<PolicyEndorsementDocumentUploadResponse> => {
  const formData = new FormData();
  formData.append('requestContext', payload.requestContext);
  formData.append('documentType', payload.documentType);
  formData.append('referenceId', payload.referenceId);
  formData.append('document', payload.document);

  return await apiClient
    .post(`/lob/${lob}/partner/${partnerId}/document/upload`, formData, {
      params: { productIds },
      paramsSerializer: serializeParams,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data);
};
