import type { AvgPremiumTrendData } from '@/lib/types/overview';
import type { AvgPremiumTrendDataPoint } from '@/lib/types/overview/graphs';
import type { OverviewAvgPremiumChartComponentResponse } from '@/lib/types/overview/components';
import { formatGraphPeriodLabel } from '@/lib/utils/graphDateFormats';

const emptyAvgPremiumTrendData: AvgPremiumTrendData = {
  title: 'Average premium trend',
  categories: [],
  periodStarts: [],
  periodEnds: [],
  avgPremium: [],
  infoText: '',
  hasData: false,
};

const getTrendPoints = (
  response: OverviewAvgPremiumChartComponentResponse | undefined,
): AvgPremiumTrendDataPoint[] | undefined =>
  response?.payload?.data?.averagePremiumTrend;

const getAvgPremiumAmount = (item: AvgPremiumTrendDataPoint): number =>
  item.averagePremium?.amount ?? 0;

export const mapAvgPremiumChartComponentToCard = (
  response: OverviewAvgPremiumChartComponentResponse | undefined,
): AvgPremiumTrendData => {
  const trend = getTrendPoints(response);

  if (!trend?.length) {
    return {
      ...emptyAvgPremiumTrendData,
      title: response?.label || emptyAvgPremiumTrendData.title,
    };
  }

  const periodType = trend[0].periodType;
  const periodStarts = trend.map((item) => item.periodStart);
  const periodEnds = trend.map((item) => item.periodEnd);
  const avgPremium = trend.map(getAvgPremiumAmount);
  const hasData = trend.length > 0;
  const categories = trend.map((item) =>
    formatGraphPeriodLabel(periodType, item.periodStart, item.periodEnd),
  );

  const infoText =
    periodType === 'WEEKLY'
      ? 'Weekly trend of average premium across issued policies'
      : periodType === 'MONTHLY'
        ? 'Monthly trend of average premium across issued policies'
        : periodType === 'QUARTERLY'
          ? 'Quarterly trend of average premium across issued policies'
          : 'Daily trend of average premium across issued policies';

  return {
    title: response?.label || emptyAvgPremiumTrendData.title,
    categories,
    periodStarts,
    periodEnds,
    avgPremium,
    infoText,
    hasData,
  };
};
