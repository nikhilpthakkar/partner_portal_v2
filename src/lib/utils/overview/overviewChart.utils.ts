import {
  CONFIGURE_METRICS_CHART_CATALOG,
  CONFIGURE_METRICS_KPI_CATALOG,
} from '@/lib/constants/configureMetrics.constants';
import {
  ChartComponentId,
  KPI_INFO_TEXT,
  KpiComponentId,
} from '@/lib/constants/overviewComponents.constants';
import type { DateRange } from 'react-day-picker';

const LEGACY_CHART_ID_ALIASES: Record<string, ChartComponentId> = {
  geo_policies_distribution: ChartComponentId.GEO_DISTRIBUTION_POLICIES,
  geo_claims_distribution: ChartComponentId.GEO_DISTRIBUTION_CLAIMS,
  GWP_POLICY_COUNT_TREND: ChartComponentId.GWP_POLICY_COUNT_TREND,
  CLAIMS_TREND_BY_STATUS: ChartComponentId.CLAIMS_TREND_BY_STATUS,
  AVG_PREMIUM_TREND: ChartComponentId.AVG_PREMIUM_TREND,
  GEO_DISTRIBUTION_POLICIES: ChartComponentId.GEO_DISTRIBUTION_POLICIES,
  GEO_DISTRIBUTION_CLAIMS: ChartComponentId.GEO_DISTRIBUTION_CLAIMS,
  AVERAGE_SI_TREND: ChartComponentId.AVERAGE_SI_TREND,
  POLICIES_BY_TENURE_DISTRIBUTION: ChartComponentId.POLICIES_BY_TENURE_DISTRIBUTION,
};

export const normalizeKpiComponentId = (kpiId: string): string => {
  const catalogMatch = CONFIGURE_METRICS_KPI_CATALOG.find(
    (item) => item.id === kpiId || item.configId === kpiId,
  );

  return catalogMatch?.configId ?? kpiId;
};

export const getKpiInfoText = (componentId: string): string | undefined =>
  KPI_INFO_TEXT[normalizeKpiComponentId(componentId) as KpiComponentId];

export const normalizeChartComponentId = (chartId: string): string => {
  const catalogMatch = CONFIGURE_METRICS_CHART_CATALOG.find(
    (item) => item.id === chartId || item.configId === chartId,
  );

  if (catalogMatch) {
    return catalogMatch.configId;
  }

  return LEGACY_CHART_ID_ALIASES[chartId] ?? chartId;
};

export const matchesChartComponentId = (
  chartId: string,
  expected: ChartComponentId,
): boolean => normalizeChartComponentId(chartId) === expected;

export const layoutIncludesChart = (
  chartIds: string[],
  expected: ChartComponentId,
): boolean => chartIds.some((chartId) => matchesChartComponentId(chartId, expected));

export const isOverviewChartDateRangeSelected = (dateRange: DateRange): boolean =>
  Boolean(dateRange.from && dateRange.to);
