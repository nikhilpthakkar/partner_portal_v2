import type { GeoDistributionData, GroupBy } from '@/lib/types/overview';
import type { GeoDistributionView, GeoDistributionClaimStatus } from '@/lib/constants/geoDistribution.constants';
import {
  GEO_DISTRIBUTION_OTHERS_LABEL,
  GEO_DISTRIBUTION_CLAIM_STATUS_API_KEYS,
  formatGeoLegendLabel,
  getGeoDistributionStackColor,
  normalizeGeoRegionKey,
} from '@/lib/constants/geoDistribution.constants';
import { ChartComponentId } from '@/lib/constants/overviewComponents.constants';
import type {
  GeoDistributionDataPoint,
  GeoDistributionStateBreakdown,
} from '@/lib/types/overview/graphs';
import type { OverviewGeoDistributionChartComponentResponse } from '@/lib/types/overview/components';
import { formatGraphPeriodLabel } from '@/lib/utils/graphDateFormats';

const emptyGeoDistributionData: GeoDistributionData = {
  title: 'Geo distribution',
  categories: [],
  periodStarts: [],
  periodEnds: [],
  periodType: 'MONTHLY',
  totals: [],
  series: [],
  infoText: '',
  hasData: false,
};

type GeoDistributionCountContext = {
  isClaimsChart: boolean;
  claimStatus?: GeoDistributionClaimStatus;
  useStatusBreakdown: boolean;
};

const createCountContext = (
  isClaimsChart: boolean,
  claimStatus?: GeoDistributionClaimStatus,
  useStatusBreakdown = false,
): GeoDistributionCountContext => ({
  isClaimsChart,
  claimStatus: isClaimsChart ? claimStatus : undefined,
  useStatusBreakdown: isClaimsChart && Boolean(claimStatus) && useStatusBreakdown,
});

const firstNonEmptyTrend = (
  ...candidates: Array<GeoDistributionDataPoint[] | undefined>
): GeoDistributionDataPoint[] | undefined =>
  candidates.find((candidate) => candidate && candidate.length > 0);

const getTrendPoints = (
  response: OverviewGeoDistributionChartComponentResponse | undefined,
  componentId?: ChartComponentId.GEO_DISTRIBUTION_POLICIES | ChartComponentId.GEO_DISTRIBUTION_CLAIMS,
): GeoDistributionDataPoint[] | undefined => {
  const data = response?.payload?.data;
  if (!data) return undefined;

  const isClaimsChart = componentId === ChartComponentId.GEO_DISTRIBUTION_CLAIMS;

  if (isClaimsChart) {
    return firstNonEmptyTrend(
      data.geoDistributionClaims,
      data.geoClaimsDistribution,
      data.geoDistribution,
    );
  }

  return firstNonEmptyTrend(
    data.geoDistribution,
    data.geoDistributionPolicies,
    data.geoPoliciesDistribution,
  );
};

const getRegionKey = (item: GeoDistributionStateBreakdown): string => {
  const raw =
    item.state ??
    item.zone ??
    item.regionName ??
    item.regionCode ??
    item.stateCode ??
    item.zoneCode ??
    item.code ??
    'Unknown';

  return normalizeGeoRegionKey(raw);
};

const getRegionCount = (item: GeoDistributionStateBreakdown): number =>
  item.policyCount ?? item.claimCount ?? item.count ?? 0;

const getItemStatusBreakdown = (
  item: GeoDistributionStateBreakdown,
): GeoDistributionStateBreakdown['statusBreakdown'] =>
  item.statusBreakdown ??
  (item as GeoDistributionStateBreakdown & { status_breakdown?: GeoDistributionStateBreakdown['statusBreakdown'] })
    .status_breakdown;

const getStatusFilteredRegionCount = (
  item: GeoDistributionStateBreakdown,
  claimStatus: GeoDistributionClaimStatus,
): number => {
  const breakdown = getItemStatusBreakdown(item);
  if (!breakdown) {
    return getRegionCount(item);
  }

  const key = GEO_DISTRIBUTION_CLAIM_STATUS_API_KEYS[claimStatus];
  return breakdown[key] ?? 0;
};

const hasStatusBreakdownData = (breakdown: GeoDistributionStateBreakdown[]): boolean =>
  breakdown.some((item) => {
    const statusBreakdown = getItemStatusBreakdown(item);
    return statusBreakdown != null && Object.keys(statusBreakdown).length > 0;
  });

const countForRegion = (
  item: GeoDistributionStateBreakdown,
  ctx: GeoDistributionCountContext,
): number => {
  if (ctx.useStatusBreakdown) {
    return getStatusFilteredRegionCount(item, ctx.claimStatus!);
  }

  return getRegionCount(item);
};

