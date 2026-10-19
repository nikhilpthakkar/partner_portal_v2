import type { SelectOption } from '@/lib/types/Global';
import type { ReactNode } from 'react';

export type PolicyTableRow = {
  id: string;
  policyNumber: string;
  insuredName: string;
  customerPhone: string;
  productName: string;
  issuedOn: string;
  status: string;
  actions: ReactNode[];
  certificatePdf?: string;
};

export type PolicyTableLabels = {
  policyNumber: string;
  insuredName: string;
  customerPhone: string;
  productName: string;
  issuedOn: string;
  status: string;
  actions: string;
};

export type PolicyTablePagination = {
  page: number;
  rowsPerPage: number;
  totalPages: number;
  rowsPerPageOptions: number[];
};

export type PolicyManagementDefaults = {
  pageTab: string;
  activeTableTab: string;
  searchFilter: string;
};

export type PolicyManagementData = {
  header: {
    title: string;
    subtitle: string;
  };
  topTabs: SelectOption[];
  search: {
    filterOptions: SelectOption[];
    placeholder: string;
    buttonLabel: string;
  };
  tabs: SelectOption[];
  table: {
    labels: PolicyTableLabels;
  };
  tableRowsByTab: Record<string, PolicyTableRow[]>;
  defaults: PolicyManagementDefaults;
};

export type StatusTimelineItem = {
  id: string;
  title: string;
  description: string;
  performer: string;
  timestamp: string;
  isActive?: boolean;
};

export type RecentSearchPolicy = {
  startDate?: string;
  endDate?: string;
  /** Correspondence / registered address — when APIs provide it */
  address?: string;
  customer?: {
    phone?: string;
    email?: string;
    city?: string;
  };
  status: string;
  policyId: string;
  policyNumber: string;
  issuedOn: string;
  planDetails?: {
    planId?: string;
    /** Amount in rupees — when present from policy search/API. */
    sumInsured?: number;
    /** Annual / policy premium — when returned by APIs. */
    premium?: number;
  };
  premium?: {
    amount: number;
  };
  persons?: Array<{
    insured?: {
      name?: string;
      uhid?: string;
      gender?: string;
      phone?: string;
    };
    nominee?: {
      name?: string;
      phone?: string;
      email?: string;
      dob?: string;
    };
  }>;
  /** Member / policy identifier when returned by APIs. */
  uhid?: string;
  certificatePdf?: string;
};

export type RecentSearchResponse = {
  policies: RecentSearchPolicy[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNext: boolean;
  };
};

export type RecentSearchFilters = {
  recentSearch: boolean;
  productIds: string[];
  partnerId: string;
  lob: string;
};

export type PolicyFilterKey = string;

export type PolicySearchFieldCapability = {
  field: string;
  displayName: string;
  multiValued: boolean;
};

export type PolicySearchFilters = {
  productIds: string[];
  partnerId: string;
  lob: string;
  page: number;
  size: number;
  searchField?: string;
  searchValue?: string;
};

export type UploadStateAction = {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  className?: string;
};

export type UploadState = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  iconWrapperClassName?: string;
  primaryAction?: UploadStateAction;
  secondaryAction?: UploadStateAction;
};

/** Mutually exclusive views inside the policy bulk upload drop zone. */
export type PolicyBulkUploadPanelPhase =
  | { type: 'idle' }
  | { type: 'staged'; file: File }
  | { type: 'unsupported_format' }
  | { type: 'oversized'; attemptedBytes: number }
  | { type: 'empty' };

export type PolicyShareRecipientMember = {
  id: string;
  name: string;
  subtitle?: string;
  email: string;
  whatsapp: string;
  sms: string;
};

export type PolicyShareRecipient = {
  id: string;
  title: string;
  subtitle?: string;
  members?: PolicyShareRecipientMember[];
};

export type PolicyShareChannel = {
  id: string;
  label: string;
  value: string;
  checked: boolean;
};

export type PolicyShareDetailsData = {
  title: string;
  description: string;
  policyNumber: string;
  recipients: PolicyShareRecipient[];
  selectedRecipientId: string;
  channels: PolicyShareChannel[];
  cancelLabel: string;
  shareLabel: string;
};

export type BulkActionTypeOption = {
  value: string;
  label: string;
};
