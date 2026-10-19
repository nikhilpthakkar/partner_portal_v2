import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { useClaimsCoverFetchReady } from '@/lib/hooks/useClaimsCoverFetchReady';
import {
  claimShareTrigger,
  fetchClaimShareRecipients,
  fetchClaimStatusCount,
  deleteUploadedDocument,
  fetchClaimCommunications,
  fetchClaimDetails,
  fetchMinimalClaimDetails,
  fetchRecentClaimsSearches,
  fetchUploadedDocuments,
  submitUploadedDocuments,
  uploadClaimDocuments,
  fetchClaimTracking,
  fetchCachedClaimDetails,
} from '@/lib/services/claims-detail/api';
import { useClaimShareStore } from '@/lib/store/claimShare.store';
import { useClaimsDetailStore } from '@/lib/store/claimsDetail.store';
import { usePartnerStore } from '@/lib/store/partner.store';
import type { ApiErrorResponse, ApiResponse } from '@/lib/types/Global';
import type {
  ClaimShareFilters,
  ClaimShareRecipientResponse,
  ClaimShareTriggerPayload,
  ClaimShareTriggerResponse,
} from '@/lib/types/claims-management/claimShareApi';
import type {
  ClaimsDetailFilters,
  ClaimsDetailResponse,
  ClaimStatusCountData,
} from '@/lib/types/claims-management/claimsDetailApi';
import type {
  ClaimsCommunicationFilters,
  ClaimsCommunicationResponse,
} from '@/lib/types/claims-management/claimsCommunicationApi';
import { DocumentsData, DocumentsFilters } from '@/lib/types/claims-management/uploadedDocumentApi';
import { toast } from 'sonner';
import { ClaimTrackingData } from '../types/claims-management/statusTimelineApi';

export const CLAIMS_DETAIL_QUERY_KEY = ['claims-detail'];
export const CLAIM_STATUS_COUNT_QUERY_KEY = ['claim-status-count'];
export const CLAIMS_COMMUNICATIONS_QUERY_KEY = ['claim-communications'];
export const CLAIM_SHARE_RECIPIENTS_QUERY_KEY = ['claim-share-recipients'];
export const CLAIM_STATUS_TIMELINE_QUERY_KEY = ['claim-status-timeline'];
export const UPLOADED_DOCUMENTS_QUERY_KEY = ['uploaded-documents'];
export const UPLOAD_DOCUMENTS_MUTATION_KEY = ['upload-documents'];
export const SUBMIT_UPLOADED_DOCUMENTS_MUTATION_KEY = ['submit-uploaded-documents'];
export const DELETE_UPLOADED_DOCUMENTS_MUTATION_KEY = ['delete-uploaded-documents'];
export const CLAIM_SHARE_TRIGGER_MUTATION_KEY = ['claim-share-trigger'];

type ClaimsDetailQueryOptions = {
  enabled?: boolean;
  includeSearchFilters?: boolean;
};

type ClaimCommunicationsQueryParams = {
  claimNumber: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
};

export const useClaimsDetailQuery = ({
  enabled = true,
  includeSearchFilters = true,
}: ClaimsDetailQueryOptions = {}) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const {
    policyNumber,
    statusGroups,
    phoneNumber,
    claimNumber,
    coverIds,
    page,
    size,
    fromDate,
    toDate,
  } = useClaimsDetailStore();
  const canFetchCoverFiltered = useClaimsCoverFetchReady(enabled);

  let resolvedClaimNumbers = '';
  let resolvedPolicyNumber = '';
  let resolvedPhoneNumber = '';

  if (includeSearchFilters) {
    resolvedPolicyNumber = policyNumber?.trim() ?? '';
    resolvedClaimNumbers = claimNumber?.trim() ?? '';
    resolvedPhoneNumber = phoneNumber?.trim() ?? '';
  }

  return useQuery<
    ApiResponse<ClaimsDetailResponse, ClaimsDetailFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [
      ...CLAIMS_DETAIL_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      includeSearchFilters,
      resolvedPolicyNumber,
      statusGroups,
      resolvedPhoneNumber,
      resolvedClaimNumbers,
      coverIds,
      fromDate,
      toDate,
      page,
      size,
    ],
    queryFn: () => {
      const params = {
        partnerId,
        lob,
        productIds,
        policyNumber: resolvedPolicyNumber,
        statusGroups,
        phoneNumber: resolvedPhoneNumber,
        claimNumbers: resolvedClaimNumbers,
        coverIds: coverIds.length > 0 ? coverIds : undefined,
        fromDate,
        toDate,
        page,
        size,
      };
      // Full claims API for overview search; minimal payload for status tabs.
      return includeSearchFilters ? fetchClaimDetails(params) : fetchMinimalClaimDetails(params);
    },
    enabled: enabled && isReady && productIds.length > 0 && canFetchCoverFiltered,
  });
};