const getRegionPercentage = (
  item: GeoDistributionStateBreakdown,
  total: number,
  ctx: GeoDistributionCountContext,
): number => {
  if (ctx.useStatusBreakdown) {
    const count = countForRegion(item, ctx);
    return total > 0 ? (count / total) * 100 : 0;
  }

  if (typeof item.percentage === 'number') {
    return item.percentage;
  }

  if (total <= 0) {
    return 0;
  }

  return (getRegionCount(item) / total) * 100;
};

const isOthersRegion = (regionKey: string): boolean =>
  regionKey.trim().toLowerCase() === GEO_DISTRIBUTION_OTHERS_LABEL.toLowerCase();

const isUnknownRegion = (regionKey: string): boolean => regionKey === 'Unknown';

const isEmptyBreakdownEntry = (
  item: GeoDistributionStateBreakdown,
  ctx: GeoDistributionCountContext,
): boolean => {
  const key = getRegionKey(item);
  return isUnknownRegion(key) && countForRegion(item, ctx) === 0;
};

const shouldExcludeBreakdownEntry = (
  item: GeoDistributionStateBreakdown,
  geoView: GeoDistributionView,
  ctx: GeoDistributionCountContext,
): boolean => {
  const key = getRegionKey(item);

  if (isEmptyBreakdownEntry(item, ctx)) {
    return true;
  }

  if (ctx.isClaimsChart && geoView === 'ZONAL' && isUnknownRegion(key)) {
    return true;
  }

  return false;
};

const sanitizeBreakdown = (
  breakdown: GeoDistributionStateBreakdown[],
  geoView: GeoDistributionView = 'STATEWISE',
  ctx: GeoDistributionCountContext = createCountContext(false),
): GeoDistributionStateBreakdown[] =>
  breakdown.filter((item) => !shouldExcludeBreakdownEntry(item, geoView, ctx));

const getBreakdown = (
  point: GeoDistributionDataPoint,
  geoView: GeoDistributionView = 'STATEWISE',
  ctx: GeoDistributionCountContext = createCountContext(false),
): GeoDistributionStateBreakdown[] => {
  const raw =
    geoView === 'ZONAL'
      ? point.zones ?? point.breakdown ?? point.distribution ?? point.regions ?? point.states ?? []
      : point.states ?? point.zones ?? point.breakdown ?? point.distribution ?? point.regions ?? [];

  return sanitizeBreakdown(raw, geoView, ctx);
};

const getTotalCount = (
  point: GeoDistributionDataPoint,
  ctx: GeoDistributionCountContext,
  geoView: GeoDistributionView,
): number => {
  if (ctx.useStatusBreakdown) {
    return getBreakdown(point, geoView, ctx).reduce(
      (sum, item) => sum + countForRegion(item, ctx),
      0,
    );
  }

  if (ctx.isClaimsChart) {
    return point.totalClaims ?? point.totalCount ?? point.totalPolicies ?? 0;
  }

  return point.totalPolicies ?? point.totalCount ?? point.totalClaims ?? 0;
};

const isAlreadyTopNWithOthers = (
  breakdown: GeoDistributionStateBreakdown[],
  namedStateLimit: number,
): boolean => {
  const othersEntries = breakdown.filter((item) => isOthersRegion(getRegionKey(item)));
  const namedEntries = breakdown.filter((item) => !isOthersRegion(getRegionKey(item)));

  return (
    othersEntries.length >= 1 &&
    namedEntries.length <= namedStateLimit &&
    breakdown.length <= namedStateLimit + othersEntries.length
  );
};

