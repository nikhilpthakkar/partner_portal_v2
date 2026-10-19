import { useMutation, useQueries, useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  fetchClaimsTable,
  fetchOverviewCards,
  fetchOverviewComponentData,
  exportClaimsData,
  registerCapabilityInterest,
} from '../services/overview/api';
import {
  ChartComponentId,
  OverviewComponentType,
} from '@/lib/constants/overviewComponents.constants';
import type {
  OverviewAvgPremiumChartComponentResponse,
  OverviewAvgSiTrendChartComponentResponse,
  OverviewClaimsChartComponentResponse,
  OverviewComponentRequestBody,
  OverviewComponentPayloadByType,
  OverviewComponentResponse,
  OverviewGeoDistributionChartComponentResponse,
  OverviewGwpChartComponentResponse,
  OverviewKpiComponentResponse,
  OverviewTenureDistributionChartComponentResponse,
} from '@/lib/types/overview/components';
import type { GroupBy } from '@/lib/types/overview';
import {
  DEFAULT_OVERVIEW_MONTHLY_DATE_RANGE,
  formatOverviewDate,
  useOverviewStore,
} from '@/lib/store/overview.store';
import { orderResponsesByComponentIds, parseTenureDistributionSettingsFromOverviewConfig, buildTenureDistributionAdditionalData } from '@/lib/utils/overview/overviewConfig.utils';
import { useOverviewConfigQuery } from '@/lib/query/overview/overviewConfig.queries';
import type { TenureDistributionDurationUnit } from '@/lib/types/overview/tenureDistribution';
import { DEFAULT_CHART_GROUP_BY, DEFAULT_OVERVIEW_TIMEZONE } from '../constants/overview.constants';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { useOverviewCoverFetchReady } from '@/lib/hooks/overview/useOverviewCoverFetchReady';
import { useDataSource } from '@/lib/hooks/useDataSourceUrlState';
import { usePartnerStore } from '../store/partner.store';
import { toast } from 'sonner';
import { INTEREST_REGISTERATION_MSG } from '../constants/overview.constants';

export const OVERVIEW_COMPONENT_QUERY_KEY = ['overview-component'];
export const METRICS_QUERY_KEY = ['key-metrics-kpis'];

type OverviewComponentQueryKeyParams = {
  partnerId: string;
  lob: string;
  productIds: string[];
  componentType: OverviewComponentType;
  componentId: string;
  fromDate?: string;
  toDate?: string;
  groupBy?: GroupBy;
  coverIds?: string[];
  page?: number;
  size?: number;
  timezone?: string;
  geoView?: string;
  claimStatus?: string;
  topN?: number;
  states?: string[];
  zones?: string[];
  additionalData?: string;
  source?: string;
};

export const buildOverviewComponentQueryKey = ({
  partnerId,
  lob,
  productIds,
  componentType,
  componentId,
  fromDate,
  toDate,
  groupBy,
  coverIds,
  page,
  size,
  timezone,
  geoView,
  claimStatus,
  topN,
  states,
  zones,
  additionalData,
  source,
}: OverviewComponentQueryKeyParams) => [
  ...OVERVIEW_COMPONENT_QUERY_KEY,
  componentType,
  componentId,
  partnerId,
  lob,
  productIds,
  fromDate,
  toDate,
  groupBy,
  coverIds,
  page,
  size,
  timezone,
  geoView,
  claimStatus,
  topN,
  states,
  zones,
  additionalData,
  source,
];

export const useOverviewComponentQuery = <
  TType extends OverviewComponentType,
  TPayload = OverviewComponentPayloadByType[TType],
