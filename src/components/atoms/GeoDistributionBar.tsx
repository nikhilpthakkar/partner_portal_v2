'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import type { GeoDistributionSeries } from '@/lib/types/overview';
import { formatNumber, getVar } from '@/lib/utils';
import {
  OVERVIEW_CHART_AXIS_TOOLTIP_BASE,
  buildOverviewChartAxisTooltipHtml,
  buildOverviewChartTooltipLegendRow,
  buildOverviewChartTooltipTextRow,
} from '@/lib/utils/overview/chartTooltip.utils';

type GeoDistributionBarProps = {
  categories: string[];
  totals: number[];
  series: GeoDistributionSeries[];
  height: number | string;
  barWidth?: number;
  borderRadius?: number;
  showLegend?: boolean;
  showYAxisLabel?: boolean;
  valueMode?: 'percentage' | 'count';
};

export default function GeoDistributionBar({
  categories,
  totals,
  series,
  height = 400,
  barWidth = 40,
  borderRadius = 8,
  showLegend = true,
  showYAxisLabel = true,
  valueMode = 'percentage',
}: GeoDistributionBarProps) {
  const isCountMode = valueMode === 'count';
  const barGap = '25%';
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  const fontColor = getVar('--color-geo-distribution-font', '#0a0a0a');
  const labelColor = getVar('--color-geo-distribution-label', '#737373');
  const fontFamily = getVar('--font-geo-distribution-font', 'EuclidCircular, Inter, sans-serif');
  const fontSize = Number(getVar('--text-geo-distribution-font-size-axis-label', '12'));
  const fontSizeLegend = Number(getVar('--text-geo-distribution-font-size-legend', '12'));
  const fontWeight = Number(getVar('--text-geo-distribution-font-weight', '400'));

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.getInstanceByDom(chartRef.current) ?? echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const stackedSeries = series.map((item, index) => {
      const isBottom = index === 0;
      const isTop = index === series.length - 1;
      const seriesLabel = item.legendLabel ?? item.name;

      return {
        name: seriesLabel,
        type: 'bar' as const,
        stack: 'geo',
        xAxisIndex: 1,
        barWidth,
        barGap,
        data: isCountMode ? item.counts : item.percentages,
        itemStyle: {
          color: item.color,
          borderRadius: isSingleSeriesBorder(isTop, isBottom, borderRadius),
        },
        emphasis: {
          focus: 'series' as const,
        },
      };
    });

    const option: EChartsOption = {
      grid: {
        left: showYAxisLabel ? 48 : 16,
        right: 16,
        top: 32,
        bottom: showLegend ? 48 : 24,
        containLabel: false,
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
        },
        {
          type: 'category',
          data: categories,
          position: 'bottom',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: labelColor,
            fontFamily,
            fontSize,
            fontWeight,
            margin: 12,
          },
        },
      ],
      yAxis: {
        type: 'value',
        min: 0,
        ...(isCountMode ? {} : { max: 100 }),
        axisLabel: {
          show: showYAxisLabel,
          color: labelColor,
          fontFamily,
          fontSize,
          fontWeight,
          formatter: (value) => (isCountMode ? formatNumber(Number(value)) : `${value}%`),
        },
        splitLine: {
          lineStyle: { color: '#E5E7EB' },
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        ...OVERVIEW_CHART_AXIS_TOOLTIP_BASE,
        formatter: (params) => {
          if (!Array.isArray(params)) return '';

          const title = String(params[0]?.name ?? '');
          const rows = params
            .filter((item) => typeof item.seriesName === 'string' && item.seriesName !== 'Top Label')
            .map((item) => {
              const seriesIndex = series.findIndex(
                (entry) => (entry.legendLabel ?? entry.name) === item.seriesName,
              );
              const displayName =
                seriesIndex >= 0
                  ? series[seriesIndex].legendLabel ?? series[seriesIndex].name
                  : item.seriesName;
              const count =
                seriesIndex >= 0 ? series[seriesIndex].counts[item.dataIndex ?? 0] ?? 0 : 0;
              const percentage =
                seriesIndex >= 0
                  ? series[seriesIndex].percentages[item.dataIndex ?? 0] ?? 0
                  : 0;

              const valueLabel = isCountMode
                ? formatNumber(count)
                : `${Number(item.value ?? 0).toFixed(1)}% (${formatNumber(count)})`;
              const suffix = isCountMode ? ` (${percentage.toFixed(1)}%)` : '';

              return buildOverviewChartTooltipLegendRow(
                String(displayName),
                `${valueLabel}${suffix}`,
                typeof item.color === 'string' ? item.color : undefined,
              );
            })
            .join('');

          const total = totals[params[0]?.dataIndex ?? 0] ?? 0;

          return buildOverviewChartAxisTooltipHtml(
            title,
            `${buildOverviewChartTooltipTextRow('Total', formatNumber(total))}${rows}`,
          );
        },
      },
      series: [
        ...stackedSeries,
        {
          name: 'Top Label',
          type: 'bar',
          data: isCountMode ? totals : totals.map(() => 100),
          xAxisIndex: 1,
          barWidth,
          barGap: '-100%',
          itemStyle: {
            color: 'transparent',
          },
          tooltip: {
            show: false,
          },
          silent: true,
          z: 100,
          label: {
            show: true,
            position: 'top',
            distance: 8,
            fontFamily,
            fontSize: 12,
            fontWeight: 400,
            color: fontColor,
            formatter: (params) => {
              const total = totals[params.dataIndex ?? 0] ?? 0;
              return total > 0 ? formatNumber(total) : '';
            },
          },
        },
      ],
      legend: showLegend
        ? {
            bottom: 0,
            icon: 'roundRect',
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 20,
            textStyle: {
              color: fontColor,
              fontFamily,
              fontSize: fontSizeLegend,
              fontWeight,
            },
            data: series.map((item) => item.legendLabel ?? item.name),
          }
        : { show: false },
    };

    chart.setOption(option, {
      notMerge: false,
      lazyUpdate: true,
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [
    categories,
    totals,
    series,
    height,
    barWidth,
    borderRadius,
    showLegend,
    showYAxisLabel,
    valueMode,
    fontColor,
    labelColor,
    fontFamily,
    fontSize,
    fontSizeLegend,
    fontWeight,
  ]);

  useEffect(() => {
    chartInstanceRef.current?.resize();
  }, [height]);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
}

const isSingleSeriesBorder = (
  isTop: boolean,
  isBottom: boolean,
  borderRadius: number,
): number | [number, number, number, number] => {
  if (isTop && isBottom) {
    return borderRadius;
  }

  if (isTop) {
    return [borderRadius, borderRadius, 0, 0];
  }

  if (isBottom) {
    return [0, 0, borderRadius, borderRadius];
  }

  return 0;
};
