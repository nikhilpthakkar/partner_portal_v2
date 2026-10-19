import type { GeoDistributionClaimStatusBreakdown } from '@/lib/types/overview/graphs';

export type GeoDistributionView = 'ZONAL' | 'STATEWISE';

export type GeoDistributionClaimStatus = 'IN_PROGRESS' | 'PAID' | 'REJECTED';

export const GEO_DISTRIBUTION_VIEW_TABS = [
  { label: 'Zonal', value: 'ZONAL' },
  { label: 'Statewise', value: 'STATEWISE' },
] as const;

export const GEO_DISTRIBUTION_STATUS_TABS = [
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Rejected', value: 'REJECTED' },
] as const;

export const GEO_DISTRIBUTION_CLAIM_STATUS_API_KEYS = {
  IN_PROGRESS: 'inprogress',
  PAID: 'paid',
  REJECTED: 'rejected',
} as const satisfies Record<GeoDistributionClaimStatus, keyof GeoDistributionClaimStatusBreakdown>;

export const DEFAULT_GEO_DISTRIBUTION_VIEW: GeoDistributionView = 'STATEWISE';
export const DEFAULT_GEO_DISTRIBUTION_CLAIM_STATUS: GeoDistributionClaimStatus = 'PAID';
/** Named states returned by API before aggregating the remainder into Others */
export const GEO_DISTRIBUTION_TOP_N_NAMED_STATES = 4;
export const DEFAULT_GEO_DISTRIBUTION_TOP_N = GEO_DISTRIBUTION_TOP_N_NAMED_STATES;
export const GEO_DISTRIBUTION_OTHERS_LABEL = 'Others';

export const GEO_DISTRIBUTION_TOP_N_PRESET_LABEL = 'Top 5 states';
export const GEO_DISTRIBUTION_TOP_N_PRESET_VALUE = '__top_5__';
export const GEO_DISTRIBUTION_ALL_ZONES_PRESET_LABEL = 'All zones';

export const DEFAULT_GEO_DISTRIBUTION_ZONES: string[] = [];

const GEO_STATE_CODE_ENTRIES: Record<string, string> = {
  maharashtra: 'MH',
  karnataka: 'KA',
  kerala: 'KL',
  'tamil nadu': 'TN',
  rajasthan: 'RJ',
  delhi: 'DL',
  gujarat: 'GJ',
  telangana: 'TS',
  'uttar pradesh': 'UP',
  haryana: 'HR',
  'west bengal': 'WB',
  'madhya pradesh': 'MP',
  others: 'Others',
};

const GEO_ZONE_CODE_ENTRIES: Record<string, string> = {
  north: 'N',
  south: 'S',
  east: 'E',
  west: 'W',
};

export const normalizeGeoRegionKey = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Unknown';
  }

  if (trimmed.toLowerCase() === GEO_DISTRIBUTION_OTHERS_LABEL.toLowerCase()) {
    return GEO_DISTRIBUTION_OTHERS_LABEL;
  }

  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getGeoStateCode = (stateName: string): string | undefined => {
  const normalized = stateName.trim().toLowerCase();
  return GEO_STATE_CODE_ENTRIES[normalized];
};

const getGeoZoneCode = (zoneName: string): string | undefined => {
  const normalized = zoneName.trim().toLowerCase();
  return GEO_ZONE_CODE_ENTRIES[normalized];
};

export const formatGeoStateOptionLabel = (stateName: string): string => {
  const displayName = normalizeGeoRegionKey(stateName);

  if (displayName === GEO_DISTRIBUTION_OTHERS_LABEL || displayName === 'Unknown') {
    return displayName;
  }

  const code = getGeoStateCode(stateName);
  return code ? `${displayName} (${code})` : displayName;
};

export const formatGeoZoneOptionLabel = (zoneName: string): string => {
  const displayName = normalizeGeoRegionKey(zoneName);

  if (displayName === 'Unknown') {
    return displayName;
  }

  const code = getGeoZoneCode(zoneName);
  return code ? `${displayName} (${code})` : displayName;
};

/** Figma stacked bar colors — bottom (brown) to top (green) */
export const GEO_DISTRIBUTION_STACK_COLORS = [
  '#b45309', // amber-700
  '#f97316', // orange-500
  '#fbbf24', // chart-4
  '#164e63', // chart-3
  '#0d9488', // chart-2
] as const;

export const GEO_DISTRIBUTION_MAX_VISIBLE_SEGMENTS =
  GEO_DISTRIBUTION_TOP_N_NAMED_STATES + 1;

export const getGeoDistributionStackColor = (stackIndex: number): string =>
  GEO_DISTRIBUTION_STACK_COLORS[stackIndex] ??
  GEO_DISTRIBUTION_FALLBACK_COLORS[stackIndex % GEO_DISTRIBUTION_FALLBACK_COLORS.length];

export const formatGeoLegendLabel = (regionName: string): string => {
  const displayName = normalizeGeoRegionKey(regionName);

  if (displayName === GEO_DISTRIBUTION_OTHERS_LABEL || displayName === 'Unknown') {
    return displayName;
  }

  const code = getGeoStateCode(regionName);
  return code && code !== 'Others' ? code : displayName;
};

/** Figma bar width for geo distribution stacked chart */
export const GEO_DISTRIBUTION_BAR_WIDTH = 63.781;

export const GEO_DISTRIBUTION_REGION_COLORS: Record<string, string> = {
  North: '#0d9488',
  South: '#164e63',
  East: '#f97316',
  West: '#b45309',
  Others: '#b45309',
};

export const GEO_DISTRIBUTION_FALLBACK_COLORS = [
  '#b45309',
  '#f97316',
  '#fbbf24',
  '#164e63',
  '#0d9488',
];

export const getGeoDistributionRegionColor = (regionCode: string, index: number): string =>
  getGeoDistributionStackColor(index);