>({
  componentType,
  componentId,
  body,
  enabled = true,
}: {
  componentType: TType;
  componentId: string;
  body?: OverviewComponentRequestBody;
  enabled?: boolean;
}): UseQueryResult<OverviewComponentResponse<TPayload>> => {
  const { partnerId, lob, productIds, dataSource, isReady } = useOverviewQueryParams();
  const requestBody = body ?? {};

  return useQuery({
    queryKey: buildOverviewComponentQueryKey({
      partnerId,
      lob,
      productIds,
      componentType,
      componentId,
      fromDate: requestBody.fromDate,
      toDate: requestBody.toDate,
      groupBy: requestBody.groupBy,
      coverIds: requestBody.coverIds,
      page: requestBody.page,
      size: requestBody.size,
      timezone: requestBody.timezone,
      geoView: requestBody.geoView,
      claimStatus: requestBody.claimStatus,
      topN: requestBody.topN,
      states: requestBody.states,
      zones: requestBody.zones,
      additionalData: requestBody.additional_data
        ? JSON.stringify(requestBody.additional_data)
        : undefined,
      source: dataSource,
    }),
    queryFn: () =>
      fetchOverviewComponentData<TType>({
        partnerId,
        lob,
        productIds,
        componentType,
        componentId,
        source: dataSource,
        body: requestBody,
      }) as Promise<OverviewComponentResponse<TPayload>>,
    enabled: enabled && isReady && productIds.length > 0,
  });
};

const useOverviewQueryParams = () => {
  const monthlyDateRange = DEFAULT_OVERVIEW_MONTHLY_DATE_RANGE;
  const { dateRange, claimsTableDateRange, statusGroups, page, pageSize, groupBy, coverIds } =
    useOverviewStore();
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const dataSource = useDataSource();

  const monthStart = monthlyDateRange.from ? formatOverviewDate(monthlyDateRange.from) : '';
  const monthEnd = monthlyDateRange.to ? formatOverviewDate(monthlyDateRange.to) : '';

  const fromDate = dateRange.from ? formatOverviewDate(dateRange.from) : '';
  const toDate = dateRange.to ? formatOverviewDate(dateRange.to) : '';

  const fromDateClaimsTable = claimsTableDateRange.from
    ? formatOverviewDate(claimsTableDateRange.from)
    : '';
  const toDateClaimsTable = claimsTableDateRange.to
    ? formatOverviewDate(claimsTableDateRange.to)
    : '';

  return {
    partnerId,
    lob,
    monthStart,
    monthEnd,
    fromDate,
    toDate,
    fromDateClaimsTable,
    toDateClaimsTable,
    productIds,
    dataSource,
    groupBy,
    statusGroups,
    coverIds,
    page,
    size: pageSize,
    isReady,
  };
};

export const useKeyMetricsKpisQuery = (kpiIds: string[], configReady = true) => {
  const { partnerId, lob, monthStart, monthEnd, productIds, dataSource, isReady } =
    useOverviewQueryParams();
  const canFetch = configReady && isReady && productIds.length > 0 && kpiIds.length > 0;

  const queries = useQueries({
    queries: kpiIds.map((componentId) => ({
      queryKey: buildOverviewComponentQueryKey({
        partnerId,
        lob,
        productIds,
        componentType: OverviewComponentType.KPI,
        componentId,
        fromDate: monthStart,
        toDate: monthEnd,
        source: dataSource,
      }),
      queryFn: () =>
        fetchOverviewComponentData<OverviewComponentType.KPI>({
          partnerId,
          lob,
          productIds,
          componentType: OverviewComponentType.KPI,
          componentId,
          source: dataSource,
          body: {
            fromDate: monthStart,
            toDate: monthEnd,
          },
        }),
      enabled: canFetch,
    })),
  });

  const isLoading = canFetch && queries.some((query) => query.isLoading);
  const isError = canFetch && queries.some((query) => query.isError);
  const isFetching = canFetch && queries.some((query) => query.isFetching);
  const data =
    canFetch && queries.length > 0 && queries.every((query) => query.isSuccess)
      ? orderResponsesByComponentIds(
          queries.map((query) => query.data).filter(Boolean) as OverviewKpiComponentResponse[],
          kpiIds,
        )
      : undefined;

  return { data, isLoading, isError, isFetching, queries };
};

/** @deprecated Use useKeyMetricsKpisQuery — key metrics are fetched per KPI component. */
export const useMetricsQuery = () => {
  const { data, isLoading, isError, isFetching } = useKeyMetricsKpisQuery([], false);
  return { data, isLoading, isError, isFetching };
};

