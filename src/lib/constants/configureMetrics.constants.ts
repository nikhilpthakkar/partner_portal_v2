import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import {
  POLICIES_BY_TENURE_DISTRIBUTION_CHART_ID,
  POLICIES_BY_TENURE_DISTRIBUTION_CONFIG_CHART_ID,
} from '@/lib/constants/tenureDistribution.constants';
import {
  GROSS_PREMIUM_LABEL,
  GWP_POLICY_COUNT_TREND_LABEL,
} from '@/lib/constants/overviewComponents.constants';

export type ConfigureMetricsCatalogItem = {
  /** ID sent in save/update requests */
  id: string;
  /** ID returned from overview config GET */
  configId: string;
  label: string;
};

export const CONFIGURE_METRICS_ALLOWED_KPI_IDS = [
  'TOTAL_POLICIES_ISSUED',
  'GROSS_WRITTEN_PREMIUM',
  'CLAIM_SETTLEMENT_RATIO',
  'AVERAGE_PREMIUM',
  'AVERAGE_SI',
  'FLOAT_BALANCE',
] as const;

export type ConfigureMetricsKpiId = (typeof CONFIGURE_METRICS_ALLOWED_KPI_IDS)[number];

export const CONFIGURE_METRICS_KPI_CATALOG: ConfigureMetricsCatalogItem[] = [
  {
    id: 'TOTAL_POLICIES_ISSUED',
    configId: 'total_policies_issued',
    label: 'Total policies issued',
  },
  {
    id: 'GROSS_WRITTEN_PREMIUM',
    configId: 'gross_written_premium',
    label: GROSS_PREMIUM_LABEL,
  },
  {
    id: 'FLOAT_BALANCE',
    configId: 'float_balance',
    label: 'Balance overview',
  },
  {
    id: 'AVERAGE_PREMIUM',
    configId: 'average_premium',
    label: 'Avg premium amount',
  },
  {
    id: 'AVERAGE_SI',
    configId: 'average_si',
    label: 'Avg sum insured value',
  },
  {
    id: 'CLAIM_SETTLEMENT_RATIO',
    configId: 'claim_settlement_ratio',
    label: 'Claims settlement ratio',
  },
];

export const mapConfigKpiIdToCatalogId = (configId: string): string | undefined =>
  CONFIGURE_METRICS_KPI_CATALOG.find((item) => item.configId === configId)?.id;

export const mapCatalogKpiIdToConfigId = (catalogId: string): string | undefined =>
  CONFIGURE_METRICS_KPI_CATALOG.find((item) => item.id === catalogId)?.configId;

export const parseEnabledKpiIdsFromConfig = (configKpiIds: string[]): Set<string> =>
  new Set(
    configKpiIds.flatMap((configId) => {
      const catalogId = mapConfigKpiIdToCatalogId(configId);
      return catalogId ? [catalogId] : [];
    }),
  );

export const CONFIGURE_METRICS_CHART_CATALOG: ConfigureMetricsCatalogItem[] = [
  {
    id: 'GWP_POLICY_COUNT_TREND',
    configId: 'gwp_policy_count_trend',
    label: GWP_POLICY_COUNT_TREND_LABEL,
  },
  {
    id: 'CLAIMS_TREND_BY_STATUS',
    configId: 'claims_trend_by_status',
    label: 'Claims trend(GPA)',
  },
  {
    id: 'AVG_PREMIUM_TREND',
    configId: 'avg_premium_trend',
    label: 'Avg premium trend',
  },
  {
    id: 'GEO_DISTRIBUTION_POLICIES',
    configId: 'geo_distribution_policies',
    label: 'Geographical distribution of policies',
  },
  {
    id: 'GEO_DISTRIBUTION_CLAIMS',
    configId: 'geo_distribution_claims',
    label: 'Geographical distribution of claims',
  },
  {
    id: 'AVERAGE_SI_TREND',
    configId: 'average_si_trend',
    label: 'Monthly average sum insured trend',
  },
  {
    id: POLICIES_BY_TENURE_DISTRIBUTION_CHART_ID,
    configId: POLICIES_BY_TENURE_DISTRIBUTION_CONFIG_CHART_ID,
    label: 'Policies by tenure distribution',
  },
];

export const getAllConfigureMetricsKpiIds = (): Set<string> =>
  new Set(CONFIGURE_METRICS_KPI_CATALOG.map((item) => item.id));

export const getAllConfigureMetricsChartIds = (): Set<string> =>
  new Set(CONFIGURE_METRICS_CHART_CATALOG.map((item) => item.id));

export const mapConfigChartIdToCatalogId = (configId: string): string | undefined =>
  CONFIGURE_METRICS_CHART_CATALOG.find((item) => item.configId === configId)?.id;

export const parseEnabledChartIdsFromConfig = (configChartIds: string[]): Set<string> =>
  new Set(
    configChartIds.flatMap((configId) => {
      const catalogId = mapConfigChartIdToCatalogId(configId);
      return catalogId ? [catalogId] : [];
    }),
  );

export const CONFIGURE_METRICS_NAV_ITEMS = [
  ...(FINANCIAL_SIMULATOR_ENABLED
    ? [{ id: 'access-management', label: 'Access management', href: 'access-management' }]
    : []),
  { id: 'configure-metrics', label: 'Configure metrics', href: 'configure-metrics' },
] as const;

export const CONFIGURE_METRICS_PAGE_HEADER = {
  title: 'Settings',
  subtitle: 'Configure metrics and dashboard preferences for your partners',
} as const;
