import type { SelectOption } from '@/lib/types/Global';

export const MANUAL_REFUND_PRIORITIES = ['P0', 'P1', 'P2', 'P3', 'P4'] as const;

export type ManualRefundPriorityOption = (typeof MANUAL_REFUND_PRIORITIES)[number];

export const MANUAL_REFUND_STATUSES = ['initiated', 'settled'] as const;

export type ManualRefundStatusOption = (typeof MANUAL_REFUND_STATUSES)[number];

export const MANUAL_REFUND_TAB_STATUSES = ['initiated', 'settled'] as const;

export type ManualRefundTabStatus = (typeof MANUAL_REFUND_TAB_STATUSES)[number];

export const MANUAL_REFUND_FILTERS_CONFIG_IDS = {
  planId: 'planId',
  status: 'status',
  priority: 'priority',
} as const;

export const MANUAL_REFUND_FILTERS_LABELS = {
  trigger: 'Filters',
  title: 'Filter by',
  clear: 'Clear all',
  apply: 'Apply filters',
  close: 'Close filters',
} as const;

export const MANUAL_REFUND_PAGE_COPY = {
  title: 'Manual refunds',
  description: 'Monitor manual refund requests and take actions on active refunds',
  errorTitle: 'Unable to load manual refunds',
  emptyTitle: 'No manual refunds found',
  loading: 'Loading manual refunds...',
  searchPlaceholder: 'Search by policy number',
  searchClearLabel: 'Clear policy number search',
} as const;

export const MANUAL_REFUND_UPDATE_STATUS_DIALOG = {
  title: 'Update UTR details',
  subtitle: 'Cross check values and enter UTR details',
  policyNumber: 'Enter policy number',
  accountHolder: 'Name of account holder',
  remark: 'Add remark',
  utr: 'Add UTR',
  utrPlaceholder: 'Enter UTR',
  bankAccount: 'Bank account details',
  refundAmount: 'Refund amount (₹)',
  priority: 'Select priority',
  back: 'Back',
  update: 'Update',
  updating: 'Updating...',
  utrRequired: 'UTR is required',
  successTitle: 'Manual refund status updated',
  errorTitle: 'Unable to update manual refund status',
} as const;

export const MANUAL_REFUND_TABLE_LABELS = {
  refundRequestId: 'Refund request ID',
  partner: 'Partner',
  planId: 'Plan ID',
  policyNumber: 'Policy number',
  initiatedBy: 'Initiated by',
  date: 'Date',
  amount: 'Amount',
  priority: 'Priority',
  status: 'Status',
  lastUpdated: 'Last updated',
  actions: 'Actions',
  updateStatus: 'Update status',
  updateDetails: 'Update details',
  viewDetails: 'View details',
  viewEditDetails: 'View/Edit details',
} as const;

export const MANUAL_REFUND_DETAILS_DIALOG = {
  title: 'Refund Details',
  policyIdLabel: 'Policy ID',
  refundStatusLabel: 'Refund status',
  detailsSectionTitle: 'Details',
  refundDestinationTitle: 'Refund destination',
  refundId: 'Refund Id',
  refundAmount: 'Refund amount',
  initiatedOn: 'Initiated On',
  completedOn: 'Completed On',
  utrReference: 'UTR / Reference',
  toLabel: 'To',
  partnerAccountNumber: 'Partner account number',
  customerAccountNumber: 'Account number',
  ifscCode: 'IFSC code',
  backLabel: 'Back',
  editDetailsLabel: 'Edit details',
  doneLabel: 'Done',
  loadingMessage: 'Loading refund details...',
  errorMessage: 'Unable to load refund details. Please try again.',
  copySuccessMessage: 'Copied to clipboard',
  statusLabels: {
    successful: 'Successful',
    initiated: 'Initiated',
  },
  destinationTypes: {
    partner: 'Partner',
    customer: 'Customer',
  },
} as const;

export const MANUAL_REFUND_STATUS_LABELS: Record<string, string> = {
  initiated: 'Initiated',
  settled: 'Completed',
};

export const MANUAL_REFUND_PRIORITY_FILTER_OPTIONS: SelectOption[] = MANUAL_REFUND_PRIORITIES.map(
  (priority) => ({
    value: priority,
    label: priority,
  }),
);

export const MANUAL_REFUND_STATUS_FILTER_OPTIONS: SelectOption[] = MANUAL_REFUND_STATUSES.map(
  (status) => ({
    value: status,
    label: MANUAL_REFUND_STATUS_LABELS[status] ?? status,
  }),
);

export const MANUAL_REFUND_STATUS_STYLES: Record<string, string> = {
  initiated: 'bg-orange-100 text-secondary-foreground border-transparent',
  settled: 'bg-endorse-policy-badge-success-bg text-secondary-foreground border-transparent',
};

export const MANUAL_REFUND_PRIORITY_STYLES: Record<string, string> = {
  P0: 'bg-endorse-policy-badge-error-bg text-secondary-foreground border-transparent',
  P1: 'bg-orange-100 text-secondary-foreground border-transparent',
  P2: 'bg-endorse-policy-badge-warning-bg text-secondary-foreground border-transparent',
  P3: 'bg-endorse-policy-badge-success-bg text-secondary-foreground border-transparent',
  P4: 'bg-endorse-policy-badge-success-bg text-secondary-foreground border-transparent',
};
