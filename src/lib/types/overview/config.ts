import type { TenureDistributionSettings } from '@/lib/types/overview/tenureDistribution';

export type OverviewConfigComponentRef = {
  id: string;
  position: number;
};

export type PartnerOverviewChartUnit = 'MONTHS' | 'YEARS';

export type PartnerOverviewChartRange = {
  from: number;
  to: number;
};

export type TenureDistributionBucket = {
  min: number;
  max: number;
  percentage?: number;
  policyCount?: number;
};

/** @deprecated Use TenureDistributionBucket */
export type TenureDistributionBucketCount = TenureDistributionBucket;

export type PartnerOverviewChartAdditionalData = {
  unit: PartnerOverviewChartUnit;
  buckets?: TenureDistributionBucket[];
  /** @deprecated Prefer buckets */
  bucketCounts?: TenureDistributionBucket[];
  /** @deprecated Prefer unit */
  duration?: 'MONTHLY' | 'YEARLY';
  /** @deprecated Prefer buckets */
  range?: PartnerOverviewChartRange[];
};

export type OverviewConfigChartRef = OverviewConfigComponentRef & {
  additional_data?: PartnerOverviewChartAdditionalData;
};

export type OverviewConfigChartSettings = {
  policies_by_tenure_distribution?: TenureDistributionSettings;
};

export type OverviewConfigResponse = {
  source: string;
  kpis: OverviewConfigComponentRef[];
  charts: OverviewConfigChartRef[];
  cards: OverviewConfigComponentRef[];
  partner_id: string;
  user_id: string;
  chart_settings?: OverviewConfigChartSettings;
};

export type UpdateOverviewConfigRequest = {
  kpis: OverviewConfigComponentRef[];
  charts: OverviewConfigComponentRef[];
  cards?: OverviewConfigComponentRef[];
  chart_settings?: OverviewConfigChartSettings;
};

export type PartnerOverviewConfigChartRef = {
  id: string;
  position: number;
  additional_data?: PartnerOverviewChartAdditionalData;
};

export type UpdatePartnerOverviewConfigurationRequest = {
  overwrite_existing: boolean;
  overview_config: {
    kpis: OverviewConfigComponentRef[];
    charts: PartnerOverviewConfigChartRef[];
  };
};

export type OverviewLayout = {
  kpiIds: string[];
  chartIds: string[];
  showKeyMetricsSection: boolean;
  showBusinessSummarySection: boolean;
};
