import { ApiResponse } from '@/lib/types/Global';
import { apiClient } from '@/lib/services/axios-client/apiClient';
import type { OverviewComponentType } from '@/lib/constants/overviewComponents.constants';
import type {
  FetchOverviewComponentParams,
  OverviewComponentPayloadByType,
  OverviewComponentResponse,
} from '@/lib/types/overview/components';
import { ClaimsTable, ClaimsTableFilters } from '@/lib/types/overview';
import { GroupBy } from '@/lib/types/overview';
import {
  CoveragePlanMappingPayload,
  CoveragePlanMappingMetaFilters,
} from '@/lib/types/overview/coveragePlanMapping';
import type { OverviewCardApiItem } from '@/lib/types/overview/cards';
import type {
  OverviewConfigResponse,
  UpdateOverviewConfigRequest,
  UpdatePartnerOverviewConfigurationRequest,
} from '@/lib/types/overview/config';
import { serializeParams } from '@/lib/utils';
import { sanitizeClaimsMinimalApiStatusGroups } from '@/lib/utils/overview/claimsStatusGroups.utils';

type FetchOverviewParams = {
  partnerId: string;
  lob: string;
  fromDate: string | Date;
  toDate: string | Date;
  groupBy?: GroupBy;
  productIds: string[];
  coverIds?: string[];
  page?: number;
  size?: number;
};

type RegisterCapabilityInterestPayload = {
  capability_name: string;
};

export type RegisterCapabilityInterestResponse = {
  message: string;
};

type RegisterCapabilityInterestParams = {
  partnerId: string;
  productIds: string[];
  payload: RegisterCapabilityInterestPayload;
};

type ExportClaimsParams = {
  partnerId: string;
  lob: string;
  fromDate: string | Date;
  toDate: string | Date;
  productIds: string[];
  coverIds?: string[];
  statusGroups: string[];
};

const CLAIMS_EXPORT_FALLBACK_FILE_NAME = 'claims-export';

const extractClaimsExportFileName = (
  contentDispositionHeader: string | null | undefined,
): string => {
  if (!contentDispositionHeader) {
    return CLAIMS_EXPORT_FALLBACK_FILE_NAME;
  }

  const utf8Match = contentDispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = contentDispositionHeader.match(/filename="?([^"]+)"?/i);
  if (filenameMatch?.[1]) {
    return filenameMatch[1];
  }

  return CLAIMS_EXPORT_FALLBACK_FILE_NAME;
};

const buildOverviewComponentRequestBody = ({
  fromDate,
  toDate,
  groupBy,
  timezone,
  coverIds,
  page,
  size,
  additional_data,
  geoView,
  claimStatus,
  topN,
  states,
  zones,
}: NonNullable<FetchOverviewComponentParams['body']>): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  if (fromDate) body.fromDate = fromDate;
  if (toDate) body.toDate = toDate;
  if (groupBy) body.groupBy = groupBy;
  if (timezone) body.timezone = timezone;
  if (coverIds && coverIds.length > 0) body.coverIds = coverIds;
  if (page !== undefined) body.page = page;
  if (size !== undefined) body.size = size;
  if (additional_data) body.additional_data = additional_data;
  if (geoView) body.geoView = geoView;
  if (claimStatus) body.claimStatus = claimStatus;
  if (topN !== undefined) body.topN = topN;
  if (states && states.length > 0) body.states = states;
  if (zones && zones.length > 0) body.zones = zones;

  return body;
};

export const fetchOverviewComponentData = async <TType extends OverviewComponentType>({
  partnerId,
  lob,
  productIds,
  componentType,
  componentId,
  source,
  body = {},
}: FetchOverviewComponentParams): Promise<
  OverviewComponentResponse<OverviewComponentPayloadByType[TType]>
> => {
  return await apiClient
    .post(
      `/lob/${lob}/partner/${partnerId}/overview/components/${componentType}/${componentId}/data`,
      buildOverviewComponentRequestBody(body),
      {
        params: { productIds, source },
        paramsSerializer: serializeParams,
      },
    )
    .then((res) => res.data);
};

export const fetchCoveragePlanMapping = async ({
  partnerId,
  lob,
  productIds,
}: {
  partnerId: string;
  lob: string;
  productIds: string[];
}): Promise<ApiResponse<CoveragePlanMappingPayload, CoveragePlanMappingMetaFilters>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/coverages/plan-mapping`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const fetchClaimsTable = async ({
  partnerId,
  lob,
  fromDate,
  toDate,
  productIds,
  coverIds,
  statusGroups,
  page,
  size,
}: FetchOverviewParams & {
  statusGroups: string[];
  page: number;
  size: number;
}): Promise<ApiResponse<ClaimsTable, ClaimsTableFilters>> => {
  const params: Record<string, unknown> = {
    fromDate,
    toDate,
    productIds,
    statusGroups: sanitizeClaimsMinimalApiStatusGroups(statusGroups),
    page,
    size,
  };
  if (coverIds && coverIds.length > 0) {
    params.coverIds = coverIds.join(',');
  }
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims/minimal`, {
      params,
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};

export const exportClaimsData = async ({
  partnerId,
  lob,
  fromDate,
  toDate,
  productIds,
  coverIds,
  statusGroups,
}: ExportClaimsParams): Promise<{ data: Blob; fileName: string }> => {
  const params: Record<string, unknown> = {
    fromDate,
    toDate,
    productIds,
    statusGroups: sanitizeClaimsMinimalApiStatusGroups(statusGroups),
  };
  if (coverIds && coverIds.length > 0) {
    params.coverIds = coverIds.join(',');
  }
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/claims/export`, {
      params,
      paramsSerializer: serializeParams,
      responseType: 'blob',
    })
    .then((res) => ({
      data: res.data,
      fileName: extractClaimsExportFileName(res.headers['content-disposition']),
    }));
};

export const fetchOverviewConfig = async ({
  partnerId,
  lob,
}: {
  partnerId: string;
  lob: string;
}): Promise<OverviewConfigResponse> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/overview/config`)
    .then((res) => res.data);
};

export const updateOverviewConfig = async ({
  partnerId,
  lob,
  payload,
}: {
  partnerId: string;
  lob: string;
  payload: UpdateOverviewConfigRequest;
}): Promise<OverviewConfigResponse> => {
  return await apiClient
    .put(`/lob/${lob}/partner/${partnerId}/overview/config`, payload)
    .then((res) => res.data);
};

export const updatePartnerOverviewConfiguration = async ({
  partnerId,
  payload,
}: {
  partnerId: string;
  payload: UpdatePartnerOverviewConfigurationRequest;
}): Promise<unknown> => {
  return await apiClient
    .put(`/admin/partner-overview/partners/${partnerId}/configurations`, payload)
    .then((res) => res.data);
};

export const fetchOverviewCards = async ({
  partnerId,
  lob,
}: {
  partnerId: string;
  lob: string;
}): Promise<OverviewCardApiItem[]> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/overview/cards`)
    .then((res) => res.data);
};

export const registerCapabilityInterest = async ({
  partnerId,
  productIds,
  payload,
}: RegisterCapabilityInterestParams): Promise<RegisterCapabilityInterestResponse> => {
  return await apiClient
    .post(`/partner/${partnerId}/capability-interest`, payload, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};
