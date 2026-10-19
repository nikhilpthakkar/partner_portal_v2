import { ApiResponse } from '@/lib/types/Global';
import { Metrics, Filters as MetricsFilters } from '@/lib/types/overview';
import { MetricCardData } from '@/lib/types/overview';
import { formatNumber } from '@/lib/utils';
import { CURRENCY_UNIT_MAP } from '@/lib/constants/global.constants';
import {
  GROSS_PREMIUM_LABEL,
  KpiComponentId,
} from '@/lib/constants/overviewComponents.constants';
import { getKpiInfoText } from '@/lib/utils/overview/overviewChart.utils';

export function mapMetricsToCards(
  response: ApiResponse<Metrics, MetricsFilters> | undefined,
): MetricCardData[] {
  if (!response) return [];

  const { data } = response;

  const { policyMetrics, financialMetrics, claimMetrics } = data;

  return [
    {
      label: 'Total policies issued',
      value: formatNumber(policyMetrics.totalPolicies),
      infoText: getKpiInfoText(KpiComponentId.TOTAL_POLICIES_ISSUED),
    },
    {
      label: GROSS_PREMIUM_LABEL,
      value: `${CURRENCY_UNIT_MAP[financialMetrics.gwp.currency] ?? ''}${formatNumber(financialMetrics.gwp.amount)}`,
      infoText: getKpiInfoText(KpiComponentId.GROSS_WRITTEN_PREMIUM),
    },
    // {
    //   label: 'Claim settlement ratio',
    //   value: `${formatNumber(claimMetrics.settlementRatio)}${CURRENCY_UNIT_MAP[claimMetrics.unit] ?? ''}`,
    // },
    {
      label: 'Float balance',
      value: `${CURRENCY_UNIT_MAP[financialMetrics.currentBalance.currency] ?? ''}${formatNumber(financialMetrics.currentBalance.amount)}`,
      infoText: getKpiInfoText(KpiComponentId.FLOAT_BALANCE),
    },
  ];
}