const normalizeBreakdownWithTopNAndOthers = (
  breakdown: GeoDistributionStateBreakdown[],
  namedStateLimit: number,
  ctx: GeoDistributionCountContext,
): GeoDistributionStateBreakdown[] => {
  if (breakdown.length === 0 || namedStateLimit <= 0) {
    return breakdown;
  }

  if (isAlreadyTopNWithOthers(breakdown, namedStateLimit)) {
    const othersEntries = breakdown.filter((item) => isOthersRegion(getRegionKey(item)));
    const namedEntries = breakdown.filter((item) => !isOthersRegion(getRegionKey(item)));
    return [...namedEntries, ...othersEntries];
  }

  const othersEntries = breakdown.filter((item) => isOthersRegion(getRegionKey(item)));
  const namedEntries = breakdown.filter((item) => !isOthersRegion(getRegionKey(item)));
  const sortedNamed = [...namedEntries].sort(
    (a, b) => countForRegion(b, ctx) - countForRegion(a, ctx),
  );
  const topNamed = sortedNamed.slice(0, namedStateLimit);
  const remainder = sortedNamed.slice(namedStateLimit);

  const othersCount =
    othersEntries.reduce((sum, item) => sum + countForRegion(item, ctx), 0) +
    remainder.reduce((sum, item) => sum + countForRegion(item, ctx), 0);

  const normalizedTotal =
    topNamed.reduce((sum, item) => sum + countForRegion(item, ctx), 0) + othersCount;
  const breakdownTotal = breakdown.reduce((sum, item) => sum + countForRegion(item, ctx), 0);
  const effectiveTotal = normalizedTotal > 0 ? normalizedTotal : breakdownTotal;

  const normalized: GeoDistributionStateBreakdown[] = topNamed.map((item) => {
    const count = countForRegion(item, ctx);
    return {
      ...item,
      state: item.state ? normalizeGeoRegionKey(item.state) : item.state,
      zone: item.zone ? normalizeGeoRegionKey(item.zone) : item.zone,
      policyCount: count,
      claimCount: count,
      count,
      percentage: effectiveTotal > 0 ? (count / effectiveTotal) * 100 : 0,
    };
  });

  if (othersCount > 0) {
    normalized.push({
      state: GEO_DISTRIBUTION_OTHERS_LABEL,
      policyCount: othersCount,
      claimCount: othersCount,
      count: othersCount,
      percentage: effectiveTotal > 0 ? (othersCount / effectiveTotal) * 100 : 0,
    } satisfies GeoDistributionStateBreakdown);
  }

  return normalized;
};

const buildGlobalTopStateKeys = (
  trend: GeoDistributionDataPoint[],
  geoView: GeoDistributionView,
  namedStateLimit: number,
  ctx: GeoDistributionCountContext,
): string[] => {
  const totalsByRegion = new Map<string, number>();

  trend.forEach((point) => {
    getBreakdown(point, geoView, ctx).forEach((item) => {
      const key = getRegionKey(item);
      if (isOthersRegion(key) || isUnknownRegion(key)) {
        return;
      }

      totalsByRegion.set(key, (totalsByRegion.get(key) ?? 0) + countForRegion(item, ctx));
    });
  });

  const topNamed = [...totalsByRegion.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, namedStateLimit)
    .map(([key]) => key);

  return [...topNamed, GEO_DISTRIBUTION_OTHERS_LABEL];
};

const remapBreakdownToGlobalTopStates = (
  breakdown: GeoDistributionStateBreakdown[],
  globalKeys: string[],
  ctx: GeoDistributionCountContext,
): GeoDistributionStateBreakdown[] => {
  const topNamedKeys = globalKeys.filter((key) => !isOthersRegion(key));

  const remapped = topNamedKeys.map((key) => {
    const match = breakdown.find((item) => getRegionKey(item) === key);
    const count = match ? countForRegion(match, ctx) : 0;

    return {
      state: key,
      policyCount: count,
      claimCount: count,
      count,
      percentage: 0,
    } satisfies GeoDistributionStateBreakdown;
  });

  const othersCount = breakdown.reduce((sum, item) => {
    const key = getRegionKey(item);
    if (topNamedKeys.includes(key)) {
      return sum;
    }

    return sum + countForRegion(item, ctx);
  }, 0);

  remapped.push({
    state: GEO_DISTRIBUTION_OTHERS_LABEL,
    policyCount: othersCount,
    claimCount: othersCount,
    count: othersCount,
    percentage: 0,
  });

  const total = remapped.reduce((sum, item) => sum + countForRegion(item, ctx), 0);

  return remapped.map((item) => ({
    ...item,
    percentage: total > 0 ? (countForRegion(item, ctx) / total) * 100 : 0,
  }));
};

const getBreakdownForPoint = (
  point: GeoDistributionDataPoint,
  geoView: GeoDistributionView,
  ctx: GeoDistributionCountContext,
  topNamedStates?: number,
  globalTopStateKeys?: string[],
): GeoDistributionStateBreakdown[] => {
  const breakdown = getBreakdown(point, geoView, ctx);

  if (topNamedStates === undefined) {
    return breakdown;
  }

  const normalized = normalizeBreakdownWithTopNAndOthers(breakdown, topNamedStates, ctx);

  if (!globalTopStateKeys?.length) {
    return normalized;
  }

  return remapBreakdownToGlobalTopStates(normalized, globalTopStateKeys, ctx);
};

const buildInfoText = (periodType: GroupBy, isClaimsChart: boolean): string => {
  const subject = isClaimsChart ? 'claims' : 'policies';

  if (periodType === 'WEEKLY') {
    return `Weekly distribution of ${subject} across top regions`;
  }

  if (periodType === 'QUARTERLY') {
    return `Quarterly distribution of ${subject} across top regions`;
  }

  if (periodType === 'DAILY') {
    return `Daily distribution of ${subject} across top regions`;
  }

  return `Monthly distribution of ${subject} across top regions`;
};

