import { apiClient } from '@/lib/services/axios-client/apiClient';
import { serializeParams } from '@/lib/utils';
import { ApiResponse } from '@/lib/types/Global';
import type { ReportsEmbedUrl, ReportsFilters } from '@/lib/types/reports';

type FetchReportsEmbedUrlParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  dashboardKey: string;
};

export const fetchReportsEmbedUrl = async ({
  partnerId,
  lob,
  productIds,
  dashboardKey,
}: FetchReportsEmbedUrlParams): Promise<ApiResponse<ReportsEmbedUrl, ReportsFilters>> => {
  return await apiClient
    .get(`/lob/${lob}/partner/${partnerId}/metabase/dashboards/${dashboardKey}/embed-url`, {
      params: { productIds },
      paramsSerializer: serializeParams,
    })
    .then((res) => res.data);
};
