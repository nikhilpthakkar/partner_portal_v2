import type { GwpTrendData as GwpTrendCardData } from '@/lib/types/overview';
import type { OverviewGwpChartComponentResponse } from '@/lib/types/overview/components';
import {
  GWP_POLICY_COUNT_TREND_LABEL,
  normalizeGrossPremiumLabel,
} from '@/lib/constants/overviewComponents.constants';
import { formatGraphPeriodLabel } from '@/lib/utils/graphDateFormats';

const emptyGwpTrendData: GwpTrendCardData = {
  title: GWP_POLICY_COUNT_TREND_LABEL,
  categories: [],
  periodStarts: [],
  periodEnds: [],
  totalGwp: [],
  policyCount: [],
  infoText: '',
  hasData: false,
};

export const mapGwpChartComponentToCard = (
  response: OverviewGwpChartComponentResponse | undefined,
): GwpTrendCardData => {
  if (!response?.payload?.data?.gwpTrend?.length) {
    return emptyGwpTrendData;
  }

  const { gwpTrend } = response.payload.data;
  const periodType = gwpTrend[0].periodType;
  const periodStarts = gwpTrend.map((item) => item.periodStart);
  const periodEnds = gwpTrend.map((item) => item.periodEnd);
  const totalGwp = gwpTrend.map((item) => item.gwp.amount);
  const policyCount = gwpTrend.map((item) => item.metrics.policyCount);
  const hasData = totalGwp.some((amount) => amount > 0);
  const categories = gwpTrend.map((item) =>
    formatGraphPeriodLabel(periodType, item.periodStart, item.periodEnd),
  );

  const infoText =
    periodType === 'WEEKLY'
      ? 'Weekly trends of your gross premium'
      : periodType === 'MONTHLY'
        ? 'Monthly trends of your gross premium'
        : periodType === 'QUARTERLY'
          ? 'Quarterly trends of your gross premium'
          : 'Daily trends of your gross premium & Policy count trend';

  return {
    title: normalizeGrossPremiumLabel(response.label || emptyGwpTrendData.title),
    categories,
    periodStarts,
    periodEnds,
    totalGwp,
    policyCount,
    infoText,
    hasData,
  };
};

/** @deprecated Use mapGwpChartComponentToCard — GWP trend is fetched via overview CHART component API. */
export const mapGwpTrendApiToCard = mapGwpChartComponentToCard;
