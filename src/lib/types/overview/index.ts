import { DateRange } from 'react-day-picker';
import { Pagination } from '../Global';
import {
  BankDetails,
  ClaimUsers,
  IncidentDetails,
  NomineeDetails,
} from '../claims-management/claimsDetailApi';

export type GroupBy = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

export type SeriesKey = 'all' | 'totalClaims' | 'paid' | 'inprogress' | 'rejected' | 'closed';

export type ClaimsDialogStatusKey = 'all' | 'paid' | 'inProgress' | 'rejected' | 'closed';

export type ClaimStatusGroup = 'all' | 'inprogress' | 'rejected' | 'paid' | 'closed';

export type ClaimStatus =
  | 'Registered'
  | 'In Progress'
  | 'Document Requested'
  | 'Bank Detail Requested'
  | 'Paid'
  | 'Rejected'
  | 'Closed'
  | 'Withdrawn';

export type OverviewStaticResponse = {
  welcomeTitle: string;
  welcomeSubtitle: string;
  businessSummaryTitle: string;
  newFeaturesTitle: string;
};

export type MetricCardData = {
  componentId?: string;
  label: string;
  value: string | number;
  badgeLabel?: string;
  infoText?: string;
};

export type PromoCardData = {
  id: string;
  cardId: string;
  capabilityId: string;
  title: string;
  description: string;
  ctaLabel: string;
  badgeLabel?: string;
  badgeTone?: 'warning' | 'success' | 'info';
};

export type GwpTrendData = {
  title: string;
  periodStarts: string[];
  periodEnds: string[];
  categories: string[];
  totalGwp: number[];
  policyCount: number[];
  infoText: string;
  hasData: boolean;
};

export type ClaimsTrendData = {
  title: string;
  categories: string[];
  periodStarts: string[];
  periodEnds: string[];
  periodType: GroupBy;
  paidAmount: number[];
  paid: number[];
  inprogress: number[];
  rejected: number[];
  closed: number[];
  totalClaims: number[];
  infoText: string;
  hasData: boolean;
  pagination: {
    currentPage: number;
    pageSize: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

export type AvgPremiumTrendData = {
  title: string;
  categories: string[];
  periodStarts: string[];
  periodEnds: string[];
  avgPremium: number[];
  infoText: string;
  hasData: boolean;
};

export type AvgSiTrendData = {
  title: string;
  categories: string[];
  periodStarts: string[];
  periodEnds: string[];
  avgSumInsured: number[];
  infoText: string;
  hasData: boolean;
};

export type GeoDistributionSeries = {
  name: string;
  legendLabel?: string;
  color: string;
  percentages: number[];
  counts: number[];
};

export type GeoDistributionData = {
  title: string;
  categories: string[];
  periodStarts: string[];
  periodEnds: string[];
  periodType: GroupBy;
  totals: number[];
  series: GeoDistributionSeries[];
  infoText: string;
  hasData: boolean;
};

export type ClaimsTableData = {
  data: ClaimsTableRow[];
  labels: ClaimsTableLabels;
  pagination: Pagination;
};

export type ClaimsTableRow = {
  claimRequestNumber: string;
  coverId: string;
  claimantName: string;
  createdOn: string;
  status: ClaimStatus;
};

export type ClaimsTableLabels = {
  claimRequestNumber: string;
  coverId: string;
  claimantName: string;
  createdOn: string;
  status: string;
};

export type BarClickPayload = {
  state: string;
  name: string;
  actionLabel?: string;
  statusValue?: string;
  value: number;
  dateRange?: DateRange;
  clientX?: number;
  clientY?: number;
  x: number;
  y: number;
};

export type ClaimsTable = {
  claims: ClaimData[];
  pagination: Pagination;
};

export type ClaimData = {
  claimRequestNumber: string;
  policyNumber: string;
  planId: string;
  coverId: string;
  statusGroup: ClaimStatusGroup;
  detailedStatus: string;
  fnolCompletedOn: string;
  metadata: Metadata;
  claimUsers: ClaimUsers;
  incidentDetails: IncidentDetails;
  bankDetails: BankDetails;
  nomineeDetails: NomineeDetails;
  reserveDetails: Record<string, unknown>;
  deductionDetails: Record<string, unknown>;
  statusTimeline: unknown[];
  createdOn?: string;
  claimantName?: string;
};

export type Metadata = {
  is_eligible_for_payout: boolean;
  lead_insurer: string;
  update_details: {
    classified_cover: string;
    classified_claim_type: string;
    updated_on: string;
  };
};

export type ClaimsTableFilters = {
  fromDate: string;
  toDate: string;
  partnerId: string;
  productIds: string[];
  statusGroups: ClaimStatusGroup[];
  lob: string;
};

export type Currency = 'INR' | 'USD';

export type Metrics = {
  policyMetrics: PolicyMetrics;
  financialMetrics: FinancialMetrics;
  claimMetrics: ClaimMetrics;
};

export type PolicyMetrics = {
  totalPolicies: number;
  breakdown: PolicyBreakdown;
};

export type PolicyBreakdown = {
  newIssuances: number;
  endorsements: number;
  cancellations: number;
};

export type FinancialMetrics = {
  gwp: Gwp;
  currentBalance: Money;
};

export type Gwp = {
  amount: number;
  currency: Currency;
  breakdown: GwpBreakdown;
};

export type GwpBreakdown = {
  issuanceAmount: number;
  endorsementAmount: number;
  cancellationAmount: number;
  refundAmount: number;
};

export type Money = {
  amount: number;
  currency: Currency;
};

export type ClaimMetrics = {
  settlementRatio: number;
  unit: 'percentage';
  breakdown: ClaimMetricsBreakdown;
};

export type ClaimMetricsBreakdown = {
  totalClaims: number;
  settledClaims: number;
  rejectedClaims: number;
  pendingClaims: number;
};

export type Filters = {
  lob: string;
  partnerId: string;
  productIds: string[];
  dateRange: ClaimsDateRange;
};

export type ClaimsDateRange = {
  from: string;
  to: string;
  timezone?: string;
};