export const useGwpTrendQuery = (
  enabled = true,
  groupBy: GroupBy = DEFAULT_CHART_GROUP_BY,
): UseQueryResult<OverviewGwpChartComponentResponse> => {
  const { fromDate, toDate } = useOverviewQueryParams();

  return useOverviewComponentQuery<
    OverviewComponentType.CHART,
    OverviewGwpChartComponentResponse['payload']
  >({
    componentType: OverviewComponentType.CHART,
    componentId: ChartComponentId.GWP_POLICY_COUNT_TREND,
    body: { fromDate, toDate, groupBy, timezone: DEFAULT_OVERVIEW_TIMEZONE },
    enabled,
  });
};

export const useAvgPremiumTrendQuery = (
  enabled = true,
  groupBy: GroupBy = DEFAULT_CHART_GROUP_BY,
): UseQueryResult<OverviewAvgPremiumChartComponentResponse> => {
  const { fromDate, toDate } = useOverviewQueryParams();

  return useOverviewComponentQuery<
    OverviewComponentType.CHART,
    OverviewAvgPremiumChartComponentResponse['payload']
  >({
    componentType: OverviewComponentType.CHART,
    componentId: ChartComponentId.AVG_PREMIUM_TREND,
    body: { fromDate, toDate, groupBy, timezone: DEFAULT_OVERVIEW_TIMEZONE },
    enabled,
  });
};

export const useAvgSiTrendQuery = (
  enabled = true,
  groupBy: GroupBy = DEFAULT_CHART_GROUP_BY,
): UseQueryResult<OverviewAvgSiTrendChartComponentResponse> => {
  const { fromDate, toDate } = useOverviewQueryParams();

  return useOverviewComponentQuery<
    OverviewComponentType.CHART,
    OverviewAvgSiTrendChartComponentResponse['payload']
  >({
    componentType: OverviewComponentType.CHART,
    componentId: ChartComponentId.AVERAGE_SI_TREND,
    body: { fromDate, toDate, groupBy, timezone: DEFAULT_OVERVIEW_TIMEZONE },
    enabled,
  });
};

type GeoDistributionQueryFilters = {
  geoView?: string;
  claimStatus?: string;
  topN?: number;
  states?: string[];
  zones?: string[];
  groupBy?: GroupBy;
};

export const useGeoDistributionQuery = (
  componentId: ChartComponentId.GEO_DISTRIBUTION_POLICIES | ChartComponentId.GEO_DISTRIBUTION_CLAIMS,
  filters: GeoDistributionQueryFilters,
  enabled = true,
): UseQueryResult<OverviewGeoDistributionChartComponentResponse> => {
  const { fromDate, toDate } = useOverviewQueryParams();
  const groupBy = filters.groupBy ?? DEFAULT_CHART_GROUP_BY;

  return useOverviewComponentQuery<
    OverviewComponentType.CHART,
    OverviewGeoDistributionChartComponentResponse['payload']
  >({
    componentType: OverviewComponentType.CHART,
    componentId,
    body: {
      fromDate,
      toDate,
      groupBy,
      timezone: DEFAULT_OVERVIEW_TIMEZONE,
      geoView: filters.geoView,
      claimStatus: filters.claimStatus,
      topN: filters.topN,
      states: filters.states,
      zones: filters.zones,
    },
    enabled,
  });
};

type TenureDistributionQueryResult = UseQueryResult<OverviewTenureDistributionChartComponentResponse> & {
  durationUnit: TenureDistributionDurationUnit;
};

export const useTenureDistributionQuery = (
  enabled = true,
  groupBy: GroupBy = DEFAULT_CHART_GROUP_BY,
): TenureDistributionQueryResult => {
  const { fromDate, toDate } = useOverviewQueryParams();
  const { data: overviewConfig } = useOverviewConfigQuery();
  const tenureSettings = parseTenureDistributionSettingsFromOverviewConfig(overviewConfig);
  const additional_data = buildTenureDistributionAdditionalData(tenureSettings);

  const query = useOverviewComponentQuery<
    OverviewComponentType.CHART,
    OverviewTenureDistributionChartComponentResponse['payload']
  >({
    componentType: OverviewComponentType.CHART,
    componentId: ChartComponentId.POLICIES_BY_TENURE_DISTRIBUTION,
    body: {
      fromDate,
      toDate,
      groupBy,
      timezone: DEFAULT_OVERVIEW_TIMEZONE,
      additional_data,
    },
    enabled,
  });

  return {
    ...query,
    durationUnit: tenureSettings.duration_unit,
  };
};

