export const OVERVIEW_CHART_AXIS_TOOLTIP_BASE = {
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: 0,
  extraCssText: `
    box-shadow: none;
    border: none;
    color: var(--color-claims-trend-bar-tooltip-text);
    overflow: visible;
  `,
};

export const OVERVIEW_CHART_INFO_TOOLTIP_CLASS =
  'bg-gwp-trend-tooltip text-gwp-trend-tooltip-text rounded-gwp-trend-tooltip';

export const OVERVIEW_CHART_INFO_TOOLTIP_ARROW = 'fill-gwp-trend-tooltip';

export const OVERVIEW_CHART_INFO_TOOLTIP_ICON = 'text-gwp-trend-icon h-4 w-4';

export const buildOverviewChartAxisTooltipHtml = (title: string, rows: string): string => `
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
    <span style="font-weight:var(--font-weight-claims-trend-tooltip-medium); color:var(--color-claims-trend-bar-tooltip-text);">${title}</span>
    ${rows}
  </div>
`;

export const buildOverviewChartTooltipLegendRow = (
  label: string,
  value: string,
  color?: string,
): string => {
  const swatch = color
    ? `<span style="
        width:var(--size-claims-trend-tooltip-swatch);
        height:var(--size-claims-trend-tooltip-swatch);
        border-radius:var(--radius-claims-trend-tooltip-swatch);
        background:${color};
        display:inline-block;
      "></span>`
    : '';

  return `
    <div style="
      display:flex;
      align-items:center;
      gap:var(--spacing-claims-trend-tooltip-legend-gap);
      font-family:'EuclidCircular';
    ">
      ${swatch}
      <span style="color:var(--color-claims-trend-bar-tooltip-text);">${label}: ${value}</span>
    </div>
  `;
};

export const buildOverviewChartTooltipTextRow = (label: string, value: string): string =>
  `<span style="font-weight:var(--font-weight-claims-trend-tooltip-regular); color:var(--color-claims-trend-bar-tooltip-text);">${label}: ${value}</span>`;
