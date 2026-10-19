'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { ECElementEvent, EChartsOption } from 'echarts';
import { formatIndianShort, formatNumber, getVar, roundUpToNiceNumber } from '@/lib/utils';
import { GROSS_PREMIUM_CURRENCY_LEGEND_LABEL } from '@/lib/constants/overviewComponents.constants';
import { BarClickPayload } from '@/lib/types/overview';

type GWPBarChartProps = {
  categories: string[];
  totalGWP: number[];
  policyCount: number[];
  height?: number | string;
  barWidth?: number;
  borderRadius?: number;
  showLegend?: boolean;
  legendLabel?: string;
  showYAxisLabel?: boolean;
  onBarClick?: (data: BarClickPayload) => void;
};

export default function GWPTrendBar({
  categories,
  totalGWP,
  policyCount,
  height = 400,
  barWidth = 100,
  borderRadius = 15,
  showLegend = true,
  legendLabel,
  showYAxisLabel = true,
  onBarClick,
}: GWPBarChartProps) {
  const barGap = '25%';
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const onBarClickRef = useRef(onBarClick);

  const barColor = getVar('--color-gwp-trend-bar', '#ea580c');
  const lineColor = getVar('--color-gwp-trend-line', '#fbbf24');
  const linePointBorderColor = getVar('--color-gwp-trend-line-point-border', '#fbbf24');
  const gridColor = getVar('--color-gwp-trend-grid', '#E5E7EB');
  const axisPadding = Number.parseFloat(getVar('--spacing-gwp-trend-axis-padding', '40')) || 40;

  const fontColor = getVar('--color-gwp-trend-font', '#000000');
  const labelColor = getVar('--color-gwp-trend-label', '#737373');
  const fontFamily = getVar('--font-gwp-trend-font', 'EuclidCircular, Inter, sans-serif');
  const fontSize = Number(getVar('--text-gwp-trend-font-size-axis-label', '9'));
  const fontSizeLegend = Number(getVar('--text-gwp-trend-font-size-legend', '12'));
  const fontWeight = Number(getVar('--text-gwp-trend-font-weight', '400'));

  useEffect(() => {
    onBarClickRef.current = onBarClick;
  }, [onBarClick]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.getInstanceByDom(chartRef.current) ?? echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const handleClick = (params: ECElementEvent) => {
      if (
        params.componentType === 'series' &&
        params.seriesType === 'bar' &&
        typeof params.seriesName === 'string' &&
        typeof params.name === 'string' &&
        typeof params.value === 'number'
      ) {
        const event = params.event?.event;
        if (!(event instanceof MouseEvent)) return;

        const rect = chartRef.current?.getBoundingClientRect();
        if (!rect) return;

        onBarClickRef.current?.({
          state: params.seriesName,
          name: params.name,
          actionLabel: params.name,
          value: params.value,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    chart.on('click', handleClick);

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);

    return () => {
      chart.off('click', handleClick);
      window.removeEventListener('resize', resize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const gwpAxisMax = roundUpToNiceNumber(Math.max(...totalGWP, 1));
    const policyAxisMax = roundUpToNiceNumber(Math.max(...policyCount, 1));
    const barSeriesName = legendLabel ?? GROSS_PREMIUM_CURRENCY_LEGEND_LABEL;
    const lineSeriesName = 'Policy count';

    const option: EChartsOption = {
      grid: {
        left: showYAxisLabel ? axisPadding : 0,
        right: axisPadding,
        top: 20,
        bottom: 70,
      },

      xAxis: [
        {
          type: 'category',
          data: categories,
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
        {
          type: 'category',
          data: categories,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
        },
      ],

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: { color: lineColor, width: 1, opacity: 0.35 },
        },
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        extraCssText: `
          box-shadow: none;
          border: none;
          color: var(--color-claims-trend-bar-tooltip-text);
          overflow: visible;
        `,
        formatter: (params) => {
          const seriesParams = Array.isArray(params) ? params : [params];
          const date = String(seriesParams[0]?.name ?? '');

          const order = [barSeriesName, lineSeriesName];
          const rows = order
            .map((label) => seriesParams.find((param) => param.seriesName === label))
            .filter((param) => Boolean(param))
            .map((param) => {
              const rawValue = param?.value;
              const value =
                typeof rawValue === 'number'
                  ? rawValue
                  : Array.isArray(rawValue)
                    ? Number(rawValue[1] ?? 0)
                    : Number(rawValue ?? 0);

              const displayValue = formatNumber(value);

              return `
                <div style="
                  display:flex;
                  align-items:center;
                  gap:var(--spacing-claims-trend-tooltip-legend-gap);
                  font-family:'EuclidCircular';
                ">
                  <span style="
                    width:var(--size-claims-trend-tooltip-swatch);
                    height:var(--size-claims-trend-tooltip-swatch);
                    border-radius:var(--radius-claims-trend-tooltip-swatch);
                    background:${param?.color ?? 'var(--color-gwp-trend-bar)'};
                    display:inline-block;
                  "></span>
                  <span style="color:var(--color-claims-trend-bar-tooltip-text);">
                    ${param?.seriesName} : ${displayValue}
                  </span>
                </div>
              `;
            });

          return `
            <div style="
              background:var(--color-claims-trend-bar-tooltip-bg);
              color:var(--color-claims-trend-bar-tooltip-text);
              border-radius:var(--radius-claims-trend-tooltip);
              padding:var(--spacing-claims-trend-tooltip-padding-y) var(--spacing-claims-trend-tooltip-padding-x);
              display:flex;
              flex-direction:column;
              align-items:flex-start;
              gap:var(--spacing-claims-trend-tooltip-gap);
              font-family:'EuclidCircular';
              font-size:var(--text-claims-trend-tooltip-font-size);
              line-height:var(--text-claims-trend-tooltip-line-height);
              position:relative;
              overflow:visible;
            ">
              <span style="font-weight:var(--font-weight-claims-trend-tooltip-medium); color:var(--color-claims-trend-bar-tooltip-text);">${date}</span>
              ${rows.join('')}
            </div>
          `;
        },
      },

      yAxis: [
        {
          type: 'value',
          max: gwpAxisMax,
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
        {
          type: 'value',
          position: 'right',
          max: policyAxisMax,
          axisLabel: {
            show: showYAxisLabel,
            color: labelColor,
            fontFamily,
            fontSize,
            fontWeight,
            formatter: (value) => formatIndianShort(Number(value)),
          },
          splitLine: { show: false },
        },
      ],

      series: [
        {
          name: barSeriesName,
          type: 'bar',
          barGap,
          xAxisIndex: 0,
          yAxisIndex: 0,
          barWidth,
          data: totalGWP,
          itemStyle: {
            color: barColor,
            borderRadius,
          },
          label: {
            show: false,
            position: 'top',
            fontSize: fontSizeLegend,
            fontWeight: fontWeight,
            color: fontColor,
            fontFamily,
            formatter: (params) => {
              return formatNumber(Number(params.value));
            },
          },
          z: 1,
        },
        {
          name: lineSeriesName,
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: policyCount,
          smooth: false,
          connectNulls: true,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: lineColor, width: 2 },
          itemStyle: {
            color: lineColor,
            borderColor: linePointBorderColor,
            borderWidth: 1,
          },
          areaStyle: undefined,
          emphasis: {
            focus: 'series',
            scale: true,
          },
          z: 2,
        },
      ],
      legend: showLegend
        ? {
            icon: 'roundRect',
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 20,
            textStyle: {
              color: fontColor,
              fontFamily,
              fontSize: fontSizeLegend,
              fontWeight: fontWeight,
            },
            data: [barSeriesName, lineSeriesName],
          }
        : { show: false },
    };

    chartInstanceRef.current.setOption(option, {
      notMerge: false,
      lazyUpdate: true,
    });
  }, [
    categories,
    totalGWP,
    policyCount,
    barWidth,
    borderRadius,
    barColor,
    lineColor,
    linePointBorderColor,
    gridColor,
    axisPadding,
    showLegend,
    legendLabel,
    fontSize,
    fontWeight,
    fontSizeLegend,
    fontColor,
    showYAxisLabel,
  ]);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
}
