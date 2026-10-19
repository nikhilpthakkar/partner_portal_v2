/** Catalog/save chart id for policies by tenure distribution */
export const POLICIES_BY_TENURE_DISTRIBUTION_CHART_ID = 'POLICIES_BY_TENURE_DISTRIBUTION';

/** Overview config GET chart id for policies by tenure distribution */
export const POLICIES_BY_TENURE_DISTRIBUTION_CONFIG_CHART_ID = 'policies_by_tenure_distribution';

export const TENURE_DISTRIBUTION_MAX_RANGES = 5;

export const TENURE_DISTRIBUTION_RANGE_ERROR_MESSAGE =
  'The To range value should be greater than the From range value';

export const TENURE_DISTRIBUTION_MISSING_RANGE_ERROR_MESSAGE = 'Enter at least one range';

export const TENURE_DISTRIBUTION_MONTHLY_MIN = 0;
export const TENURE_DISTRIBUTION_MONTHLY_MAX = 12;

export const TENURE_DISTRIBUTION_MONTHLY_BOUNDS_ERROR_MESSAGE =
  'Enter values between 0 and 12';

export const TENURE_DISTRIBUTION_DURATION_TABS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
] as const;

export const buildTenureDistributionBuckets = (
  ranges: Array<{ from: number | null; to: number | null }>,
): Array<{ min: number; max: number }> =>
  ranges.flatMap((range) => {
    if (range.from === null || range.to === null) {
      return [];
    }

    return [{ min: range.from, max: range.to }];
  });

export const toTenureDistributionApiUnit = (
  durationUnit: 'monthly' | 'yearly',
): 'MONTHS' | 'YEARS' => (durationUnit === 'yearly' ? 'YEARS' : 'MONTHS');

export const fromTenureDistributionApiUnit = (
  unit?: string,
): 'monthly' | 'yearly' => {
  if (unit === 'YEARS' || unit === 'YEARLY') {
    return 'yearly';
  }

  return 'monthly';
};

export const TENURE_DISTRIBUTION_BAR_WIDTH = 63.781;

export const TENURE_DISTRIBUTION_BUCKET_COLORS = [
  '#0d9488',
  '#164e63',
  '#fbbf24',
  '#f97316',
  '#b45309',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
];

export const getTenureDistributionBucketColor = (index: number): string =>
  TENURE_DISTRIBUTION_BUCKET_COLORS[index % TENURE_DISTRIBUTION_BUCKET_COLORS.length];

export const formatTenureRangeLabel = (
  from: number,
  to: number,
  durationUnit: 'monthly' | 'yearly',
): string => {
  const unit = durationUnit === 'yearly' ? 'Years' : 'Months';
  return `${from}-${to} ${unit}`;
};
