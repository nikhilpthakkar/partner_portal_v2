import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { ApiErrorResponse, ApiResponse } from '@/lib/types/Global';
import {
  fetchPolicyRefundBankDetails,
  fetchPolicyClaims,
  fetchPolicyCommunications,
  fetchPolicyDetails,
  fetchPolicyEndorsementTypeApplicable,
  fetchPolicyEndorsements,
  fetchPolicyRefundCalculation,
  fetchPolicyRefundDetails,
  uploadPolicyEndorsementDocument,
  postEndorsePolicy,
  postPolicyManualRefund,
  postPolicyReinitiateRefund,
  postValidateBankAccount,
  fetchCachedPolicyDetails,
} from '@/lib/services/policy-details/api';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
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
  PolicyEndorsePolicyPayload,
  PolicyEndorsePolicyResponse,
  PolicyEndorsementDocumentUploadPayload,
  PolicyEndorsementDocumentUploadResponse,
  PolicyRefundBankDetailsResponse,
  PolicyRefundCalculationResponse,
  PolicyRefundDetailsResponse,
  PolicyValidateBankAccountPayload,
  PolicyValidateBankAccountResponse,
} from '@/lib/types/policy-management/policyRefundApi';
import type {
  PolicyManualRefundRequestPayload,
  PolicyManualRefundResponse,
} from '@/lib/types/policy-management/policyManualRefund';
import type {
  PolicyReinitiateRefundRequestPayload,
  PolicyReinitiateRefundResponse,
} from '@/lib/types/policy-management/policyReinitiateRefund';
import { usePartnerStore } from '../store/partner.store';
import { isCancellationOrPreclosedPolicyStatus } from '@/lib/utils/policyRefundDetails.utils';

export const POLICY_DETAILS_QUERY_KEY = ['policy-details'];
export const POLICY_CLAIMS_QUERY_KEY = ['policy-claims'];
export const POLICY_ENDORSEMENTS_QUERY_KEY = ['policy-endorsements'];
export const POLICY_COMMUNICATIONS_QUERY_KEY = ['policy-communications'];
export const POLICY_ENDORSEMENT_TYPE_APPLICABLE_QUERY_KEY = ['policy-endorsement-type-applicable'];
export const POLICY_REFUND_CALCULATION_QUERY_KEY = ['policy-refund-calculation'];
export const POLICY_REFUND_BANK_DETAILS_QUERY_KEY = ['policy-refund-bank-details'];
export const POLICY_REFUND_DETAILS_QUERY_KEY = ['policy-refund-details'];
export const POLICY_VALIDATE_BANK_ACCOUNT_MUTATION_KEY = ['policy-validate-bank-account'];
export const POLICY_ENDORSE_POLICY_MUTATION_KEY = ['policy-endorse-policy'];
export const POLICY_MANUAL_REFUND_MUTATION_KEY = ['policy-manual-refund'];
export const POLICY_REINITIATE_REFUND_MUTATION_KEY = ['policy-reinitiate-refund'];
export const POLICY_ENDORSEMENT_DOCUMENT_UPLOAD_MUTATION_KEY = [
  'policy-endorsement-document-upload',
];

type PolicyDetailsQueryParams = {
  policyNumber: string;
  page?: number;
  size?: number;
  enabled?: boolean;
};

type PolicyClaimsQueryParams = {
  policyNumber: string;
  page?: number;
  size?: number;
  enabled?: boolean;
};

type PolicyEndorsementsQueryParams = {
  policyNumber: string;
  page?: number;
  size?: number;
  includeFullData?: boolean;
  enabled?: boolean;
};

type PolicyCommunicationsQueryParams = {
  policyNumber: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
};

type PolicyEndorsementTypeApplicableQueryParams = {
  policyId: string;
  plan: string;
  enabled?: boolean;
};

type PolicyRefundCalculationQueryParams = {
  policyId: string;
  plan: string;
  cancelDate: string;
  enabled?: boolean;
};

type PolicyRefundBankDetailsQueryParams = {
  policyId: string;
  plan: string;
  enabled?: boolean;
};

type PolicyRefundDetailsQueryParams = {
  policyId: string;
  plan: string;
  policyStatus: string | null;
  enabled?: boolean;
};

type PolicyEndorsePolicyMutationParams = {
  policyId: string;
  payload: PolicyEndorsePolicyPayload;
};

