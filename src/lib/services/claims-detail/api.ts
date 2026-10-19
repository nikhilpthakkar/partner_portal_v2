import { apiClient } from '../axios-client/apiClient';
import type { AxiosProgressEvent } from 'axios';
import { ApiResponse } from '@/lib/types/Global';
import { serializeParams } from '@/lib/utils';
import {
  ClaimsDetailFilters,
  ClaimsDetailResponse,
  ClaimStatusCountData,
} from '@/lib/types/claims-management/claimsDetailApi';
import type {
  ClaimsCommunicationFilters,
  ClaimsCommunicationResponse,
} from '@/lib/types/claims-management/claimsCommunicationApi';
import type {
  ClaimShareFilters,
  ClaimShareRecipientResponse,
  ClaimShareTriggerPayload,
  ClaimShareTriggerResponse,
} from '@/lib/types/claims-management/claimShareApi';
import {
  DocumentsData,
  DocumentsFilters,
  UploadDocumentsData,
} from '@/lib/types/claims-management/uploadedDocumentApi';
import { ClaimTrackingData } from '@/lib/types/claims-management/statusTimelineApi';

export type FetchClaimDetailsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  policyNumber?: string;
  statusGroups?: string[];
  phoneNumber?: string;
  claimNumbers?: string;
  coverIds?: string[];
  fromDate?: string;
  toDate?: string;
  page: number;
  size: number;
};

export type FetchCachedClaimDetailsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  claimNumber: string;
};

export type FetchClaimCommunicationsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  claimNumber: string;
  page: number;
  pageSize: number;
};

export type FetchClaimStatusCountParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  statusGroups: string[];
  coverIds?: string[];
  fromDate?: string;
  toDate?: string;
};

type FetchClaimShareRecipientsParams = {
  policyId?: string;
  policyNumber?: string;
  partnerId: string;
  lob: string;
  productIds: string[];
};

type ClaimShareTriggerParams = {
  claimNumber: string;
  partnerId: string;
  lob: string;
  payload: ClaimShareTriggerPayload;
  productIds: string[];
};

