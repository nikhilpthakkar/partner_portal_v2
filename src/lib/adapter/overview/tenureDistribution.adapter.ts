import type { GeoDistributionData, GroupBy } from '@/lib/types/overview';
import type {
  TenureDistributionBucketBreakdown,
  TenureDistributionDataPoint,
} from '@/lib/types/overview/graphs';
import type { OverviewTenureDistributionChartComponentResponse } from '@/lib/types/overview/components';
import {
  formatTenureRangeLabel,
  getTenureDistributionBucketColor,
} from '@/lib/constants/tenureDistribution.constants';
import type { TenureDistributionDurationUnit } from '@/lib/types/overview/tenureDistribution';
import { formatGraphPeriodLabel } from '@/lib/utils/graphDateFormats';

const emptyTenureDistributionData: GeoDistributionData = {
  title: 'Policies by tenure distribution',
  categories: [],
  periodStarts: [],
  periodEnds: [],
  periodType: 'MONTHLY',
  totals: [],
  series: [],
  infoText: '',
  hasData: false,
};

const getTrendPoints = (
  response: OverviewTenureDistributionChartComponentResponse | undefined,
): TenureDistributionDataPoint[] | undefined => {
  const data = response?.payload?.data;
  if (!data) return undefined;

  return (
    data.policiesByTenureDistribution ??
    data.tenureDistribution ??
    data.policiesByTenure
  );
};

const getBreakdown = (
  point: TenureDistributionDataPoint,
): TenureDistributionBucketBreakdown[] =>
  point.buckets ?? point.bucketCounts ?? point.tenureBuckets ?? point.ranges ?? point.breakdown ?? [];

const getBucketFrom = (item: TenureDistributionBucketBreakdown): number | undefined =>
  item.min ?? item.from ?? item.rangeFrom;

const getBucketTo = (item: TenureDistributionBucketBreakdown): number | undefined =>
  item.max ?? item.to ?? item.rangeTo;

const getBucketKey = (item: TenureDistributionBucketBreakdown): string => {
  const label = item.label ?? item.rangeLabel;
  if (label) {
    return label;
  }

  const from = getBucketFrom(item);
  const to = getBucketTo(item);

  if (from !== undefined && to !== undefined) {
    return `${from}-${to}`;
  }

  return 'Unknown';
};

const getBucketCount = (item: TenureDistributionBucketBreakdown): number =>
  item.policyCount ?? item.count ?? 0;

const getBucketPercentage = (
  item: TenureDistributionBucketBreakdown,
  total: number,
): number => {
  if (typeof item.percentage === 'number') {
    return item.percentage;
  }

  if (total <= 0) {
    return 0;
  }

  return (getBucketCount(item) / total) * 100;
};

const getTotalPolicies = (point: TenureDistributionDataPoint): number =>
  point.totalPolicies ?? point.totalCount ?? 0;

const buildInfoText = (periodType: GroupBy): string => {
  if (periodType === 'WEEKLY') {
    return 'Weekly distribution of policies across configured tenure ranges';
  }

  if (periodType === 'QUARTERLY') {
    return 'Quarterly distribution of policies across configured tenure ranges';
  }

  if (periodType === 'DAILY') {
    return 'Daily distribution of policies across configured tenure ranges';
  }

  return 'Monthly distribution of policies across configured tenure ranges';
};

const getBucketOrder = (trend: TenureDistributionDataPoint[]): string[] => {
  const orderedBuckets: string[] = [];

  trend.forEach((point) => {
    getBreakdown(point).forEach((item) => {
      const key = getBucketKey(item);
      if (!orderedBuckets.includes(key)) {
        orderedBuckets.push(key);
      }
    });
  });

  return orderedBuckets;
};

const formatBucketLabel = (
  key: string,
  item: TenureDistributionBucketBreakdown | undefined,
  durationUnit: TenureDistributionDurationUnit,
): string => {
  if (item?.label ?? item?.rangeLabel) {
    return item.label ?? item.rangeLabel ?? key;
  }

  const from = item ? getBucketFrom(item) : undefined;
  const to = item ? getBucketTo(item) : undefined;

  if (from !== undefined && to !== undefined) {
    return formatTenureRangeLabel(from, to, durationUnit);
  }

  const [parsedFrom, parsedTo] = key.split('-').map((value) => Number(value));
  if (Number.isFinite(parsedFrom) && Number.isFinite(parsedTo)) {
    return formatTenureRangeLabel(parsedFrom, parsedTo, durationUnit);
  }

  return key;
};

export const mapTenureDistributionChartComponentToCard = (
  response: OverviewTenureDistributionChartComponentResponse | undefined,
  durationUnit: TenureDistributionDurationUnit = 'monthly',
): GeoDistributionData => {
  const trend = getTrendPoints(response);

  if (!trend?.length) {
    return {
      ...emptyTenureDistributionData,
      title: response?.label || emptyTenureDistributionData.title,
    };
  }

  const periodType = trend[0].periodType;
  const bucketOrder = getBucketOrder(trend);

  const categories = trend.map((item) =>
    formatGraphPeriodLabel(periodType, item.periodStart, item.periodEnd),
  );
  const periodStarts = trend.map((item) => item.periodStart);
  const periodEnds = trend.map((item) => item.periodEnd);
  const totals = trend.map(getTotalPolicies);

  const series = bucketOrder.map((bucketKey, index) => {
    const sampleItem = trend
      .flatMap((point) => getBreakdown(point))
      .find((item) => getBucketKey(item) === bucketKey);

    return {
      name: formatBucketLabel(bucketKey, sampleItem, durationUnit),
      color: getTenureDistributionBucketColor(index),
      percentages: trend.map((point) => {
        const total = getTotalPolicies(point);
        const match = getBreakdown(point).find((item) => getBucketKey(item) === bucketKey);
        return match ? getBucketPercentage(match, total) : 0;
      }),
      counts: trend.map((point) => {
        const match = getBreakdown(point).find((item) => getBucketKey(item) === bucketKey);
        return match ? getBucketCount(match) : 0;
      }),
    };
  });

  return {
    title: response?.label || emptyTenureDistributionData.title,
    categories,
    periodStarts,
    periodEnds,
    periodType,
    totals,
    series,
    infoText: buildInfoText(periodType),
    hasData: trend.length > 0 && series.length > 0,
  };
};