type PolicyManualRefundMutationParams = {
  policyId: string;
  payload: PolicyManualRefundRequestPayload;
};

type PolicyReinitiateRefundMutationParams = {
  policyId: string;
  payload: PolicyReinitiateRefundRequestPayload;
};

type PolicyEndorsementDocumentUploadMutationParams = {
  payload: PolicyEndorsementDocumentUploadPayload;
};

export const usePolicyDetailsQuery = ({
  policyNumber,
  page = 1,
  size = 10,
  enabled = true,
}: PolicyDetailsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<
    ApiResponse<PolicyDetailsResponse, PolicyDetailsFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [...POLICY_DETAILS_QUERY_KEY, partnerId, lob, productIds, policyNumber, page, size],
    queryFn: () =>
      fetchPolicyDetails({
        partnerId,
        lob,
        productIds,
        policyNumber,
        page,
        size,
      }),
    enabled: enabled && isReady && Boolean(policyNumber) && productIds.length > 0,
  });
};

export const useCachedPolicyDetailsQuery = ({
  policyNumber,
  enabled = true,
}: PolicyDetailsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<
    ApiResponse<PolicyDetailsResponse, PolicyDetailsFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [...POLICY_DETAILS_QUERY_KEY, partnerId, lob, productIds, policyNumber],
    queryFn: () =>
      fetchCachedPolicyDetails({
        partnerId,
        lob,
        productIds,
        policyNumber,
      }),
    enabled: enabled && isReady && Boolean(policyNumber) && productIds.length > 0,
  });
};

export const usePolicyClaimsQuery = ({
  policyNumber,
  page = 1,
  size = 10,
  enabled = true,
}: PolicyClaimsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<
    ApiResponse<PolicyClaimsResponse, PolicyClaimsFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [...POLICY_CLAIMS_QUERY_KEY, partnerId, lob, productIds, policyNumber, page, size],
    queryFn: () =>
      fetchPolicyClaims({
        partnerId,
        lob,
        productIds,
        policyNumber,
        page,
        size,
      }),
    enabled: enabled && isReady && Boolean(policyNumber) && productIds.length > 0,
  });
};

export const usePolicyEndorsementsQuery = ({
  policyNumber,
  page = 0,
  size = 10,
  includeFullData = true,
  enabled = true,
}: PolicyEndorsementsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<
    ApiResponse<PolicyEndorsementsResponse, PolicyEndorsementsFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [
      ...POLICY_ENDORSEMENTS_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      policyNumber,
      page,
      size,
      includeFullData,
    ],
    queryFn: () =>
      fetchPolicyEndorsements({
        partnerId,
        lob,
        productIds,
        policyNumber,
        page,
        size,
        includeFullData,
      }),
    enabled: enabled && isReady && Boolean(policyNumber),
  });
};

export const usePolicyCommunicationsQuery = ({
  policyNumber,
  page = 1,
  pageSize = 15,
  enabled = true,
}: PolicyCommunicationsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<
    ApiResponse<PolicyCommunicationResponse, PolicyCommunicationFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [
      ...POLICY_COMMUNICATIONS_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      policyNumber,
      page,
      pageSize,
    ],
    queryFn: () =>
      fetchPolicyCommunications({
        partnerId,
        lob,
        productIds,
        policyNumber,
        page,
        pageSize,
      }),
    enabled: enabled && isReady && Boolean(policyNumber) && productIds.length > 0,
  });
};

export const usePolicyEndorsementTypeApplicableQuery = ({
  policyId,
  plan,
  enabled = true,
}: PolicyEndorsementTypeApplicableQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<PolicyEndorsementResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [
      ...POLICY_ENDORSEMENT_TYPE_APPLICABLE_QUERY_KEY,
      partnerId,
      lob,
      policyId,
      plan,
      productIds,
    ],
    queryFn: () =>
      fetchPolicyEndorsementTypeApplicable({
        partnerId,
        lob,
        policyId,
        plan,
        productIds,
      }),
    enabled:
      enabled &&
      isReady &&
      Boolean(policyId) &&
      Boolean(plan) &&
      Array.isArray(productIds) &&
      productIds.length > 0,
  });
};