const getRegionOrder = (
  trend: GeoDistributionDataPoint[],
  geoView: GeoDistributionView,
  ctx: GeoDistributionCountContext,
  topNamedStates?: number,
): string[] => {
  if (topNamedStates !== undefined) {
    return buildGlobalTopStateKeys(trend, geoView, topNamedStates, ctx);
  }

  const orderedRegions: string[] = [];

  trend.forEach((point) => {
    getBreakdownForPoint(point, geoView, ctx).forEach((item) => {
      const key = getRegionKey(item);
      if (!orderedRegions.includes(key)) {
        orderedRegions.push(key);
      }
    });
  });

  const othersIndex = orderedRegions.findIndex(isOthersRegion);
  if (othersIndex >= 0) {
    const [others] = orderedRegions.splice(othersIndex, 1);
    orderedRegions.push(others);
  }

  return orderedRegions;
};

export const mapGeoDistributionChartComponentToCard = (
  response: OverviewGeoDistributionChartComponentResponse | undefined,
  geoView: GeoDistributionView = 'STATEWISE',
  topNamedStates?: number,
  componentId?: ChartComponentId.GEO_DISTRIBUTION_POLICIES | ChartComponentId.GEO_DISTRIBUTION_CLAIMS,
  claimStatus?: GeoDistributionClaimStatus,
): GeoDistributionData => {
  const isClaimsChart = componentId === ChartComponentId.GEO_DISTRIBUTION_CLAIMS;
  const trend = getTrendPoints(response, componentId);

  if (!trend?.length) {
    return {
      ...emptyGeoDistributionData,
      title: response?.label || emptyGeoDistributionData.title,
    };
  }

  const useStatusBreakdown =
    isClaimsChart &&
    Boolean(claimStatus) &&
    trend.some((point) => hasStatusBreakdownData(getBreakdown(point, geoView, createCountContext(true))));
  const countContext = createCountContext(isClaimsChart, claimStatus, useStatusBreakdown);

  const periodType = trend[0].periodType;
  const regionOrder = getRegionOrder(trend, geoView, countContext, topNamedStates);
  const globalTopStateKeys =
    topNamedStates !== undefined ? regionOrder : undefined;

  const categories = trend.map((item) =>
    formatGraphPeriodLabel(periodType, item.periodStart, item.periodEnd),
  );
  const periodStarts = trend.map((item) => item.periodStart);
  const periodEnds = trend.map((item) => item.periodEnd);
  const totals = trend.map((point) => getTotalCount(point, countContext, geoView));

  const series = regionOrder.map((regionKey, index) => ({
    name: regionKey,
    legendLabel: formatGeoLegendLabel(regionKey),
    color: getGeoDistributionStackColor(index),
    percentages: trend.map((point) => {
      const breakdown = getBreakdownForPoint(
        point,
        geoView,
        countContext,
        topNamedStates,
        globalTopStateKeys,
      );
      const total =
        getTotalCount(point, countContext, geoView) ||
        breakdown.reduce((sum, item) => sum + countForRegion(item, countContext), 0);
      const match = breakdown.find((item) => getRegionKey(item) === regionKey);
      return match ? getRegionPercentage(match, total, countContext) : 0;
    }),
    counts: trend.map((point) => {
      const breakdown = getBreakdownForPoint(
        point,
        geoView,
        countContext,
        topNamedStates,
        globalTopStateKeys,
      );
      const match = breakdown.find((item) => getRegionKey(item) === regionKey);
      return match ? countForRegion(match, countContext) : 0;
    }),
  }));

  return {
    title: response?.label || emptyGeoDistributionData.title,
    categories,
    periodStarts,
    periodEnds,
    periodType,
    totals,
    series,
    infoText: buildInfoText(periodType, isClaimsChart),
    hasData: trend.length > 0 && series.length > 0,
  };
};

export const filterGeoDistributionDataByStates = (
  data: GeoDistributionData,
  selectedStates: string[],
): GeoDistributionData => {
  if (selectedStates.length === 0) {
    return data;
  }

  const normalizedSelection = selectedStates.map(normalizeGeoRegionKey);
  const filteredSeries = data.series.filter((item) => normalizedSelection.includes(item.name));
  if (filteredSeries.length === 0) {
    return { ...data, series: [], hasData: false };
  }

  const totals = data.categories.map((_, index) =>
    filteredSeries.reduce((sum, item) => sum + (item.counts[index] ?? 0), 0),
  );

  const series = filteredSeries.map((item) => ({
    ...item,
    percentages: item.counts.map((count, index) => {
      const total = totals[index] ?? 0;
      return total > 0 ? (count / total) * 100 : 0;
    }),
  }));

  return {
    ...data,
    totals,
    series,
    hasData: series.length > 0,
  };
};
