import {
  fromTenureDistributionApiUnit,
  TENURE_DISTRIBUTION_MISSING_RANGE_ERROR_MESSAGE,
  TENURE_DISTRIBUTION_MONTHLY_BOUNDS_ERROR_MESSAGE,
  TENURE_DISTRIBUTION_MONTHLY_MAX,
  TENURE_DISTRIBUTION_MONTHLY_MIN,
  TENURE_DISTRIBUTION_RANGE_ERROR_MESSAGE,
} from '@/lib/constants/tenureDistribution.constants';
import type { PartnerOverviewChartAdditionalData } from '@/lib/types/overview/config';

export type TenureDistributionDurationUnit = 'monthly' | 'yearly';

export type TenureDistributionRange = {
  from: number | null;
  to: number | null;
};

export type TenureDistributionSettings = {
  duration_unit: TenureDistributionDurationUnit;
  ranges: TenureDistributionRange[];
};

export const DEFAULT_TENURE_DISTRIBUTION_SETTINGS: TenureDistributionSettings = {
  duration_unit: 'monthly',
  ranges: [{ from: null, to: null }],
};

export const parseTenureDistributionSettings = (
  value: TenureDistributionSettings | undefined,
): TenureDistributionSettings => {
  if (!value?.ranges?.length) {
    return DEFAULT_TENURE_DISTRIBUTION_SETTINGS;
  }

  return {
    duration_unit: value.duration_unit ?? 'monthly',
    ranges: value.ranges.map((range) => ({
      from: range.from ?? null,
      to: range.to ?? null,
    })),
  };
};

export const parseTenureDistributionSettingsFromAdditionalData = (
  additionalData: PartnerOverviewChartAdditionalData | undefined,
): TenureDistributionSettings => {
  const duration_unit = fromTenureDistributionApiUnit(
    additionalData?.unit ?? additionalData?.duration,
  );

  if (additionalData?.buckets?.length || additionalData?.bucketCounts?.length) {
    const buckets = additionalData.buckets ?? additionalData.bucketCounts ?? [];

    return {
      duration_unit,
      ranges: buckets.map((bucket) => ({
        from: bucket.min ?? null,
        to: bucket.max ?? null,
      })),
    };
  }

  if (additionalData?.range?.length) {
    return {
      duration_unit,
      ranges: additionalData.range.map((range) => ({
        from: range.from ?? null,
        to: range.to ?? null,
      })),
    };
  }

  return DEFAULT_TENURE_DISTRIBUTION_SETTINGS;
};

export const isTenureRangeComplete = (from: number | null, to: number | null): boolean =>
  from !== null && to !== null;

export const isTenureRangeInvalid = (from: number | null, to: number | null): boolean => {
  if (from === null || to === null) {
    return false;
  }

  return from >= to;
};

export const hasTenureDistributionMissingRangeError = (
  settings: TenureDistributionSettings,
): boolean =>
  !settings.ranges.some((range) => isTenureRangeComplete(range.from, range.to));

export const hasTenureDistributionInvalidRangeError = (
  settings: TenureDistributionSettings,
): boolean => settings.ranges.some((range) => isTenureRangeInvalid(range.from, range.to));

export const isTenureMonthlyValueOutOfBounds = (value: number | null): boolean => {
  if (value === null) {
    return false;
  }

  return value < TENURE_DISTRIBUTION_MONTHLY_MIN || value > TENURE_DISTRIBUTION_MONTHLY_MAX;
};

export const hasTenureDistributionMonthlyBoundsError = (
  settings: TenureDistributionSettings,
): boolean => {
  if (settings.duration_unit !== 'monthly') {
    return false;
  }

  return settings.ranges.some(
    (range) =>
      isTenureMonthlyValueOutOfBounds(range.from) || isTenureMonthlyValueOutOfBounds(range.to),
  );
};

export const hasTenureDistributionValidationErrors = (
  settings: TenureDistributionSettings,
): boolean =>
  hasTenureDistributionMissingRangeError(settings) ||
  hasTenureDistributionMonthlyBoundsError(settings) ||
  hasTenureDistributionInvalidRangeError(settings);

export const getTenureDistributionValidationErrorMessage = (
  settings: TenureDistributionSettings,
): string | null => {
  if (hasTenureDistributionMissingRangeError(settings)) {
    return TENURE_DISTRIBUTION_MISSING_RANGE_ERROR_MESSAGE;
  }

  if (hasTenureDistributionMonthlyBoundsError(settings)) {
    return TENURE_DISTRIBUTION_MONTHLY_BOUNDS_ERROR_MESSAGE;
  }

  if (hasTenureDistributionInvalidRangeError(settings)) {
    return TENURE_DISTRIBUTION_RANGE_ERROR_MESSAGE;
  }

  return null;
};

export const getTenureDurationLabel = (durationUnit: TenureDistributionDurationUnit): string =>
  durationUnit === 'yearly' ? 'Years' : 'Months';

export const parseTenureInputValue = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};