export const useCachedClaimDetailsQuery = ({ enabled = true }: ClaimsDetailQueryOptions = {}) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const { claimNumber } = useClaimsDetailStore();

  return useQuery<
    ApiResponse<ClaimsDetailResponse, ClaimsDetailFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [...CLAIMS_DETAIL_QUERY_KEY, partnerId, lob, productIds, claimNumber],
    queryFn: () =>
      fetchCachedClaimDetails({
        partnerId,
        lob,
        productIds,
        claimNumber,
      }),
    enabled: enabled && isReady && productIds.length > 0 && Boolean(claimNumber),
  });
};

export const useRecentSearchesQuery = ({ enabled = true }: ClaimsDetailQueryOptions = {}) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const { coverIds } = useClaimsDetailStore();
  const canFetchCoverFiltered = useClaimsCoverFetchReady(enabled);

  return useQuery<
    ApiResponse<ClaimsDetailResponse, ClaimsDetailFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [...CLAIMS_DETAIL_QUERY_KEY, partnerId, lob, productIds, coverIds],
    queryFn: () =>
      fetchRecentClaimsSearches({
        partnerId,
        lob,
        productIds,
        coverIds: coverIds.length > 0 ? coverIds : undefined,
      }),
    enabled: enabled && isReady && productIds.length > 0 && canFetchCoverFiltered,
  });
};

type ClaimStatusCountQueryParams = ClaimsDetailQueryOptions & {
  statusGroups: string[];
};

export const useClaimStatusCountQuery = ({
  statusGroups,
  enabled = true,
}: ClaimStatusCountQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const { fromDate, toDate, coverIds } = useClaimsDetailStore();
  const canFetchCoverFiltered = useClaimsCoverFetchReady(enabled);

  return useQuery<ApiResponse<ClaimStatusCountData, null>, AxiosError<ApiErrorResponse>>({
    queryKey: [
      ...CLAIM_STATUS_COUNT_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      statusGroups,
      coverIds,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      fetchClaimStatusCount({
        partnerId,
        lob,
        productIds,
        statusGroups,
        coverIds: coverIds.length > 0 ? coverIds : undefined,
        fromDate,
        toDate,
      }),
    enabled:
      enabled && isReady && productIds.length > 0 && statusGroups.length > 0 && canFetchCoverFiltered,
  });
};

export const useClaimCommunicationsQuery = ({
  claimNumber,
  page = 1,
  pageSize = 10,
  enabled = true,
}: ClaimCommunicationsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<
    ApiResponse<ClaimsCommunicationResponse, ClaimsCommunicationFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [
      ...CLAIMS_COMMUNICATIONS_QUERY_KEY,
      partnerId,
      lob,
      productIds,
      claimNumber,
      page,
      pageSize,
    ],
    queryFn: () =>
      fetchClaimCommunications({
        partnerId,
        lob,
        productIds,
        claimNumber,
        page,
        pageSize,
      }),
    enabled: enabled && isReady && Boolean(claimNumber) && productIds.length > 0,
  });
};

type ClaimRecipientsQueryOptions = {
  policyId?: string;
  policyNumber?: string;
  enabled?: boolean;
};

export const useGetAllClaimRecipientsQuery = ({ policyId }: ClaimRecipientsQueryOptions = {}) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const { policyEkey, policyNumber } = useClaimShareStore();
  const resolvedPolicyId = policyId ?? policyEkey;

  return useQuery<
    ApiResponse<ClaimShareRecipientResponse[], ClaimShareFilters>,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: [
      ...CLAIM_SHARE_RECIPIENTS_QUERY_KEY,
      partnerId,
      lob,
      resolvedPolicyId,
      policyNumber,
      productIds,
    ],
    queryFn: () =>
      fetchClaimShareRecipients({
        policyId: resolvedPolicyId,
        policyNumber,
        partnerId,
        lob,
        productIds,
      }),
    enabled:
      isReady && (Boolean(resolvedPolicyId) || Boolean(policyNumber)) && productIds.length > 0,
  });
};

