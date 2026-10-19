import { SelectOption } from '../types/Global';
import { ClaimStatus, ClaimStatusGroup, GroupBy, SeriesKey } from '../types/overview';

export const DEFAULT_CHART_GROUP_BY: GroupBy = 'WEEKLY';

export const OVERVIEW_CHART_FILTERS_REQUIRED_MESSAGE =
  'Choose a date range and frequency to load this chart';

export const METRIC_SKELETON_COUNT: number = 3;
export const PROMO_SKELETON_COUNT: number = 3;
export const CLAIMS_TABLE_LOADING_ROWS: number = 9;

export const groupByOptions: SelectOption[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
];

/** Weekly / monthly / quarterly only — used by geo distribution and tenure charts. */
export const periodicGroupByOptions: SelectOption[] = groupByOptions.filter(
  (option) => option.value !== 'DAILY',
);

//Graphs
export const PAGE_SIZE = 4;
export const CHART_HEIGHT = 280;
export const BAR_WIDTH = 48;
export const BORDER_RADIUS = 4;
export const SHOW_Y_AXIS_LABEL = true;

export const statusGroups: Record<ClaimStatusGroup, string[]> = {
  inprogress: ['registered', 'inprogress', 'document_requested', 'bank_details_requested'],
  rejected: ['rejected'],
  paid: ['paid'],
  closed: ['closed', 'withdrawn'],
  all: [
    'registered',
    'inprogress',
    'document_requested',
    'bank_details_requested',
    'paid',
    'rejected',
    'closed',
    'withdrawn',
  ],
};

export const statusOptions: SelectOption<SeriesKey>[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

export const CLAIM_STATUS_BADGE_CLASS: Record<ClaimStatus, string> = {
  Registered: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Document Requested': 'bg-yellow-100 text-yellow-800',
  'Bank Detail Requested': 'bg-yellow-100 text-yellow-800',
  Paid: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Closed: 'bg-red-100 text-red-700',
  Withdrawn: 'bg-red-100 text-red-700',
};

export const INTEREST_REGISTERATION_MSG =
  'We’ve received your request and sent you a confirmation email. Your designated KAM will reach out shortly.';

export const DEFAULT_OVERVIEW_TIMEZONE = 'Asia/Kolkata';

export const AVG_SI_TREND_BAR_WIDTH = 63.781;
export const AVG_SI_TREND_BORDER_RADIUS = 8;
export const AVG_SI_TREND_LEGEND_LABEL = 'Avg sum insured (in INR)';

/** Maps overview card_id from GET /overview/cards to capability-interest API capability_name. */
export const OVERVIEW_CARD_CAPABILITY_NAME: Record<string, string> = {
  gmc_card: 'group_medical_coverage',
};