export {
  useOverviewConfigQuery,
  OVERVIEW_CONFIG_QUERY_KEY,
} from '@/lib/query/overview/overviewConfig.queries';
export { useUpdateOverviewConfigMutation } from '@/lib/query/overview/overviewConfig.mutations';
export { useCoveragePlanMappingQuery, COVERAGE_PLAN_MAPPING_QUERY_KEY } from '@/lib/query/overview/coveragePlanMapping.queries';

export const OVERVIEW_CARDS_QUERY_KEY = ['overview-cards'];

export const useOverviewCardsQuery = (enabled = true) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();

  return useQuery({
    queryKey: [...OVERVIEW_CARDS_QUERY_KEY, partnerId, lob],
    queryFn: () => fetchOverviewCards({ partnerId, lob }),
    enabled: enabled && isReady && Boolean(partnerId) && Boolean(lob),
  });
};

export const useClaimsTrendQuery = (
  page: number,
  size: number,
  enabled = true,
  groupBy: GroupBy = DEFAULT_CHART_GROUP_BY,
): UseQueryResult<OverviewClaimsChartComponentResponse> => {
  const { fromDate, toDate, coverIds } = useOverviewQueryParams();
  const canFetch = useOverviewCoverFetchReady(enabled);

  return useOverviewComponentQuery<
    OverviewComponentType.CHART,
    OverviewClaimsChartComponentResponse['payload']
  >({
    componentType: OverviewComponentType.CHART,
    componentId: ChartComponentId.CLAIMS_TREND_BY_STATUS,
    body: {
      fromDate,
      toDate,
      groupBy,
      coverIds: coverIds.length > 0 ? coverIds : undefined,
      page,
      size,
    },
    enabled: enabled && canFetch,
  });
};

export const CLAIMS_TABLE_QUERY_KEY = ['claims-table'];

export const useClaimsTableQuery = (enabled = true) => {
  const {
    partnerId,
    lob,
    fromDateClaimsTable: fromDate,
    toDateClaimsTable: toDate,
    productIds,
    coverIds,
    statusGroups,
    page,
    size,
    isReady,
  } = useOverviewQueryParams();

  return useQuery({
    queryKey: [
      ...CLAIMS_TABLE_QUERY_KEY,
      partnerId,
      lob,
      fromDate,
      toDate,
      productIds,
      coverIds,
      statusGroups,
      page,
      size,
    ],
    queryFn: () =>
      fetchClaimsTable({
        partnerId,
        lob,
        fromDate,
        toDate,
        productIds,
        coverIds: coverIds.length > 0 ? coverIds : undefined,
        statusGroups,
        page,
        size,
      }),
    enabled: enabled && isReady && productIds.length > 0,
  });
};

export const useRegisterCapabilityInterestMutation = () => {
  const { partnerId, productIds } = usePartnerStore();

  return useMutation({
    mutationFn: (capabilityName: string) =>
      registerCapabilityInterest({
        partnerId,
        productIds,
        payload: {
          capability_name: capabilityName,
        },
      }),
    onSuccess: () => {
      toast.success(INTEREST_REGISTERATION_MSG);
    },
    onError: () => {
      toast.error('Failed to register interest');
    },
  });
};

export const useExportClaimsDataMutation = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation({
    mutationFn: ({
      fromDate,
      toDate,
      statusGroups,
      coverIds,
    }: {
      fromDate: string;
      toDate: string;
      statusGroups: string[];
      coverIds?: string[];
    }) => {
      if (!isReady || productIds.length === 0) {
        throw new Error('Partner configuration not ready');
      }

      return exportClaimsData({
        partnerId,
        lob,
        fromDate,
        toDate,
        productIds,
        coverIds,
        statusGroups,
      });
    },
  });
};
