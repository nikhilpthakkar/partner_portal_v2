export type ClaimsTableStatus =
  | 'Registered'
  | 'In Progress'
  | 'Document Requested'
  | 'Bank Detail Requested'
  | 'Paid'
  | 'Rejected'
  | 'Closed'
  | 'Withdrawn';

export type ClaimsTableRow = {
  id: string;
  claimNumber: string;
  cover: string;
  claimantName: string;
  claimantPhone: string;
  createdOn: string;
  status: ClaimsTableStatus;
};

export type ClaimsTableLabels = {
  claimNumber: string;
  cover: string;
  claimantName: string;
  claimantPhone: string;
  createdOn: string;
  status: string;
  actions: string;
};

export type ClaimsTablePagination = {
  page: number;
  rowsPerPage: number;
  totalPages: number;
  rowsPerPageOptions: number[];
};

export type ClaimsManagementDefaults = {
  topTab: string;
  activeTab: string;
  searchFilter: string;
};

export type ClaimsManagementData = {
  header: {
    title: string;
    subtitle: string;
    primaryActionLabel: {
      label: string;
      icon: string;
    };
  };
  table: {
    labels: ClaimsTableLabels;
  };
  defaults: ClaimsManagementDefaults;
};

export type StatusTimelineEnrichedDetail = {
  label: string;
  value: string;
};

export type StatusTimelineItem = {
  id: string;
  title: string;
  description: string;
  stageDescription?: string;
  enrichedDetails?: StatusTimelineEnrichedDetail[];
  performer: string;
  timestampLabel: string;
  timestamp: string;
  isActive?: boolean;
};
