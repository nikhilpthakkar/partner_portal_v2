import type { SelectOption } from '@/lib/types/Global';
import type { CommunicationLogRow, CommunicationLogStatus } from '@/lib/types/communicationLog';

export type PolicyDetailsBreadcrumb = {
  id: string;
  label: string;
  href?: string;
  isCurrent?: boolean;
};

export type PolicyDetailsActionType = 'download' | 'share' | 'endorse';

export type PolicyDetailsActionVariant = 'outline' | 'primary';

export type PolicyDetailsAction = {
  id: string;
  label: string;
  type: PolicyDetailsActionType;
  variant: PolicyDetailsActionVariant;
  iconOnly?: boolean;
};

export type PolicyDetailsItem = {
  id: string;
  label: string;
  value: string;
  copyValue?: string;
};

export type PolicyDetailsSection = {
  id: string;
  title: string;
  columns: PolicyDetailsItem[][];
};

export type PolicyEndorsementStatus = 'Successful' | 'Pending' | 'Failed';

export type PolicyEndorsementsTableLabels = {
  type: string;
  date: string;
  applicableFor: string;
  createdBy: string;
  description: string;
  status: string;
};

export type PolicyEndorsementsTableRow = {
  id: string;
  type: string;
  date: string;
  applicableFor: string;
  createdBy: string;
  description: string;
  status: PolicyEndorsementStatus;
};

export type PolicyEndorsementCreatedBy = {
  email: string;
};

export type PolicyEndorsementsTablePagination = {
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions: number[];
};

export type PolicyEndorsementsTableData = {
  labels: PolicyEndorsementsTableLabels;
  rows: PolicyEndorsementsTableRow[];
  pagination: PolicyEndorsementsTablePagination;
};

export type PolicyClaimsHistoryActionType = 'view' | 'share' | 'more';

export type PolicyClaimsHistoryAction = {
  type: PolicyClaimsHistoryActionType;
  disabled?: boolean;
};

export type PolicyClaimsHistoryLabels = {
  claimId: string;
  date: string;
  amount: string;
  type: string;
  status: string;
  actions: string;
};

export type PolicyClaimsHistoryRow = {
  id: string;
  claimId: string;
  date: string;
  amount: string;
  type: string;
  status: string;
  actions: PolicyClaimsHistoryAction[];
};

export type PolicyClaimsHistoryPagination = {
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions: number[];
};

export type PolicyClaimsHistoryFilters = {
  datePlaceholder: string;
  filterOptions: SelectOption[];
  defaultFilterValue: string;
  searchPlaceholder: string;
  defaultSearchValue: string;
};

export type PolicyClaimsHistoryTable = {
  labels: PolicyClaimsHistoryLabels;
  rows: PolicyClaimsHistoryRow[];
  pagination: PolicyClaimsHistoryPagination;
};

export type PolicyCommunicationStatus = CommunicationLogStatus;

export type PolicyCommunicationLabels = {
  type: string;
  subject: string;
  date: string;
  status: string;
  target: string;
  recipientType: string;
};

export type PolicyCommunicationRow = CommunicationLogRow;

export type PolicyCommunicationTable = {
  labels: PolicyCommunicationLabels;
  rows: PolicyCommunicationRow[];
};

export type PolicyHealthCardActionType = 'download' | 'share';

export type PolicyHealthCardAction = {
  type: PolicyHealthCardActionType;
  label: string;
};

export type PolicyHealthCardItem = {
  id: string;
  label: string;
  value: string;
};

export type PolicyHealthCard = {
  title: string;
  subtitle?: string;
  primaryLogoSrc?: string;
  primaryLogoAlt?: string;
  secondaryLogoSrc?: string;
  secondaryLogoAlt?: string;
  actions: PolicyHealthCardAction[];
  items: PolicyHealthCardItem[][];
};

export type PolicyDetailsPanel = {
  id: string;
  sections?: PolicyDetailsSection[];
  endorsementsTable?: PolicyEndorsementsTableData;
  claimsHistory?: PolicyClaimsHistoryTable;
  communicationTable?: PolicyCommunicationTable;
  healthCard?: PolicyHealthCard;
};

export type EndorsePolicyBadgeTone = 'warning' | 'success';

export type EndorsePolicyIconName =
  | 'calendar-off'
  | 'file-x'
  | 'user-round'
  | 'user-round-check'
  | 'users';

export type EndorsePolicyAction = {
  id: string;
  title: string;
  description: string;
  icon: EndorsePolicyIconName;
};

export type EndorsePolicySection = {
  id: string;
  title: string;
  badgeLabel?: string;
  badgeTone?: EndorsePolicyBadgeTone;
  actions: EndorsePolicyAction[];
};

export type PolicyDetailsData = {
  actions: PolicyDetailsAction[];
  tabs: SelectOption[];
};
