'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { formatIndianShort, getVar, roundUpToNiceNumber } from '@/lib/utils';
import {
  OVERVIEW_CHART_AXIS_TOOLTIP_BASE,
  buildOverviewChartAxisTooltipHtml,
  buildOverviewChartTooltipLegendRow,
} from '@/lib/utils/overview/chartTooltip.utils';
import { AVG_SI_TREND_LEGEND_LABEL } from '@/lib/constants/overview.constants';

type AvgSiTrendLineProps = {
  categories: string[];
  avgSumInsured: number[];
  height?: number | string;
  showLegend?: boolean;
  legendLabel?: string;
  showYAxisLabel?: boolean;
};

export default function AvgSiTrendLine({
  categories,
  avgSumInsured,
  height = 280,
  showLegend = true,
  legendLabel = AVG_SI_TREND_LEGEND_LABEL,
  showYAxisLabel = true,
}: AvgSiTrendLineProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  const lineColor = getVar('--color-avg-si-trend-line', '#3b82f6');
  const legendColor = getVar('--color-avg-si-trend-legend', '#3b82f6');
  const gridColor = getVar('--color-avg-si-trend-grid', '#e5e7eb');
  const axisPadding =
    Number.parseFloat(getVar('--spacing-avg-si-trend-axis-padding', '40')) || 40;
  const fontColor = getVar('--color-avg-si-trend-font', '#0a0a0a');
  const labelColor = getVar('--color-avg-si-trend-label', '#737373');
  const fontFamily = getVar('--font-avg-si-trend-font', 'EuclidCircular, Inter, sans-serif');
  const fontSize = Number(getVar('--text-avg-si-trend-font-size-axis-label', '12'));
  const fontSizeLegend = Number(getVar('--text-avg-si-trend-font-size-legend', '12'));
  const fontWeight = Number(getVar('--text-avg-si-trend-font-weight', '400'));

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.getInstanceByDom(chartRef.current) ?? echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const axisMax = roundUpToNiceNumber(Math.max(...avgSumInsured, 1));

    const option: EChartsOption = {
      grid: {
        left: showYAxisLabel ? axisPadding : 0,
        right: 16,
        top: 28,
        bottom: showLegend ? 70 : 48,
      },
      xAxis: {
        type: 'category',
        data: categories,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          interval: 0,
          hideOverlap: false,
          color: labelColor,
          fontFamily,
          fontSize,
          fontWeight,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: axisMax,
        axisLabel: {
          show: showYAxisLabel,
          color: labelColor,
          fontFamily,
          fontSize,
          fontWeight,
          formatter: (value) => formatIndianShort(Number(value)),
        },
        splitLine: {
          lineStyle: { color: gridColor },
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: { color: lineColor, width: 1, opacity: 0.35 },
        },
        ...OVERVIEW_CHART_AXIS_TOOLTIP_BASE,
        formatter: (params) => {
          const seriesParams = Array.isArray(params) ? params : [params];
          const point = seriesParams[0];
          const value = Number(point?.value ?? 0);
          const title = String(point?.name ?? '');

          return buildOverviewChartAxisTooltipHtml(
            title,
            buildOverviewChartTooltipLegendRow(legendLabel, formatIndianShort(value), lineColor),
          );
        },
      },
      series: [
        {
          name: legendLabel,
          type: 'line',
          data: avgSumInsured,
          smooth: true,
          connectNulls: true,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 12,
          lineStyle: { color: lineColor, width: 2 },
          itemStyle: {
            color: lineColor,
            borderColor: lineColor,
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'top',
            distance: 8,
            color: fontColor,
            fontFamily,
            fontSize: fontSizeLegend,
            fontWeight,
            formatter: (params) => formatIndianShort(Number(params.value)),
          },
          emphasis: {
            focus: 'series',
            scale: true,
          },
        },
      ],
      legend: showLegend
        ? {
            bottom: 0,
            icon: 'roundRect',
            itemWidth: 8,
            itemHeight: 8,
            itemGap: 16,
            textStyle: {
              color: fontColor,
              fontFamily,
              fontSize: fontSizeLegend,
              fontWeight,
            },
            data: [
              {
                name: legendLabel,
                itemStyle: { color: legendColor },
              },
            ],
          }
        : { show: false },
    };

    chartInstanceRef.current.setOption(option, {
      notMerge: false,
      lazyUpdate: true,
    });
  }, [
    avgSumInsured,
    axisPadding,
    categories,
    fontColor,
    fontSize,
    fontSizeLegend,
    fontWeight,
    gridColor,
    labelColor,
    legendColor,
    legendLabel,
    lineColor,
    showLegend,
    showYAxisLabel,
  ]);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
}
