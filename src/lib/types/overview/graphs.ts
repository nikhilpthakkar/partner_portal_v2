import type { TenureDistributionBucketCount } from '@/lib/types/overview/config';
import { ClaimsTableFilters, Currency, GroupBy } from '.';
import { DateRange } from 'react-day-picker';

export type ClaimsTrend = {
  claimTrend: ClaimTrendData[];
  summary: ClaimSummary;
};

export type ClaimTrendData = {
  period: string;
  periodType: GroupBy;
  periodStart: string;
  periodEnd: string;
  claimsByStatus: ClaimStatusBreakdown[];
  claims_by_status?: ClaimStatusBreakdown[];
  totalClaims: number;
  paidAmount?: number;
};

export type ClaimStatusBreakdown = {
  status: ClaimTrendApiStatus | string;
  count: number;
  percentage: number;
};

export type ClaimTrendApiStatus = 'ONGOING' | 'COMPLETED' | 'REJECTED' | 'CLOSED';

/** @deprecated Use ClaimTrendApiStatus for chart API payloads */
export type ClaimStatus = ClaimTrendApiStatus;

export type ClaimSummary = {
  totalClaims: number;
  periodCount: number;
  statusBreakdown: SummaryStatusBreakdown;
  averageClaimsPerPeriod: number;
  peaks: ClaimPeaks;
  rates: ClaimRates;
  dateRange: DateRange;
};

export type SummaryStatusBreakdown = {
  ongoing: number;
  completed: number;
  rejected: number;
  closed?: number;
};

export type ClaimPeaks = {
  highest: PeakCount;
  lowest: PeakCount;
};

export type PeakCount = {
  period: string;
  count: number;
};

export type ClaimRates = {
  completionRate: number;
  rejectionRate: number;
  ongoingRate: number;
};

export type ClaimFilters = {
  fromDate: string;
  toDate: string;
  partnerId: string;
  productIds: string[];
  lob: string;
  groupBy: GroupBy;
  coverIds?: string[];
  page?: number;
  size?: number;
};

export type GwpFilters = {
  lob: string;
  partnerId: string;
  productIds: string[];
  dateRange: DateRange;
  groupBy: GroupBy;
};

export type GwpTrend = {
  gwpTrend: GwpTrendData[];
  summary: Summary;
};

export type GwpTrendData = {
  period: string;
  periodType: GroupBy;
  periodStart: string;
  periodEnd: string;
  gwp: Gwp;
  metrics: Metrics;
  trend?: Trend;
};

export type Gwp = {
  amount: number;
  currency: 'INR' | string;
  breakdown: GwpBreakdown;
};

export type GwpBreakdown = {
  issuanceAmount: number;
  endorsementAmount: number;
  cancellationAmount: number;
  refundAmount: number;
};

export type Metrics = {
  policyCount: number;
  issuanceCount: number;
  endorsementCount: number;
  cancellationCount: number;
  refundCount: number;
};

export type Trend = {
  percentageChange: number;
  direction: 'UP' | 'DOWN';
  comparedTo: string;
};

export type Summary = {
  totalGwp: number;
  averageGwp: number;
  totalPolicies: number;
  periodCount: number;
  dateRange: DateRange;
  peaks: Peaks;
  growth: Growth;
};

export type Peaks = {
  highest: PeakValue;
  lowest: PeakValue;
};

export type PeakValue = {
  period: string;
  gwp: number;
};

export type Growth = {
  overallPercentage: number;
  direction: 'UP' | 'DOWN';
};

export type AvgPremiumTrendDataPoint = {
  period: string;
  periodType: GroupBy;
  periodStart: string;
  periodEnd: string;
  averagePremium: {
    amount: number;
    currency: Currency | string;
  };
  metrics?: {
    policyCount: number;
    premiumAmount: number;
  };
};

export type AvgPremiumTrend = {
  averagePremiumTrend: AvgPremiumTrendDataPoint[];
};

export type AvgPremiumFilters = {
  lob: string;
  partnerId: string;
  productIds: string[];
  fromDate: string;
  toDate: string;
  groupBy: GroupBy;
  timezone?: string;
};

