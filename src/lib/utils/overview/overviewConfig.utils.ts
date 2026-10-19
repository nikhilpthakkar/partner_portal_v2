import type {
  OverviewConfigComponentRef,
  OverviewConfigResponse,
  OverviewLayout,
  PartnerOverviewChartAdditionalData,
  PartnerOverviewConfigChartRef,
  UpdatePartnerOverviewConfigurationRequest,
} from '@/lib/types/overview/config';
import type { ConfigureMetricsCatalogItem } from '@/lib/constants/configureMetrics.constants';
import {
  buildTenureDistributionBuckets,
  POLICIES_BY_TENURE_DISTRIBUTION_CHART_ID,
  POLICIES_BY_TENURE_DISTRIBUTION_CONFIG_CHART_ID,
  toTenureDistributionApiUnit,
} from '@/lib/constants/tenureDistribution.constants';
import {
  normalizeChartComponentId,
  normalizeKpiComponentId,
} from '@/lib/utils/overview/overviewChart.utils';
import {
  DEFAULT_TENURE_DISTRIBUTION_SETTINGS,
  parseTenureDistributionSettings,
  parseTenureDistributionSettingsFromAdditionalData,
  type TenureDistributionSettings,
} from '@/lib/types/overview/tenureDistribution';

const EMPTY_LAYOUT: OverviewLayout = {
  kpiIds: [],
  chartIds: [],
  showKeyMetricsSection: false,
  showBusinessSummarySection: false,
};

const sortComponentIds = (
  components: OverviewConfigResponse['kpis'] | undefined,
): string[] => {
  if (!components?.length) {
    return [];
  }

  return [...components]
    .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id))
    .map((component) => component.id);
};

export const orderResponsesByComponentIds = <T extends { componentId: string }>(
  responses: T[] | undefined,
  orderedIds: string[],
): T[] => {
  if (!responses?.length || !orderedIds.length) {
    return [];
  }

  const responseById = new Map(
    responses.map((response) => [normalizeKpiComponentId(response.componentId), response]),
  );

  return orderedIds.flatMap((componentId) => {
    const response = responseById.get(normalizeKpiComponentId(componentId));
    return response ? [response] : [];
  });
};

export const parseOverviewLayout = (
  config: OverviewConfigResponse | undefined,
): OverviewLayout => {
  if (!config) {
    return EMPTY_LAYOUT;
  }

  const kpiIds = sortComponentIds(config.kpis);
  const chartIds = sortComponentIds(config.charts).map(normalizeChartComponentId);

  return {
    kpiIds,
    chartIds,
    showKeyMetricsSection: kpiIds.length > 0,
    showBusinessSummarySection: chartIds.length > 0,
  };
};

export const buildOverviewConfigComponentRefs = (
  catalog: ConfigureMetricsCatalogItem[],
  enabledIds: Set<string>,
): OverviewConfigComponentRef[] =>
  catalog
    .filter((item) => enabledIds.has(item.id))
    .map((item, index) => ({
      id: item.configId,
      position: index + 1,
    }));

export const parseTenureDistributionSettingsFromOverviewConfig = (
  config: OverviewConfigResponse | undefined,
): TenureDistributionSettings => {
  if (!config) {
    return DEFAULT_TENURE_DISTRIBUTION_SETTINGS;
  }

  const tenureChart = config.charts.find(
    (chart) =>
      chart.id === POLICIES_BY_TENURE_DISTRIBUTION_CONFIG_CHART_ID ||
      chart.id === POLICIES_BY_TENURE_DISTRIBUTION_CHART_ID,
  );

  if (tenureChart?.additional_data) {
    return parseTenureDistributionSettingsFromAdditionalData(tenureChart.additional_data);
  }

  return parseTenureDistributionSettings(config.chart_settings?.policies_by_tenure_distribution);
};

export const buildTenureDistributionAdditionalData = (
  settings: TenureDistributionSettings,
): PartnerOverviewChartAdditionalData => ({
  unit: toTenureDistributionApiUnit(settings.duration_unit),
  buckets: buildTenureDistributionBuckets(settings.ranges),
});

export const buildPartnerOverviewConfigurationRequest = ({
  kpiCatalog,
  chartCatalog,
  enabledKpiIds,
  enabledChartIds,
  tenureDistributionSettings,
}: {
  kpiCatalog: ConfigureMetricsCatalogItem[];
  chartCatalog: ConfigureMetricsCatalogItem[];
  enabledKpiIds: Set<string>;
  enabledChartIds: Set<string>;
  tenureDistributionSettings: TenureDistributionSettings;
}): UpdatePartnerOverviewConfigurationRequest => {
  const charts: PartnerOverviewConfigChartRef[] = chartCatalog
    .filter((item) => enabledChartIds.has(item.id))
    .map((item, index) => {
      const chart: PartnerOverviewConfigChartRef = {
        id: item.configId,
        position: index + 1,
      };

      if (item.id === POLICIES_BY_TENURE_DISTRIBUTION_CHART_ID) {
        chart.additional_data = buildTenureDistributionAdditionalData(tenureDistributionSettings);
      }

      return chart;
    });

  return {
    overwrite_existing: true,
    overview_config: {
      kpis: buildOverviewConfigComponentRefs(kpiCatalog, enabledKpiIds),
      charts,
    },
  };
};
