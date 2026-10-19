import {
  KpiComponentId,
  GROSS_PREMIUM_LABEL,
  normalizeGrossPremiumLabel,
} from '@/lib/constants/overviewComponents.constants';
import type { MetricCardData } from '@/lib/types/overview';
import type { OverviewKpiComponentResponse } from '@/lib/types/overview/components';
import { formatNumber } from '@/lib/utils';
import { CURRENCY_UNIT_MAP } from '@/lib/constants/global.constants';
import {
  getKpiInfoText,
  normalizeKpiComponentId,
} from '@/lib/utils/overview/overviewChart.utils';

function getKpiDisplayLabel(componentId: string, apiLabel: string): string {
  const normalizedComponentId = normalizeKpiComponentId(componentId);

  if (normalizedComponentId === KpiComponentId.GROSS_WRITTEN_PREMIUM) {
    return GROSS_PREMIUM_LABEL;
  }

  return normalizeGrossPremiumLabel(apiLabel);
}

function formatKpiValue(response: OverviewKpiComponentResponse): string {
  const { value, currency, unit } = response.payload;

  if (currency) {
    return `${CURRENCY_UNIT_MAP[currency] ?? ''}${formatNumber(value)}`;
  }

  if (unit === 'percentage') {
    if (value === 0) {
      return formatNumber(value);
    }

    return `${formatNumber(value, 1)}${CURRENCY_UNIT_MAP.percentage ?? '%'}`;
  }

  return formatNumber(value);
}

export function mapKpiComponentsToCards(
  responses: OverviewKpiComponentResponse[] | undefined,
  kpiIds: string[],
): MetricCardData[] {
  if (!responses?.length || !kpiIds.length) {
    return [];
  }

  const responseById = new Map(
    responses.map((response) => [normalizeKpiComponentId(response.componentId), response]),
  );

  return kpiIds.flatMap((componentId) => {
    const response = responseById.get(normalizeKpiComponentId(componentId));
    if (!response) {
      return [];
    }

    const infoText = getKpiInfoText(componentId);

    return [
      {
        componentId,
        label: getKpiDisplayLabel(componentId, response.label),
        value: formatKpiValue(response),
        infoText,
      },
    ];
  });
}