export type AvgSiTrendDataPoint = {
  period: string;
  periodType: GroupBy;
  periodStart: string;
  periodEnd: string;
  averageSumInsured?: {
    amount: number;
    currency: Currency | string;
  };
  averageSi?: {
    amount: number;
    currency: Currency | string;
  };
  avgSumInsured?: {
    amount: number;
    currency: Currency | string;
  };
};

export type AvgSiTrend = {
  averageSiTrend?: AvgSiTrendDataPoint[];
  averageSumInsuredTrend?: AvgSiTrendDataPoint[];
  avgSiTrend?: AvgSiTrendDataPoint[];
};

export type AvgSiFilters = {
  lob: string;
  partnerId: string;
  productIds: string[];
  fromDate: string;
  toDate: string;
  groupBy: GroupBy;
  timezone?: string;
};

export type GeoDistributionClaimStatusBreakdown = {
  inprogress?: number;
  paid?: number;
  closed?: number;
  rejected?: number;
};

export type GeoDistributionStateBreakdown = {
  state?: string;
  zone?: string;
  regionName?: string;
  regionCode?: string;
  stateCode?: string;
  zoneCode?: string;
  code?: string;
  policyCount?: number;
  claimCount?: number;
  count?: number;
  percentage?: number;
  statusBreakdown?: GeoDistributionClaimStatusBreakdown;
};

export type GeoDistributionDataPoint = {
  period?: string;
  periodType: GroupBy;
  periodStart: string;
  periodEnd: string;
  totalPolicies?: number;
  totalClaims?: number;
  totalCount?: number;
  states?: GeoDistributionStateBreakdown[];
  zones?: GeoDistributionStateBreakdown[];
  breakdown?: GeoDistributionStateBreakdown[];
  /** @deprecated Alternate API field names */
  distribution?: GeoDistributionStateBreakdown[];
  regions?: GeoDistributionStateBreakdown[];
};

export type GeoDistributionPolicies = {
  geoDistribution?: GeoDistributionDataPoint[];
  geoDistributionPolicies?: GeoDistributionDataPoint[];
  geoPoliciesDistribution?: GeoDistributionDataPoint[];
  geoDistributionClaims?: GeoDistributionDataPoint[];
  geoClaimsDistribution?: GeoDistributionDataPoint[];
};

export type GeoDistributionFilters = {
  lob: string;
  partnerId: string;
  productIds: string[];
  fromDate: string;
  toDate: string;
  groupBy: GroupBy;
  timezone?: string;
  geoView?: string;
  claimStatus?: string;
  topN?: number;
  states?: string[];
  zones?: string[];
};

export type TenureDistributionBucketBreakdown = {
  min?: number;
  max?: number;
  from?: number;
  to?: number;
  rangeFrom?: number;
  rangeTo?: number;
  label?: string;
  rangeLabel?: string;
  policyCount?: number;
  count?: number;
  percentage?: number;
};

export type TenureDistributionDataPoint = {
  period?: string;
  periodType: GroupBy;
  periodStart: string;
  periodEnd: string;
  totalPolicies?: number;
  totalCount?: number;
  buckets?: TenureDistributionBucketCount[];
  /** @deprecated Prefer buckets */
  bucketCounts?: TenureDistributionBucketCount[];
  tenureBuckets?: TenureDistributionBucketBreakdown[];
  ranges?: TenureDistributionBucketBreakdown[];
  breakdown?: TenureDistributionBucketBreakdown[];
};

export type TenureDistributionSummary = {
  totalPolicies: number;
  periodCount: number;
};

export type PoliciesByTenureDistribution = {
  policiesByTenureDistribution?: TenureDistributionDataPoint[];
  tenureDistribution?: TenureDistributionDataPoint[];
  policiesByTenure?: TenureDistributionDataPoint[];
  summary?: TenureDistributionSummary;
};

export type TenureDistributionFilters = {
  lob: string;
  partnerId: string;
  productIds: string[];
  fromDate: string;
  toDate: string;
  groupBy: GroupBy;
  timezone?: string;
  unit?: 'MONTHS' | 'YEARS';
  buckets?: TenureDistributionBucketCount[];
};

export type Meta = {
  filters: GwpFilters | ClaimFilters | ClaimsTableFilters;
  timestamp: string;
  traceId: string;
};