export const useClaimShareTriggerMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation<
    ApiResponse<ClaimShareTriggerResponse, ClaimShareFilters>,
    AxiosError<ApiErrorResponse>,
    ClaimShareTriggerPayload
  >({
    mutationKey: [...CLAIM_SHARE_TRIGGER_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ claimNumber, emails, whatsappNumbers, smsNumbers }: ClaimShareTriggerPayload) =>
      claimShareTrigger({
        claimNumber,
        partnerId,
        lob,
        payload: { claimNumber, emails, whatsappNumbers, smsNumbers },
        productIds,
      }),
    onSuccess: () => {
      toast.success('Claim share request sent successfully');
    },
    onError: () => {
      toast.error('Failed to send claim share request');
    },
  });
};

type ClaimStatusTimelineQueryParams = {
  claimNumber: string;
  enabled?: boolean;
};

export const useClaimStatusTimelineQuery = ({
  claimNumber,
  enabled = true,
}: ClaimStatusTimelineQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<ApiResponse<ClaimTrackingData, null>, AxiosError<ApiErrorResponse>>({
    queryKey: [...CLAIM_STATUS_TIMELINE_QUERY_KEY, partnerId, lob, productIds, claimNumber],
    queryFn: () => fetchClaimTracking({ partnerId, lob, productIds, claimNumber }),
    enabled: enabled && isReady && Boolean(claimNumber) && productIds.length > 0,
  });
};

type UploadedDocumentsQueryParams = {
  claimNumber: string;
  enabled?: boolean;
};

export const useFetchUploadedDocumentsQuery = ({
  claimNumber,
  enabled = true,
}: UploadedDocumentsQueryParams) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<ApiResponse<DocumentsData, DocumentsFilters>, AxiosError<ApiErrorResponse>>({
    queryKey: [...UPLOADED_DOCUMENTS_QUERY_KEY, partnerId, lob, productIds, claimNumber],
    queryFn: () => fetchUploadedDocuments({ partnerId, lob, productIds, claimNumber }),
    enabled: enabled && isReady && Boolean(claimNumber) && productIds.length > 0,
  });
};

type UploadClaimDocumentsMutationPayload = {
  claimNumber: string;
  documentType: string;
  machineInstanceId: string;
  taskId: string;
  file: File;
  onUploadProgress?: (progress: number) => void;
};

export const useUploadClaimDocumentsMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation({
    mutationKey: [...UPLOAD_DOCUMENTS_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({
      claimNumber,
      documentType,
      machineInstanceId,
      taskId,
      file,
      onUploadProgress,
    }: UploadClaimDocumentsMutationPayload) =>
      uploadClaimDocuments({
        partnerId,
        lob,
        productIds,
        claimNumber,
        documentType,
        machineInstanceId,
        taskId,
        file,
        onUploadProgress: (event) => {
          if (!event.total || !onUploadProgress) return;
          const progress = Math.min(
            100,
            Math.max(0, Math.round((event.loaded * 100) / event.total)),
          );
          onUploadProgress(progress);
        },
      }),
  });
};

type SubmitUploadedDocumentsMutationPayload = {
  claimNumber: string;
  notes: DocumentNotes[];
};

type DocumentNotes = {
  document_id: string;
  page_id: string;
  note_text: string;
};

export const useSubmitUploadedDocumentsMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation({
    mutationKey: [...SUBMIT_UPLOADED_DOCUMENTS_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ claimNumber, notes }: SubmitUploadedDocumentsMutationPayload) =>
      submitUploadedDocuments({
        partnerId,
        lob,
        productIds,
        claimNumber,
        notes,
      }),
  });
};

type DeleteUploadedDocumentMutationPayload = {
  claimNumber: string;
  machineInstanceId: string;
  taskId: string;
  pageId: string;
};

export const useDeleteUploadedDocumentMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation({
    mutationKey: [...DELETE_UPLOADED_DOCUMENTS_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({
      claimNumber,
      machineInstanceId,
      taskId,
      pageId,
    }: DeleteUploadedDocumentMutationPayload) =>
      deleteUploadedDocument({
        partnerId,
        lob,
        productIds,
        claimNumber,
        machineInstanceId,
        taskId,
        pageId,
      }),
  });
};
