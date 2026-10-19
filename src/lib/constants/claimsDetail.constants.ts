import { SelectOption } from '../types/Global';

export const MAX_DATE_RANGE_DAYS = 31;

export const HOSPITALIZATION_IPD_FHPL_COVER_ID = 'hospitalization_ipd_fhpl';

export const isHospitalizationIpdFhplCover = (coverId?: string): boolean =>
  coverId?.trim().toLowerCase() === HOSPITALIZATION_IPD_FHPL_COVER_ID;

export const CLAIMS_DETAIL_TABS: SelectOption[] = [
  { value: 'recent-searches', label: 'Recently Viewed' },
  { value: 'open-claims', label: 'Open claims' },
  { value: 'pending-documents', label: 'Pending documents' },
  { value: 'rejected-claims', label: 'Rejected claims' },
  { value: 'settled-claims', label: 'Settled claims' },
];

export const statusGroups: Record<string, string[]> = {
  'open-claims': ['registered', 'inprogress', 'document_requested', 'bank_details_requested'],
  'pending-documents': ['document_requested', 'bank_details_requested'],
  'rejected-claims': ['rejected'],
  'settled-claims': ['paid'],
};

export const CLAIMS_DETAIL_FILTER_OPTIONS = [
  { value: 'claimNumbers', label: 'Claim number' },
  { value: 'policyNumbers', label: 'Policy number' },
  { value: 'phoneNumbers', label: 'Phone number' },
];

export const CLAIMS_COVER_FILTER_ALL_LABEL = 'All covers';

export const CLAIM_DETAILS_TABS = [
  { value: 'claim-overview', label: 'Claim overview' },
  { value: 'claimant-information', label: 'Claimant information' },
  { value: 'documents-uploaded', label: 'Documents' },
  { value: 'communication-log', label: 'Communication log' },
];

export const DEFAULT_TAB = 'claim-overview';

export const DOCUMENTS_TABLE_LABELS = {
  documentLabel: 'Label',
  uploadedBy: 'Uploaded by',
  date: 'Date',
  notes: 'Notes',
  status: 'Status',
  action: 'Action',
};

export const COMMUNICATION_TABLE_LABELS = {
  type: 'Type',
  recipientType: 'Recipient type',
  subject: 'Subject',
  date: 'Date',
  status: 'Status',
  target: 'Recipient',
};

export const DOCUMENTS_TABLE_HEADERS = [
  { id: 'documentLabel', label: DOCUMENTS_TABLE_LABELS.documentLabel },
  { id: 'uploadedBy', label: DOCUMENTS_TABLE_LABELS.uploadedBy },
  { id: 'date', label: DOCUMENTS_TABLE_LABELS.date },
  { id: 'notes', label: DOCUMENTS_TABLE_LABELS.notes },
  { id: 'status', label: DOCUMENTS_TABLE_LABELS.status },
  { id: 'action', label: DOCUMENTS_TABLE_LABELS.action },
];

export const COMMUNICATION_TABLE_HEADERS = [
  { id: 'type', label: COMMUNICATION_TABLE_LABELS.type },
  { id: 'target', label: COMMUNICATION_TABLE_LABELS.target },
  { id: 'recipientType', label: COMMUNICATION_TABLE_LABELS.recipientType },
  { id: 'subject', label: COMMUNICATION_TABLE_LABELS.subject },
  { id: 'date', label: COMMUNICATION_TABLE_LABELS.date },
  { id: 'status', label: COMMUNICATION_TABLE_LABELS.status },
];

export const VIEW_DOCUMENTS_DIALOG_TITLE = 'View documents';

export const UPLOAD_DOCUMENTS_DIALOG_TITLE = 'Upload documents';
export const UPLOAD_DOCUMENTS_DIALOG_CLAIM_SUMMARY = 'Claim ID CL0000001 | Rajesh Kumar';
export const UPLOAD_DOCUMENTS_DIALOG_LABELS = {
  documentRequested: 'Document requested',
  uploadedDocument: 'Uploaded document',
};

export const UPLOAD_DOCUMENTS_DIALOG_PLACEHOLDERS = {
  documentRequested: 'Select document',
  uploadedDocument: 'No doc uploaded',
  note: 'Notes about this document (optional)',
};

export const UPLOAD_DOCUMENTS_DIALOG_BUTTONS = {
  upload: 'Upload',
  addDocument: 'Upload additional files',
  cancel: 'Cancel',
  submit: 'Upload document',
};

export const UPLOAD_DOCUMENTS_DIALOG_DEFAULT_OPTIONS = {
  documentRequested: [] as SelectOption[],
};

export const UPLOAD_DOCUMENTS_DIALOG_GROUPS = {
  additional: {
    id: 'additional',
    label: 'additional document(s) required',
  },
  reupload: {
    id: 'reupload',
    label: 'document(s) requires reupload',
  },
};

export const CLAIMS_MANAGEMENT_HEADER_RESPONSE = {
  header: {
    title: 'Claims management',
    subtitle: 'Manage, share, and track claims across your business',
    primaryActionLabel: {
      label: 'Create claim',
      icon: 'plus',
    },
  },
  topTabs: [{ value: 'claims-overview', label: 'Claims overview' }],
  table: {
    labels: {
      claimNumber: 'Claim number',
      cover: 'Cover',
      claimantName: 'Claimant name',
      claimantPhone: 'Claimant phone',
      createdOn: 'Created on',
      status: 'Status',
      actions: 'Actions',
    },
  },
  defaults: {
    topTab: 'claims-overview',
    activeTab: 'recent-searches',
    searchFilter: 'policy-number',
  },
};
