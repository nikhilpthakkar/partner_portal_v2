import { PERMISSIONS } from '@/lib/constants/auth.constants';

export const POLICY_PHONE_SEARCH_FIELD = 'phone';

export const isPolicyPhoneSearchField = (field: string): boolean => field.includes('phone');

export const POLICY_FILTER_OPTIONS_FALLBACK = [
  { value: 'policy_number', label: 'Policy Number' },
  { value: 'reference_id', label: 'Reference ID' },
  { value: POLICY_PHONE_SEARCH_FIELD, label: 'Phone Number' },
];

/** @deprecated Use capabilities API via usePolicyFilterOptions */
export const POLICY_FILTER_OPTIONS = POLICY_FILTER_OPTIONS_FALLBACK;

/** Page size for policy search on the policy management overview table. */
export const POLICY_MANAGEMENT_SEARCH_PAGE_SIZE = 10;

/** Page size for policy search in the create-claim flow (wider list for selection). */
export const CREATE_CLAIM_POLICY_SEARCH_PAGE_SIZE = 50;

export const POLICY_MANAGEMENT_TOP_TABS = [
  { value: 'policy-overview', label: 'Policy overview', permission: PERMISSIONS.VIEW_POLICIES },
  { value: 'bulk-operations', label: 'Bulk operations', permission: PERMISSIONS.UPLOAD_BULK },
];

export const POLICY_MANAGEMENT_TABLE_TABS = [
  { value: 'search-results', label: 'Search results' },
  { value: 'recent-searches', label: 'Recently Viewed' },
];

export const POLICY_MANAGEMENT_TABLE_LABELS = {
  policyNumber: 'Policy No.',
  insuredName: 'Insured name',
  customerPhone: 'Customer phone',
  productName: 'Product name',
  issuedOn: 'Issued on',
  status: 'Status',
  actions: 'Actions',
};

export const POLICY_MANAGEMENT_HEADER = {
  title: 'Policy management',
  subtitle: 'Manage, share, and endorse policies',
};

export const POLICY_MANAGEMENT_UPLOAD_FILE_LABEL = 'Upload file';

export const POLICY_BULK_UPLOAD_MAX_FILE_BYTES = 10 * 1024 * 1024;

export const POLICY_BULK_UPLOAD_CARD_COPY = {
  title: 'Policy Bulk upload',
  actionTypeLabel: 'Action type',
  uploadFile: 'Upload file',
  idleTitle: 'Drag & drop or click to upload',
  idleDescription: 'Upload your file (.csv only | max 10 MB)',
  selectFile: 'Select file',
  replaceFile: 'Replace file',
  downloadTemplate: 'Download template',
  fileTooLargeTitle: 'File size exceeds maximum limit',
  unsupportedFileFormatTitle: 'Unsupported file format',
  unsupportedFileFormatDescription: 'Only .csv files of up to 10 MB are supported.',
  emptyFileTitle: 'Empty file',
  emptyFileDescription:
    ' Uploaded file contains no data.  Review your file to ensure it has required entries and re-upload.',
} as const;

export function getPolicyBulkUploadFileTooLargeDescription(fileSizeMbLabel: string): string {
  return `Your file is ${fileSizeMbLabel}. Maximum allowed size is 10MB. Please reduce the file size and try again.`;
}

export const DEFAULT_POLICY_MANAGEMENT_TAB = {
  pageTab: 'policy-overview',
  activeTableTab: 'recent-searches',
};

export const DEFAULT_POLICY_DETAILS_TAB = 'policy-details';

export const SHARE_POLICY_INFO_TEXT =
  'You can share with multiple people at once. Select each person on the left to configure their preferred communication modes, then send them all together.';
