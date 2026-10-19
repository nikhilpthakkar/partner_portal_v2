import type { SelectOption } from '../Global';
import type { ClaimsTableStatus, StatusTimelineItem } from '@/lib/types/claims-management';
import type { CommunicationLogRow, CommunicationLogStatus } from '@/lib/types/communicationLog';

export type ClaimDetailsBreadcrumb = {
  id: string;
  label: string;
  href?: string;
  isCurrent?: boolean;
};

export type ClaimSummaryItem = {
  id: string;
  label: string;
  value: string;
  isLink?: boolean;
  copyValue?: string;
};

export type ClaimSummarySection = {
  id: string;
  title: string;
  columns: ClaimSummaryItem[][];
};

export type ClaimDocumentStatus = 'Approved' | 'Under evaluation' | 'Rejected';

export type ClaimDocumentActionType = 'download' | 'view';

export type ClaimDocumentAction = {
  type: ClaimDocumentActionType;
  disabled?: boolean;
};

export type ClaimDocumentRow = {
  id: string;
  label: string;
  uploadedBy: string;
  date: string;
  note: string;
  status: ClaimDocumentStatus;
  actions: ClaimDocumentAction[];
  document: ViewDocumentItem;
};

export type ClaimCommunicationStatus = CommunicationLogStatus;

export type ClaimCommunicationRow = CommunicationLogRow;

export type ClaimDetailsPanel = {
  id: string;
  summary: ClaimSummarySection;
  documentsTable?: ClaimDocumentRow[];
  communications?: ClaimCommunicationRow[];
  timeline?: {
    title: string;
    items: StatusTimelineItem[];
  };
};

export type ClaimDetailsStatus = 'Approved' | 'Pending' | 'Rejected';

export type ShareClaimRecipient = {
  id: string;
  title: string;
  subtitle?: string;
};

export type ShareClaimChannel = {
  id: string;
  label: string;
  value: string;
  checked: boolean;
};

export type ShareClaimStatusData = {
  title: string;
  searchPlaceholder: string;
  searchValue: string;
  claimSummary?: string;
  recipients: ShareClaimRecipient[];
  selectedRecipientId: string;
  channels: ShareClaimChannel[];
  cancelLabel: string;
  shareLabel: string;
};

export type UploadDocumentsRow = {
  id: string;
  groupId?: string;
  filename?: string;
  isAdditional?: boolean;
  taskId: string;
  machineInstanceId: string;
  requestTaskId?: string;
  documentId?: string;
  pageId?: string;
  type: string;
  state: string;
  viewUrl?: string;
  uploadedAt?: Date | string;
  comment: string;
  note: string;
  isUploaded: boolean;
};

export type UploadAdditionalDocumentsData = {
  title: string;
  claimSummary: string;
  labels: {
    documentRequested: string;
    uploadedDocument: string;
  };
  placeholders: {
    documentRequested: string;
    uploadedDocument: string;
    note: string;
  };
  buttons: {
    upload: string;
    addDocument: string;
    cancel: string;
    submit: string;
  };
  options: {
    documentRequested: SelectOption[];
  };
  rows?: UploadDocumentsRow[];
};

export type ViewDocumentsData = {
  id: string;
  label: string;
  previewUrl: string;
  uploadedAt: string | Date;
  note: string;
};

export type ViewDocumentItem = {
  data: ViewDocumentsData[];
};

export type ClaimDetailsData = {
  breadcrumbs: ClaimDetailsBreadcrumb[];
  header: {
    title: string;
    statusLabel: ClaimsTableStatus;
    actionLabel: string;
  };
  panels: Record<string, ClaimDetailsPanel>;
  shareClaim: ShareClaimStatusData;
  uploadAdditionalDocuments?: UploadAdditionalDocumentsData;
};

export type ClaimTimelineData = {
  title: string;
  items: StatusTimelineItem[];
};
