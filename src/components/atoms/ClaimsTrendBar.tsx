'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { ECElementEvent, EChartsOption } from 'echarts';
import type { BarClickPayload } from '@/lib/types/overview';
import { formatIndianShort, formatNumber, getVar, roundUpToNiceNumber } from '@/lib/utils';

type ClaimsBarChartProps = {
  categories: string[];
  totalClaims?: number[];
  paidAmount?: number[];
  showPaidAmount?: boolean;
  paid?: number[];
  inprogress?: number[];
  rejected?: number[];
  closed?: number[];
  periodStarts: string[];
  periodEnds: string[];
  height: number | string;
  barWidth: number;
  borderRadius: number;
  showLegend?: boolean;
  showYAxisLabel?: boolean;
  legendSeries?: string[];
  onBarClick?: (data: BarClickPayload | null) => void;
};

export default function ClaimsTrendBar({
  categories,
  totalClaims,
  paidAmount,
  showPaidAmount = false,
  paid,
  inprogress,
  rejected,
  closed,
  periodStarts,
  periodEnds,
  height = 400,
  barWidth = 16,
  borderRadius = 5,
  showLegend = true,
  showYAxisLabel = true,
  legendSeries,
  onBarClick,
}: ClaimsBarChartProps) {
  const barGap = '25%';
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const onBarClickRef = useRef<((data: BarClickPayload | null) => void) | null>(onBarClick ?? null);
  const periodStartsRef = useRef<string[]>(periodStarts);
  const periodEndsRef = useRef<string[]>(periodEnds);

  const paidColor = getVar('--color-claims-trend-paid-bar', '#0d9488');
  const inprogressColor = getVar('--color-claims-trend-in-progress-bar', '#fbbf24');
  const rejectedColor = getVar('--color-claims-trend-rejected-bar', '#ea580c');
  const closedColor = getVar('--color-claims-trend-closed-bar', '#164e63');
  const hoverBorderColor = getVar('--color-claims-trend-bar-border-hover', '#e5e5e5');
  const hoverBorderWidth = Number(getVar('--border-claims-trend-bar-hover', '5'));

  const fontColor = getVar('--color-claims-trend-font', '#000000');
  const labelColor = getVar('--color-gwp-trend-label', '#737373');
  const fontFamily = getVar('--font-gwp-trend-font', 'EuclidCircular, Inter, sans-serif');
  const fontSize = Number(getVar('--text-claims-trend-font-size-axis-label', '11'));
  const fontSizeLegend = Number(getVar('--text-claims-trend-font-size-legend', '12'));
  const fontWeight = Number(getVar('--text-claims-trend-font-weight', '400'));

  useEffect(() => {
    onBarClickRef.current = onBarClick ?? null;
  }, [onBarClick]);

  useEffect(() => {
    periodStartsRef.current = periodStarts;
    periodEndsRef.current = periodEnds;
  }, [periodStarts, periodEnds]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.getInstanceByDom(chartRef.current) ?? echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const handleClick = (params: ECElementEvent) => {
      if (
        params.componentType !== 'series' ||
        typeof params.seriesName !== 'string' ||
        typeof params.name !== 'string' ||
        typeof params.value !== 'number'
      ) {
        return;
      }

      const event = params.event?.event;
      if (!(event instanceof MouseEvent)) return;

      const rect = chartRef.current?.getBoundingClientRect();
      if (!rect) return;

      const seriesMap: Record<string, string> = {
        Paid: 'paid',
        'In Progress': 'inprogress',
        Rejected: 'rejected',
        Closed: 'closed',
      };

      const index = params.dataIndex;

      onBarClickRef.current?.({
        state: params.seriesName,
        name: params.name,
        actionLabel: 'View claims data',
        statusValue: seriesMap[params.seriesName],
        value: params.value,
        dateRange: {
          from: new Date(periodStartsRef.current?.[index]),
          to: new Date(periodEndsRef.current?.[index]),
        },
        clientX: event.clientX,
        clientY: event.clientY,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
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

    const isSingleSeries =
      Number(paid?.some((v) => v > 0)) +
        Number(inprogress?.some((v) => v > 0)) +
        Number(rejected?.some((v) => v > 0)) +
        Number(closed?.some((v) => v > 0)) +
        Number(totalClaims?.some((v) => v > 0)) ===
      1;

    const activeSeries: string[] = [];

    if (inprogress?.some((v) => v > 0)) activeSeries.push('In Progress');
    if (paid?.some((v) => v > 0)) activeSeries.push('Paid');
    if (closed?.some((v) => v > 0)) activeSeries.push('Closed');
    if (rejected?.some((v) => v > 0)) activeSeries.push('Rejected');

    const yAxisMax = roundUpToNiceNumber(
      Math.max(
        ...(totalClaims ?? []),
        ...(inprogress ?? []),
        ...(rejected ?? []),
        ...(closed ?? []),
        ...(paid ?? []),
        1,
      ),
    );

    const option: EChartsOption = {
      grid: {
        left: 0,
        right: 0,
        top: 70,
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
        show: !isSingleSeries,
        trigger: 'axis',
        axisPointer: {
          type: 'none',
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
          const visibleParams = seriesParams;

          const total = visibleParams.reduce((sum, param) => {
            if (typeof param.value === 'number') return sum + param.value;
            if (Array.isArray(param.value)) return sum + Number(param.value[1] ?? 0);
            return sum + Number(param.value ?? 0);
          }, 0);

          const order = ['In Progress', 'Paid', 'Closed', 'Rejected'] as const;

          const rows = order
            .map((label) => visibleParams.find((param) => param.seriesName === label))
            .filter(Boolean)
            .map((param) => {
              const rawValue = param?.value;
              const value =
                typeof rawValue === 'number'
                  ? rawValue
                  : Array.isArray(rawValue)
                    ? Number(rawValue[1] ?? 0)
                    : Number(rawValue ?? 0);

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
                    background:${param?.color ?? 'var(--color-claims-trend-bar)'};
                    display:inline-block;
                  "></span>
                  <span style="color:var(--color-claims-trend-bar-tooltip-text);">
                    ${param?.seriesName} : ${value}
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
              <span style="font-weight:var(--font-weight-claims-trend-tooltip-medium);">${date}</span>
              <span style="font-weight:var(--font-weight-claims-trend-tooltip-regular);">Total : ${total}</span>
              ${rows.join('')}
            </div>
          `;
        },
      },

      yAxis: {
        type: 'value',
        axisLabel: {
          show: showYAxisLabel,
          color: labelColor,
          fontFamily,
          fontSize,
          fontWeight,
          formatter: (value) => formatIndianShort(Number(value)),
        },
        max: yAxisMax,
        splitLine: {
          lineStyle: { color: '#E5E7EB' },
        },
      },

      series: [
        {
          name: 'Rejected',
          type: 'bar',
          stack: 'claims',
          xAxisIndex: 1,
          barWidth,
          data: rejected,
          barGap,
          itemStyle: {
            color: rejectedColor,
            borderRadius: isSingleSeries ? borderRadius : [0, 0, borderRadius, borderRadius],
          },
          label: {
            show: isSingleSeries,
            position: 'top',
            fontSize: fontSizeLegend,
            fontWeight,
            color: fontColor,
            fontFamily,
            formatter: (params) => formatNumber(Number(params.value)),
          },
          emphasis: {
            itemStyle: {
              borderColor: isSingleSeries ? 'transparent' : hoverBorderColor,
              borderWidth: isSingleSeries ? 0 : hoverBorderWidth,
              borderType: 'dotted',
            },
            label: {
              show: isSingleSeries,
            },
          },
        },
        {
          name: 'Paid',
          type: 'bar',
          stack: 'claims',
          xAxisIndex: 1,
          barWidth,
          data: paid,
          barGap,
          itemStyle: {
            color: paidColor,
            borderRadius: isSingleSeries ? borderRadius : 0,
          },
          label: {
            show: isSingleSeries,
            position: 'top',
            fontSize: fontSizeLegend,
            fontWeight,
            color: fontColor,
            fontFamily,
            formatter: (params) => formatNumber(Number(params.value)),
          },
          emphasis: {
            itemStyle: {
              borderColor: isSingleSeries ? 'transparent' : hoverBorderColor,
              borderWidth: isSingleSeries ? 0 : hoverBorderWidth,
              borderType: 'dotted',
            },
            label: {
              show: isSingleSeries,
            },
          },
        },
        {
          name: 'Closed',
          type: 'bar',
          stack: 'claims',
          xAxisIndex: 1,
          barWidth,
          data: closed,
          barGap,
          itemStyle: {
            color: closedColor,
            borderRadius: isSingleSeries ? borderRadius : 0,
          },
          label: {
            show: isSingleSeries,
            position: 'top',
            fontSize: fontSizeLegend,
            fontWeight,
            color: fontColor,
            fontFamily,
            formatter: (params) => formatNumber(Number(params.value)),
          },
          emphasis: {
            itemStyle: {
              borderColor: isSingleSeries ? 'transparent' : hoverBorderColor,
              borderWidth: isSingleSeries ? 0 : hoverBorderWidth,
              borderType: 'dotted',
            },
            label: {
              show: isSingleSeries,
            },
          },
        },
        {
          name: 'In Progress',
          type: 'bar',
          stack: 'claims',
          xAxisIndex: 1,
          barWidth,
          data: inprogress,
          barGap,
          itemStyle: {
            color: inprogressColor,
            borderRadius: isSingleSeries ? borderRadius : [borderRadius, borderRadius, 0, 0],
          },
          label: {
            show: false,
            position: 'top',
            fontSize: fontSizeLegend,
            fontWeight,
            color: fontColor,
            fontFamily,
            formatter: (params): string =>
              isSingleSeries
                ? String(params.value ?? '')
                : String(totalClaims?.[params.dataIndex] ?? 0),
          },
          emphasis: {
            itemStyle: {
              borderColor: isSingleSeries ? 'transparent' : hoverBorderColor,
              borderWidth: isSingleSeries ? 0 : hoverBorderWidth,
              borderType: 'dotted',
            },
            label: {
              show: false,
            },
          },
        },
        {
          name: 'Top Label',
          type: 'bar',
          data: totalClaims,
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
          zlevel: 1,
          label: {
            show: true,
            position: 'top',
            distance: 10,
            fontFamily,
            formatter: (params) => {
              const claimCount = Number(totalClaims?.[params.dataIndex] ?? 0);
              const value = Number(paidAmount?.[params.dataIndex] ?? 0);

              if (claimCount <= 0 && (!showPaidAmount || value <= 0)) return '';
              if (!showPaidAmount || value <= 0) return `{count|${formatNumber(claimCount)}}`;

              return `{count|${formatNumber(claimCount)}}\n{amount|₹${formatIndianShort(value)}}`;
            },
            rich: {
              count: {
                fontSize: 16,
                lineHeight: 20,
                fontWeight: 500,
                fontFamily,
                color: fontColor,
                align: 'center',
                padding: [0, 0, 2, 0],
              },
              amount: {
                fontSize: 12,
                lineHeight: 16,
                fontWeight: 400,
                fontFamily,
                color: fontColor,
                align: 'center',
              },
            },
          },
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
              fontWeight,
            },
            data: legendSeries ?? (isSingleSeries ? activeSeries.slice(0, 1) : activeSeries),
          }
        : { show: false },
    };

    chartInstanceRef.current.setOption(option, {
      notMerge: false,
      lazyUpdate: true,
    });
  }, [
    categories,
    totalClaims,
    paidAmount,
    showPaidAmount,
    paid,
    inprogress,
    rejected,
    closed,
    legendSeries,
    showLegend,
    barWidth,
    borderRadius,
    paidColor,
    inprogressColor,
    rejectedColor,
    closedColor,
    hoverBorderColor,
    hoverBorderWidth,
    fontSize,
    fontSizeLegend,
    fontWeight,
    fontColor,
    fontFamily,
    labelColor,
    showYAxisLabel,
  ]);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
}
