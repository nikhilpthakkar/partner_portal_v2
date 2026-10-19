import type { ApiResponse } from '@/lib/types/Global';
import type {
  BulkActionListApiResponse,
  BulkActionStatusSummaryData,
  BulkActionStatusSummaryFilters,
  BulkActionUploadedByResponse,
} from '@/lib/types/policy-bulk-operations';
import type {
  PolicySearchFieldCapability,
  PolicySearchFilters,
  RecentSearchFilters,
  RecentSearchResponse,
} from '@/lib/types/policy-management';
import type { PolicyBulkUploadEndorsementTypeApplicableResponse } from '@/lib/types/policy-management/policyBulkUploadEndorsementApi';
import axios from 'axios';
import { mapPolicySearchCapabilities } from '@/lib/adapter/policy-management/policySearchCapabilities.adapter';
import { apiClient } from '@/lib/services/axios-client/apiClient';
import { serializeParams } from '@/lib/utils';

type FetchRecentSearchParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
};

type FetchPolicySearchParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  searchField: string;
  searchValue: string;
  page: number;
  size: number;
};

type FetchPolicySearchCapabilitiesParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
};

type FetchBulkActionStatusSummaryParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  from: string;
  to: string;
  plan?: string[];
  uploadedBy?: string[];
};

type FetchBulkActionListParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  page: number;
  size: number;
  from: string;
  to: string;
  plan?: string[];
  uploadedBy?: string[];
  /** Omit for “all uploads” tab. */
  status?: string;
  /** URL segment after `bulkAction/`, e.g. `issuance`. */
  actionPathSegment?: string;
};

type FetchBulkActionUploadedByParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  startDate: string;
  endDate: string;
  planIds: string[];
};

type FetchBulkUploadEndorsementTypeApplicableParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  plan: string;
};

type ExportCancellationReportParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  fromDate: string;
  toDate: string;
};

type FetchBulkUploadTemplateParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  type: string;
  category: string;
};

type BulkUploadTemplateResponse = {
  data: Blob;
  fileName: string;
};

type CancellationReportExportResponse = {
  data: Blob;
  fileName: string;
};

type FetchBulkUploadPresignedUrlParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  planId: string;
  action: string;
  contentType: string;
  filename: string;
  contentLength: string;
};

type BulkUploadPresignedUrlResponse = {
  file_id: number;
  url: string;
  error: string | null;
  fields: Record<string, string>;
  key_name: string | null;
};

type ConfirmBulkUploadParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  planId: string;
  fileId: string;
  action: string;
  status: string;
};

const BULK_UPLOAD_TEMPLATE_FALLBACK_FILE_NAME = 'bulk-upload-template';
const CANCELLATION_REPORT_FALLBACK_FILE_NAME = 'cancellation-report.csv';

const extractDownloadFileName = (
  contentDispositionHeader: string | null | undefined,
  fallbackFileName: string,
): string => {
  if (!contentDispositionHeader) {
    return fallbackFileName;
  }

  const utf8Match = contentDispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = contentDispositionHeader.match(/filename="?([^"]+)"?/i);
  if (filenameMatch?.[1]) {
    return filenameMatch[1];
  }

  return fallbackFileName;
};

const extractTemplateFileName = (contentDispositionHeader: string | null | undefined): string =>
  extractDownloadFileName(contentDispositionHeader, BULK_UPLOAD_TEMPLATE_FALLBACK_FILE_NAME);

