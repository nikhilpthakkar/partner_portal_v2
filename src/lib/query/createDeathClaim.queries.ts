import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import {
  fetchDeathClaimRequiredDocuments,
  postCreateDeathClaim,
  postSkipDeathClaimBankDetails,
  postSubmitDeathClaimBankDetails,
  postSubmitDeathClaimDocuments,
} from '@/lib/services/claims-management/createDeathClaim.api';
import { usePartnerStore } from '@/lib/store/partner.store';
import type { ApiErrorResponse } from '@/lib/types/Global';
import type {
  CreateDeathClaimRequestBody,
  CreateDeathClaimResponse,
  DeathClaimBankDetailsOperationResponse,
  DeathClaimRequiredDocumentsResponse,
  SubmitDeathClaimBankDetailsPayload,
  SubmitDeathClaimDocumentItem,
  SubmitDeathClaimDocumentsResponse,
} from '@/lib/types/claims-management/deathClaimApi';

export const CREATE_DEATH_CLAIM_MUTATION_KEY = ['create-death-claim'];
export const DEATH_CLAIM_REQUIRED_DOCUMENTS_QUERY_KEY = 'death-claim-required-documents';
export const SUBMIT_DEATH_CLAIM_DOCUMENTS_MUTATION_KEY = ['submit-death-claim-documents'];
export const SUBMIT_DEATH_CLAIM_BANK_DETAILS_MUTATION_KEY = ['submit-death-claim-bank-details'];
export const SKIP_DEATH_CLAIM_BANK_DETAILS_MUTATION_KEY = ['skip-death-claim-bank-details'];

export const useCreateDeathClaimMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    CreateDeathClaimResponse,
    AxiosError<ApiErrorResponse>,
    CreateDeathClaimRequestBody
  >({
    mutationKey: [...CREATE_DEATH_CLAIM_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: (payload) =>
      postCreateDeathClaim({
        partnerId,
        lob,
        productIds,
        payload,
      }),
  });
};

type UseDeathClaimRequiredDocumentsQueryArgs = {
  coverId: string;
  enabled: boolean;
};

export const useDeathClaimRequiredDocumentsQuery = ({
  coverId,
  enabled,
}: UseDeathClaimRequiredDocumentsQueryArgs) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<DeathClaimRequiredDocumentsResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [DEATH_CLAIM_REQUIRED_DOCUMENTS_QUERY_KEY, partnerId, lob, productIds, coverId],
    queryFn: async () => {
      const res = await fetchDeathClaimRequiredDocuments({
        partnerId,
        lob,
        productIds,
        coverId,
      });
      if (!res.success) {
        throw new Error(res.message || 'Failed to load required documents');
      }
      return res;
    },
    enabled: Boolean(enabled && isReady && coverId && productIds.length > 0),
    staleTime: 60_000,
  });
};

type SubmitDeathClaimDocumentsMutationParams = {
  machineInstanceId: string;
  payload: SubmitDeathClaimDocumentItem[];
};

export const useSubmitDeathClaimDocumentsMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    SubmitDeathClaimDocumentsResponse,
    AxiosError<ApiErrorResponse>,
    SubmitDeathClaimDocumentsMutationParams
  >({
    mutationKey: [...SUBMIT_DEATH_CLAIM_DOCUMENTS_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ machineInstanceId, payload }) =>
      postSubmitDeathClaimDocuments({
        partnerId,
        lob,
        productIds,
        machineInstanceId,
        payload,
      }),
  });
};

type SubmitDeathClaimBankDetailsMutationParams = {
  machineInstanceId: string;
  payload: SubmitDeathClaimBankDetailsPayload;
};

export const useSubmitDeathClaimBankDetailsMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    DeathClaimBankDetailsOperationResponse,
    AxiosError<ApiErrorResponse>,
    SubmitDeathClaimBankDetailsMutationParams
  >({
    mutationKey: [...SUBMIT_DEATH_CLAIM_BANK_DETAILS_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ machineInstanceId, payload }) =>
      postSubmitDeathClaimBankDetails({
        partnerId,
        lob,
        productIds,
        machineInstanceId,
        payload,
      }),
  });
};

type SkipDeathClaimBankDetailsMutationParams = {
  machineInstanceId: string;
};

export const useSkipDeathClaimBankDetailsMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    DeathClaimBankDetailsOperationResponse,
    AxiosError<ApiErrorResponse>,
    SkipDeathClaimBankDetailsMutationParams
  >({
    mutationKey: [...SKIP_DEATH_CLAIM_BANK_DETAILS_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ machineInstanceId }) =>
      postSkipDeathClaimBankDetails({
        partnerId,
        lob,
        productIds,
        machineInstanceId,
      }),
  });
};
