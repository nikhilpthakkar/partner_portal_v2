import type { AvgSiTrendData } from '@/lib/types/overview';
import type { AvgSiTrendDataPoint } from '@/lib/types/overview/graphs';
import type { OverviewAvgSiTrendChartComponentResponse } from '@/lib/types/overview/components';
import { formatGraphPeriodLabel } from '@/lib/utils/graphDateFormats';
import type { GroupBy } from '@/lib/types/overview';

const emptyAvgSiTrendData: AvgSiTrendData = {
  title: 'Average Sum Insured Trend',
  categories: [],
  periodStarts: [],
  periodEnds: [],
  avgSumInsured: [],
  infoText: '',
  hasData: false,
};

const getTrendPoints = (
  response: OverviewAvgSiTrendChartComponentResponse | undefined,
): AvgSiTrendDataPoint[] | undefined => {
  const data = response?.payload?.data;
  if (!data) return undefined;

  return data.averageSiTrend ?? data.averageSumInsuredTrend ?? data.avgSiTrend;
};

const getAvgSumInsuredAmount = (item: AvgSiTrendDataPoint): number =>
  item.averageSumInsured?.amount ??
  item.averageSi?.amount ??
  item.avgSumInsured?.amount ??
  0;

const buildInfoText = (periodType: GroupBy): string => {
  if (periodType === 'WEEKLY') {
    return 'Weekly trend of average sum insured across issued policies';
  }

  if (periodType === 'QUARTERLY') {
    return 'Quarterly trend of average sum insured across issued policies';
  }

  if (periodType === 'DAILY') {
    return 'Daily trend of average sum insured across issued policies';
  }

  return 'Monthly trend of average sum insured across issued policies';
};

export const mapAvgSiChartComponentToCard = (
  response: OverviewAvgSiTrendChartComponentResponse | undefined,
): AvgSiTrendData => {
  const trend = getTrendPoints(response);

  if (!trend?.length) {
    return {
      ...emptyAvgSiTrendData,
      title: response?.label || emptyAvgSiTrendData.title,
    };
  }

  const periodType = trend[0].periodType;
  const periodStarts = trend.map((item) => item.periodStart);
  const periodEnds = trend.map((item) => item.periodEnd);
  const avgSumInsured = trend.map(getAvgSumInsuredAmount);
  const hasData = trend.length > 0 && avgSumInsured.some((value) => value > 0);
  const categories = trend.map((item) =>
    formatGraphPeriodLabel(periodType, item.periodStart, item.periodEnd),
  );

  return {
    title: response?.label || emptyAvgSiTrendData.title,
    categories,
    periodStarts,
    periodEnds,
    avgSumInsured,
    infoText: buildInfoText(periodType),
    hasData,
  };
};