export const fetchPolicySearchCapabilities = async ({
  partnerId,
  lob,
  productIds,
}: FetchPolicySearchCapabilitiesParams): Promise<PolicySearchFieldCapability[]> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policies/search-capabilities`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => mapPolicySearchCapabilities(res.data));
};

export const fetchRecentSearchPolicies = async ({
  partnerId,
  lob,
  productIds,
}: FetchRecentSearchParams): Promise<ApiResponse<RecentSearchResponse, RecentSearchFilters>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policies/recent-search`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchPolicySearchPolicies = async ({
  partnerId,
  lob,
  productIds,
  searchField,
  searchValue,
  page,
  size,
}: FetchPolicySearchParams): Promise<ApiResponse<RecentSearchResponse, PolicySearchFilters>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/policies`, {
      params: { productIds, searchField, searchValue, page, size },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchBulkActionStatusSummary = async ({
  partnerId,
  lob,
  productIds,
  from,
  to,
  plan,
  uploadedBy,
}: FetchBulkActionStatusSummaryParams): Promise<
  ApiResponse<BulkActionStatusSummaryData, BulkActionStatusSummaryFilters>
> => {
  const params: Record<string, unknown> = { productIds, from, to };
  if (plan !== undefined && plan.length > 0) {
    params.plan = plan.join(',');
  }
  if (uploadedBy !== undefined && uploadedBy.length > 0) {
    params.uploadedBy = uploadedBy.join(',');
  }
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/bulkAction/status-summary`, {
      params,
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchBulkActionList = async ({
  partnerId,
  lob,
  productIds,
  page,
  size,
  from,
  to,
  plan,
  uploadedBy,
  status,
}: FetchBulkActionListParams): Promise<BulkActionListApiResponse> => {
  const params: Record<string, unknown> = {
    productIds,
    page,
    size,
    from,
    to,
  };
  if (plan !== undefined && plan.length > 0) {
    params.plan = plan.join(',');
  }
  if (uploadedBy !== undefined && uploadedBy.length > 0) {
    params.uploadedBy = uploadedBy.join(',');
  }
  if (status !== undefined && status !== '') {
    params.status = status;
  }
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/bulkAction/bulk-history`, {
      params,
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchBulkActionUploadedBy = async ({
  partnerId,
  lob,
  productIds,
  startDate,
  endDate,
  planIds,
}: FetchBulkActionUploadedByParams): Promise<BulkActionUploadedByResponse> => {
  return await apiClient
    .post(
      `/lob/${lob}/partner/${partnerId}/bulkAction/uploaded-by`,
      {
        start_date: startDate,
        end_date: endDate,
        lob,
        plan_ids: planIds,
      },
      {
        params: { productIds },
        paramsSerializer: serializeParams,
      },
    )
    .then((res) => res.data);
};

export const fetchBulkUploadEndorsementTypeApplicable = async ({
  partnerId,
  lob,
  productIds,
  plan,
}: FetchBulkUploadEndorsementTypeApplicableParams): Promise<PolicyBulkUploadEndorsementTypeApplicableResponse> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/plan/${plan}/endorsementTypeApplicable`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchBulkUploadTemplate = async ({
  partnerId,
  lob,
  productIds,
  type,
  category,
}: FetchBulkUploadTemplateParams): Promise<BulkUploadTemplateResponse> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/bulk-operations/${category}/template`, {
      params: { type, productIds },
      paramsSerializer: serializeParams,
      responseType: 'blob',
    })
    .then((res) => ({
      data: res.data,
      fileName: extractTemplateFileName(res.headers['content-disposition']),
    }));
};

export const exportCancellationReport = async ({
  partnerId,
  lob,
  productIds,
  fromDate,
  toDate,
}: ExportCancellationReportParams): Promise<CancellationReportExportResponse> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/cancellation-report/export`, {
      params: { productIds, fromDate, toDate },
      paramsSerializer: serializeParams,
      responseType: 'blob',
    })
    .then((res) => ({
      data: res.data,
      fileName: extractDownloadFileName(
        res.headers['content-disposition'],
        CANCELLATION_REPORT_FALLBACK_FILE_NAME,
      ),
    }));
};

export const fetchBulkUploadPresignedUrl = async ({
  partnerId,
  lob,
  productIds,
  planId,
  action,
  contentType,
  filename,
  contentLength,
}: FetchBulkUploadPresignedUrlParams): Promise<BulkUploadPresignedUrlResponse> => {
  return await apiClient
    .post(
      `/lob/${lob}/partner/${partnerId}/bulkAction/upload/presignedUrl/${planId}`,
      {
        action,
        content_type: contentType,
        filename,
        content_length: contentLength,
      },
      {
        params: { productIds },
        paramsSerializer: serializeParams,
      },
    )
    .then((res) => res.data);
};

export const uploadBulkFileToPresignedUrl = async ({
  url,
  file,
  contentType,
}: {
  url: string;
  file: File;
  contentType: string;
}) => {
  await axios.put(url, file, {
    headers: {
      'Content-Type': contentType,
    },
  });
};

export const confirmBulkUpload = async ({
  partnerId,
  lob,
  productIds,
  planId,
  fileId,
  action,
  status,
}: ConfirmBulkUploadParams) => {
  return await apiClient
    .post(
      `/lob/${lob}/partner/${partnerId}/bulkAction/upload/${planId}`,
      {
        file_id: fileId,
        action,
        status,
      },
      {
        params: { productIds },
        paramsSerializer: serializeParams,
      },
    )
    .then((res) => res.data);
};