export const usePolicyRefundCalculationQuery = ({
  policyId,
  plan,
  cancelDate,
  enabled = true,
}: PolicyRefundCalculationQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<PolicyRefundCalculationResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [
      ...POLICY_REFUND_CALCULATION_QUERY_KEY,
      partnerId,
      lob,
      policyId,
      plan,
      cancelDate,
      productIds,
    ],
    queryFn: () =>
      fetchPolicyRefundCalculation({
        partnerId,
        lob,
        policyId,
        plan,
        cancelDate,
        productIds,
      }),
    enabled:
      enabled &&
      isReady &&
      Boolean(policyId) &&
      Boolean(plan) &&
      Boolean(cancelDate) &&
      Array.isArray(productIds) &&
      productIds.length > 0,
  });
};

export const usePolicyRefundBankDetailsQuery = ({
  policyId,
  plan,
  enabled = true,
}: PolicyRefundBankDetailsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<PolicyRefundBankDetailsResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [...POLICY_REFUND_BANK_DETAILS_QUERY_KEY, partnerId, lob, policyId, plan, productIds],
    queryFn: () =>
      fetchPolicyRefundBankDetails({
        partnerId,
        lob,
        policyId,
        plan,
        productIds,
      }),
    enabled:
      enabled &&
      isReady &&
      Boolean(policyId) &&
      Boolean(plan) &&
      Array.isArray(productIds) &&
      productIds.length > 0,
  });
};

export const usePolicyRefundDetailsQuery = ({
  policyId,
  plan,
  policyStatus,
  enabled = true,
}: PolicyRefundDetailsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const shouldFetchRefundDetails = isCancellationOrPreclosedPolicyStatus(policyStatus);
  const productIdsKey = [...productIds].sort().join(',');
  const isQueryReady =
    enabled &&
    shouldFetchRefundDetails &&
    isReady &&
    Boolean(partnerId) &&
    Boolean(lob) &&
    Boolean(policyId) &&
    Boolean(plan) &&
    productIds.length > 0;

  return useQuery<PolicyRefundDetailsResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [
      ...POLICY_REFUND_DETAILS_QUERY_KEY,
      partnerId,
      lob,
      policyId,
      plan,
      productIdsKey,
    ],
    queryFn: () =>
      fetchPolicyRefundDetails({
        partnerId,
        lob,
        policyId,
        plan,
        productIds,
      }),
    enabled: isQueryReady,
    staleTime: 60_000,
  });
};

export const usePolicyValidateBankAccountMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    PolicyValidateBankAccountResponse,
    AxiosError<ApiErrorResponse>,
    PolicyValidateBankAccountPayload
  >({
    mutationKey: [...POLICY_VALIDATE_BANK_ACCOUNT_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: (payload) =>
      postValidateBankAccount({
        partnerId,
        lob,
        productIds,
        payload,
      }),
  });
};

export const usePolicyEndorsePolicyMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    PolicyEndorsePolicyResponse,
    AxiosError<ApiErrorResponse>,
    PolicyEndorsePolicyMutationParams
  >({
    mutationKey: [...POLICY_ENDORSE_POLICY_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ policyId, payload }) =>
      postEndorsePolicy({
        partnerId,
        lob,
        policyId,
        productIds,
        payload,
      }),
  });
};

export const usePolicyManualRefundMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    PolicyManualRefundResponse,
    AxiosError<ApiErrorResponse>,
    PolicyManualRefundMutationParams
  >({
    mutationKey: [...POLICY_MANUAL_REFUND_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ policyId, payload }) =>
      postPolicyManualRefund({
        partnerId,
        lob,
        policyId,
        productIds,
        payload,
      }),
  });
};

export const usePolicyReinitiateRefundMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    PolicyReinitiateRefundResponse,
    AxiosError<ApiErrorResponse>,
    PolicyReinitiateRefundMutationParams
  >({
    mutationKey: [...POLICY_REINITIATE_REFUND_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ policyId, payload }) =>
      postPolicyReinitiateRefund({
        partnerId,
        lob,
        policyId,
        productIds,
        payload,
      }),
  });
};

export const usePolicyEndorsementDocumentUploadMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    PolicyEndorsementDocumentUploadResponse,
    AxiosError<ApiErrorResponse>,
    PolicyEndorsementDocumentUploadMutationParams
  >({
    mutationKey: [...POLICY_ENDORSEMENT_DOCUMENT_UPLOAD_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ payload }) =>
      uploadPolicyEndorsementDocument({
        partnerId,
        lob,
        productIds,
        payload,
      }),
  });
};