export const fetchClaimDetails = async ({
  partnerId,
  lob,
  productIds,
  policyNumber,
  statusGroups,
  phoneNumber,
  claimNumbers,
  coverIds,
  fromDate,
  toDate,
  page,
  size,
}: FetchClaimDetailsParams): Promise<ApiResponse<ClaimsDetailResponse, ClaimsDetailFilters>> => {
  const params: Record<string, any> = {
    page,
    size,
  };

  const hasDirectSearch = policyNumber?.trim() || claimNumbers?.trim() || phoneNumber?.trim();

  if (productIds?.length) params.productIds = productIds;
  if (policyNumber?.trim()) params.policyNumber = policyNumber;
  if (statusGroups?.length) params.statusGroups = statusGroups;
  if (phoneNumber?.trim()) params.phoneNumber = phoneNumber;
  if (claimNumbers?.trim()) params.claimNumbers = claimNumbers;
  if (coverIds && coverIds.length > 0) params.coverIds = coverIds.join(',');
  if (!hasDirectSearch && fromDate) params.fromDate = fromDate;
  if (!hasDirectSearch && toDate) params.toDate = toDate;

  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims`, {
      params,
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchMinimalClaimDetails = async ({
  partnerId,
  lob,
  productIds,
  policyNumber,
  statusGroups,
  phoneNumber,
  claimNumbers,
  coverIds,
  fromDate,
  toDate,
  page,
  size,
}: FetchClaimDetailsParams): Promise<ApiResponse<ClaimsDetailResponse, ClaimsDetailFilters>> => {
  const params: Record<string, any> = {
    page,
    size,
  };

  if (productIds?.length) params.productIds = productIds;
  if (policyNumber?.trim()) params.policyNumber = policyNumber;
  if (statusGroups?.length) params.statusGroups = statusGroups;
  if (phoneNumber?.trim()) params.phoneNumber = phoneNumber;
  if (claimNumbers?.trim()) params.claimNumbers = claimNumbers;
  if (coverIds && coverIds.length > 0) params.coverIds = coverIds.join(',');
  if (!claimNumbers?.trim() && fromDate) params.fromDate = fromDate;
  if (!claimNumbers?.trim() && toDate) params.toDate = toDate;

  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims/minimal`, {
      params,
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchCachedClaimDetails = async ({
  partnerId,
  lob,
  productIds,
  claimNumber,
}: FetchCachedClaimDetailsParams): Promise<
  ApiResponse<ClaimsDetailResponse, ClaimsDetailFilters>
> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims/${claimNumber}`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchClaimStatusCount = async ({
  partnerId,
  lob,
  productIds,
  statusGroups,
  coverIds,
  fromDate,
  toDate,
}: FetchClaimStatusCountParams): Promise<ApiResponse<ClaimStatusCountData, null>> => {
  const params: Record<string, string | string[]> = {
    productIds,
    statusGroups,
  };

  if (coverIds && coverIds.length > 0) {
    params.coverIds = coverIds.join(',');
  }
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims/status-count`, {
      params,
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

type FetchRecentClaimsSearchesParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  coverIds?: string[];
};

export const fetchRecentClaimsSearches = async ({
  partnerId,
  lob,
  productIds,
  coverIds,
}: FetchRecentClaimsSearchesParams): Promise<
  ApiResponse<ClaimsDetailResponse, ClaimsDetailFilters>
> => {
  const params: Record<string, string | string[]> = { productIds };

  if (coverIds && coverIds.length > 0) {
    params.coverIds = coverIds.join(',');
  }

  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims/recent-search`, {
      params,
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchClaimCommunications = async ({
  partnerId,
  lob,
  productIds,
  claimNumber,
  page,
  pageSize,
}: FetchClaimCommunicationsParams): Promise<
  ApiResponse<ClaimsCommunicationResponse, ClaimsCommunicationFilters>
> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/communications/entity/CLAIM/id/${claimNumber}`, {
      params: { productIds, page, pageSize },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchClaimShareRecipients = async ({
  policyId,
  policyNumber,
  partnerId,
  lob,
  productIds,
}: FetchClaimShareRecipientsParams): Promise<
  ApiResponse<ClaimShareRecipientResponse[], ClaimShareFilters>
> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policy/share`, {
      params: { productIds, policyId, policyNumber },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const claimShareTrigger = async ({
  claimNumber,
  partnerId,
  lob,
  payload,
  productIds,
}: ClaimShareTriggerParams): Promise<ApiResponse<ClaimShareTriggerResponse, ClaimShareFilters>> => {
  return await apiClient
    .post(`/lob/${lob}/partner/${partnerId}/claims/${claimNumber}/trigger-communication`, payload, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

type FetchUploadedDocumentsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  claimNumber: string;
};

export const fetchUploadedDocuments = async ({
  partnerId,
  lob,
  productIds,
  claimNumber,
}: FetchUploadedDocumentsParams): Promise<ApiResponse<DocumentsData, DocumentsFilters>> => {
  return await apiClient
    .get<ApiResponse<DocumentsData, DocumentsFilters>>(
      `/lob/${lob}/partner/${partnerId}/claims/${claimNumber}/documents`,
      {
        params: { productIds },
        paramsSerializer: serializeParams,
      },
    )
    .then((res) => res.data);
};

type UploadDocumentsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  claimNumber: string;
  documentType: string;
  machineInstanceId: string;
  taskId: string;
  file: File;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
};

export const uploadClaimDocuments = async ({
  partnerId,
  lob,
  productIds,
  claimNumber,
  documentType,
  machineInstanceId,
  taskId,
  file,
  onUploadProgress,
}: UploadDocumentsParams): Promise<UploadDocumentsData> => {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('machineInstanceId', machineInstanceId);
  formData.append('taskId', taskId);
  formData.append('file', file);

  return await apiClient
    .post(`/lob/${lob}/partner/${partnerId}/claims/${claimNumber}/documents/upload`, formData, {
      params: { productIds },
      paramsSerializer: serializeParams,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
    .then((res) => res.data);
};

type DeleteUploadedDocumentParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  claimNumber: string;
  machineInstanceId: string;
  taskId: string;
  pageId: string;
};

export const deleteUploadedDocument = async ({
  partnerId,
  lob,
  productIds,
  claimNumber,
  machineInstanceId,
  taskId,
  pageId,
}: DeleteUploadedDocumentParams): Promise<ApiResponse<null, null>> => {
  return await apiClient
    .delete(`/lob/${lob}/partner/${partnerId}/claims/${claimNumber}/documents`, {
      params: { productIds, machineInstanceId, taskId, pageId },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

type SubmitUploadedDocumentsParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  claimNumber: string;
  notes: DocumentNotes[];
};

type DocumentNotes = {
  document_id: string;
  note_text: string;
};

export const submitUploadedDocuments = async ({
  partnerId,
  lob,
  productIds,
  claimNumber,
  notes,
}: SubmitUploadedDocumentsParams): Promise<ApiResponse<null, null>> => {
  return await apiClient
    .post(
      `/lob/${lob}/partner/${partnerId}/claims/${claimNumber}/documents/submit`,
      { notes },
      {
        params: { productIds },
        paramsSerializer: serializeParams,
      },
    )
    .then((res) => res.data);
};

type FetchClaimTrackingParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  claimNumber: string;
};

export const fetchClaimTracking = async ({
  partnerId,
  lob,
  productIds,
  claimNumber,
}: FetchClaimTrackingParams): Promise<ApiResponse<ClaimTrackingData, null>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims/${claimNumber}/tracking`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};
