import { SelectOption } from '../types/Global';
import { BulkOperationRow, BulkOperationStatus } from '../types/policy-bulk-operations';

/** Labels for `Filters` (date range + filter popover). */
export const BULK_FILTERS_LABELS = {
  trigger: 'Filters',
  title: 'Filter by',
  clear: 'Clear all',
  selectAll: 'Select all',
  apply: 'Apply filters',
  close: 'Close filters',
} as const;

/** Plan options for `MultiSearchSelect`; empty selection = all plans. Values match `BulkOperationRow.planName`. */
export const BULK_PLAN_FILTER_OPTIONS: SelectOption[] = [
  { value: 'Electronics protection', label: 'Electronics protection' },
  { value: 'Mobile security', label: 'Mobile security' },
  { value: 'Travel insurance', label: 'Travel insurance' },
  { value: 'credit_1', label: 'credit_1' },
];

export function getBulkUploadedByFilterOptions(rows: BulkOperationRow[]): SelectOption[] {
  const uniqueNames = [...new Set(rows.map((row) => row.uploadedBy))].sort((a, b) =>
    a.localeCompare(b),
  );
  return uniqueNames.map((name) => ({ value: name, label: name }));
}

export const BULK_OPERATION_TABLE_LABELS = {
  fileName: 'File name',
  planName: 'Plan name',
  totalRecords: 'Total records',
  action: 'Action',
  status: 'Status',
  uploadedOn: 'Uploaded on',
  uploadedBy: 'Uploaded by',
  actions: 'Actions',
};

/** Empty / error copy for bulk operations list (ErrorCard). */
export const BULK_OPERATION_LIST_STATE_MESSAGES = {
  errorTitle: 'Unable to load bulk uploads',
  errorDescriptionFallback: 'Please try again later.',
  emptyTitle: 'No uploads found',
} as const;

/** Download action popover (Figma: bulk operations row actions). */
export const BULK_OPERATION_DOWNLOAD_MENU_LABELS = {
  errorFile: 'Download error file',
  successFile: 'Download success file',
  inputFile: 'Download input file',
} as const;

export const statusStyles: Record<BulkOperationStatus, string> = {
  successful:
    'bg-endorse-policy-badge-success-bg text-secondary-foreground border-endorse-policy-badge-success-border',
  processing:
    'bg-endorse-policy-badge-warning-bg text-secondary-foreground border-endorse-policy-badge-warning-border',
  partially_successful:
    'bg-endorse-policy-badge-warning-bg text-secondary-foreground border-endorse-policy-badge-warning-border',
  failed:
    'bg-endorse-policy-badge-error-bg text-secondary-foreground border-endorse-policy-badge-error-border',
};

export const TAB_VALUE_TO_STATUS: Record<string, BulkOperationStatus | null> = {
  'all-uploads': null,
  processing: 'processing',
  completed: 'successful',
  'partially-successful': 'partially_successful',
  failed: 'failed',
};

/** Query `status` for bulk action list API (omit for “All uploads”). */
export const TAB_VALUE_TO_BULK_LIST_STATUS: Record<string, string | undefined> = {
  'all-uploads': undefined,
  processing: 'processing',
  completed: 'successful',
  'partially-successful': 'partial_successful',
  failed: 'failed',
};
