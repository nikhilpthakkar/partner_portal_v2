import { OverviewComponentType } from '@/lib/constants/overviewComponents.constants';
import type { DataSource } from '@/lib/constants/global.constants';
import type { Currency } from '@/lib/types/overview';
import type { GroupBy } from '@/lib/types/overview';
import type {
  AvgPremiumFilters,
  AvgPremiumTrend,
  AvgSiFilters,
  AvgSiTrend,
  ClaimFilters,
  ClaimsTrend,
  GeoDistributionFilters,
  GeoDistributionPolicies,
  GwpFilters,
  GwpTrend,
  PoliciesByTenureDistribution,
  TenureDistributionFilters,
} from '@/lib/types/overview/graphs';
import type { PartnerOverviewChartAdditionalData } from '@/lib/types/overview/config';

export type ChartPaginationMeta = {
  currentPage?: number;
  pageSize?: number;
  hasPrev?: boolean;
  hasNext?: boolean;
  totalRecords?: number;
  totalPages?: number;
};

export type OverviewComponentStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ERROR';

export type OverviewComponentMeta = {
  lob: string;
  partnerId: string;
  productIds: string[];
  fromDate?: string;
  toDate?: string;
  timezone?: string;
  timestamp?: string;
  traceId?: string;
  groupBy?: GroupBy;
};

export type KpiComponentPayload = {
  type: 'kpi';
  status: OverviewComponentStatus;
  value: number;
  currency?: Currency;
  unit?: 'percentage';
  breakdown?: Record<string, number>;
};

export type GwpPolicyCountTrendChartPayload = {
  type: 'chart';
  data: GwpTrend;
  meta: {
    filters: GwpFilters;
    timestamp: string;
    traceId: string;
  };
};

export type ClaimsTrendByStatusChartPayload = {
  type: 'chart';
  data: ClaimsTrend;
  meta: {
    filters: ClaimFilters;
    pagination?: ChartPaginationMeta;
    timestamp: string;
    traceId: string;
    errors?: unknown[];
  };
};

export type AvgPremiumTrendChartPayload = {
  type: 'chart';
  data: AvgPremiumTrend;
  meta: {
    filters: AvgPremiumFilters;
    timestamp: string;
    traceId: string;
  };
};

export type AvgSiTrendChartPayload = {
  type: 'chart';
  data: AvgSiTrend;
  meta: {
    filters: AvgSiFilters;
    timestamp: string;
    traceId: string;
  };
};

export type GeoDistributionPoliciesChartPayload = {
  type: 'chart';
  data: GeoDistributionPolicies;
  meta: {
    filters: GeoDistributionFilters;
    timestamp: string;
    traceId: string;
  };
};

export type PoliciesByTenureDistributionChartPayload = {
  type: 'chart';
  data: PoliciesByTenureDistribution;
  meta: {
    filters: TenureDistributionFilters;
    timestamp: string;
    traceId: string;
  };
};

export type ChartComponentPayload =
  | GwpPolicyCountTrendChartPayload
  | ClaimsTrendByStatusChartPayload
  | AvgPremiumTrendChartPayload
  | AvgSiTrendChartPayload
  | GeoDistributionPoliciesChartPayload
  | PoliciesByTenureDistributionChartPayload;

export type CardComponentPayload = {
  type: 'card';
  status: OverviewComponentStatus;
  [key: string]: unknown;
};

export type OverviewComponentPayloadByType = {
  [OverviewComponentType.KPI]: KpiComponentPayload;
  [OverviewComponentType.CHART]: ChartComponentPayload;
  [OverviewComponentType.CARD]: CardComponentPayload;
};

export type OverviewComponentResponse<TPayload> = {
  componentId: string;
  componentType: Lowercase<OverviewComponentType>;
  label: string;
  meta?: OverviewComponentMeta;
  payload: TPayload;
};

export type OverviewKpiComponentResponse = OverviewComponentResponse<KpiComponentPayload>;
export type OverviewGwpChartComponentResponse =
  OverviewComponentResponse<GwpPolicyCountTrendChartPayload>;
export type OverviewClaimsChartComponentResponse =
  OverviewComponentResponse<ClaimsTrendByStatusChartPayload>;
export type OverviewAvgPremiumChartComponentResponse =
  OverviewComponentResponse<AvgPremiumTrendChartPayload>;
export type OverviewAvgSiTrendChartComponentResponse =
  OverviewComponentResponse<AvgSiTrendChartPayload>;
export type OverviewGeoDistributionChartComponentResponse =
  OverviewComponentResponse<GeoDistributionPoliciesChartPayload>;
export type OverviewTenureDistributionChartComponentResponse =
  OverviewComponentResponse<PoliciesByTenureDistributionChartPayload>;

export type OverviewComponentRequestBody = {
  fromDate?: string;
  toDate?: string;
  groupBy?: GroupBy;
  timezone?: string;
  coverIds?: string[];
  page?: number;
  size?: number;
  additional_data?: PartnerOverviewChartAdditionalData;
  geoView?: string;
  claimStatus?: string;
  topN?: number;
  states?: string[];
  zones?: string[];
};

export type FetchOverviewComponentParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  componentType: OverviewComponentType;
  componentId: string;
  source: DataSource;
  body?: OverviewComponentRequestBody;
};
