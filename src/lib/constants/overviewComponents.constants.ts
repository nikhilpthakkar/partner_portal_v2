export enum OverviewComponentType {
  KPI = 'KPI',
  CHART = 'CHART',
  CARD = 'CARD',
}

export enum KpiComponentId {
  FLOAT_BALANCE = 'float_balance',
  TOTAL_POLICIES_ISSUED = 'total_policies_issued',
  GROSS_WRITTEN_PREMIUM = 'gross_written_premium',
  AVERAGE_PREMIUM = 'average_premium',
  AVERAGE_SI = 'average_si',
  CLAIM_SETTLEMENT_RATIO = 'claim_settlement_ratio',
}

export enum ChartComponentId {
  GWP_POLICY_COUNT_TREND = 'gwp_policy_count_trend',
  CLAIMS_TREND_BY_STATUS = 'claims_trend_by_status',
  AVG_PREMIUM_TREND = 'avg_premium_trend',
  GEO_DISTRIBUTION_POLICIES = 'geo_distribution_policies',
  GEO_DISTRIBUTION_CLAIMS = 'geo_distribution_claims',
  AVERAGE_SI_TREND = 'average_si_trend',
  POLICIES_BY_TENURE_DISTRIBUTION = 'policies_by_tenure_distribution',
}

export enum CardComponentId {
  PROMO_CAPABILITY = 'promo_capability',
}

export const GROSS_PREMIUM_LABEL = 'Gross premium';
export const GWP_POLICY_COUNT_TREND_LABEL = 'Gross premium & Policy count trend';
export const GROSS_PREMIUM_CURRENCY_LEGEND_LABEL = 'Gross premium (in INR)';
export const LEGACY_GWP_POLICY_COUNT_TREND_LABEL = 'GWP & Policy count trend';

/** Shared tooltip for gross premium KPI cards — net premium after cancellations/refunds/adjustments. */
export const GROSS_WRITTEN_PREMIUM_INFO_TEXT =
  'Total premium value of all policies issued in the current month accounted for cancellations, refunds, or adjustments.';

export const normalizeGrossPremiumLabel = (label: string): string => {
  const normalizedLabel = label.trim().toLowerCase().replace(/\s+/g, ' ');

  if (normalizedLabel === 'gross written premium') {
    return GROSS_PREMIUM_LABEL;
  }

  if (label === LEGACY_GWP_POLICY_COUNT_TREND_LABEL) {
    return GWP_POLICY_COUNT_TREND_LABEL;
  }

  return label;
};

/** KPIs rendered in the dashboard key-metrics section, in display order. */
export const KEY_METRICS_KPI_IDS: KpiComponentId[] = [
  KpiComponentId.TOTAL_POLICIES_ISSUED,
  KpiComponentId.GROSS_WRITTEN_PREMIUM,
  KpiComponentId.FLOAT_BALANCE,
];

export const KPI_INFO_TEXT: Record<KpiComponentId, string> = {
  [KpiComponentId.TOTAL_POLICIES_ISSUED]:
    'Total number of policies successfully issued in the current month. This excludes failed, rejected, or pending issuance requests.',
  [KpiComponentId.GROSS_WRITTEN_PREMIUM]: GROSS_WRITTEN_PREMIUM_INFO_TEXT,
  [KpiComponentId.AVERAGE_PREMIUM]:
    'Average premium value per policy issued in the current month',
  [KpiComponentId.AVERAGE_SI]:
    'Average sum insured across all policies issued in the current month',
  [KpiComponentId.CLAIM_SETTLEMENT_RATIO]:
    'Percentage of claims settled out of total claims raised in the current month.',
  [KpiComponentId.FLOAT_BALANCE]: 'Current available balance in your policy issuance account.',
};
