/** Step titles for create-claim wizard (aligned with Partner Portal enterprise Figma). */

export enum CreateClaimFlowStepId {
  SearchPolicy = 'search-policy',
  SelectClaimType = 'select-claim-type',
  AddClaimDetails = 'add-claim-details',
  UploadRequiredDocuments = 'upload-required-documents',
  BankVerification = 'bank-verification',
}

export const CREATE_CLAIM_FLOW_STEPS = [
  { id: CreateClaimFlowStepId.SearchPolicy, ordinal: 1, label: 'Search policy' },
  { id: CreateClaimFlowStepId.SelectClaimType, ordinal: 2, label: 'Select claim type' },
  { id: CreateClaimFlowStepId.AddClaimDetails, ordinal: 3, label: 'Add claim details' },
  {
    id: CreateClaimFlowStepId.UploadRequiredDocuments,
    ordinal: 4,
    label: 'Upload documents',
  },
  { id: CreateClaimFlowStepId.BankVerification, ordinal: 5, label: 'Bank verification' },
] as const;

export const CREATE_CLAIM_TITLE = 'Create a claim';

export const CREATE_CLAIM_ROUTE_BREADCRUMBS = {
  claimsManagementLabel: 'Claims management',
  currentLabel: 'Create claim',
};

export const CREATE_CLAIM_TABLE_LABELS = {
  policyNumber: 'Policy number',
  insuredName: 'Insured name',
  productName: 'Product name',
  issuedOn: 'Issued on',
  status: 'Status',
};

export const CREATE_CLAIM_FOOTER = {
  selectPolicyHint: 'Select a policy to proceed',
  seePolicyDetailsCta: 'See policy details',
  continueCta: 'Continue to claim type',
  backCta: 'Back',
};

/** URL search param set when continuing past policy search with a selection */
export const CREATE_CLAIM_POLICY_NUMBER_QUERY_PARAM = 'policyNumber';

/** URL search param: selected claim type id after user confirms type */
export const CREATE_CLAIM_CLAIM_TYPE_QUERY_PARAM = 'claimType';

/** URL search param: localStorage draft key for add claim details */
export const CREATE_CLAIM_SESSION_QUERY_PARAM = 'claimSession';

/** URL search param: wizard step after claim type (add details / upload / bank). Omit when only selecting claim type. */
export const CREATE_CLAIM_STATE_QUERY_PARAM = 'state';

/** Set after death-claim API succeeds (continue to documents). */
export const CREATE_CLAIM_CLAIM_REQUEST_NUMBER_QUERY_PARAM = 'claimRequestNumber';

/** Set after death-claim API succeeds (continue to documents). */
export const CREATE_CLAIM_MACHINE_INSTANCE_ID_QUERY_PARAM = 'machineInstanceId';

export const CREATE_CLAIM_SELECTED_POLICY_SECTION = {
  title: 'Selected policy',
  labels: {
    policyNumber: 'Policy number',
    customerName: 'Customer name',
    productName: 'Product name',
    issuedOn: 'Issued on',
    sumAssured: 'Sum assured',
    uhid: 'UHID',
  },
};

export const CREATE_CLAIM_TYPE_SECTION = {
  title: 'Select type of claim',
  subtitle: 'Choose the category of claim that best fits the incident',
};

export const CREATE_CLAIM_TYPE_OPTIONS = [
  {
    id: 'accidental_death',
    title: 'Death claim',
    description: 'Claim for loss of life of insured',
  },
] as const;

export const CREATE_CLAIM_CLAIM_TYPE_FOOTER = {
  continueCta: 'Continue to details',
};

export const CREATE_CLAIM_DETAILS_SECTION = {
  title: 'Claim details',
  subtitle: 'Enter all mandatory details to proceed',
};

export const CREATE_CLAIM_CLAIM_DETAILS_FOOTER = {
  continueCta: 'Continue to documents',
};

/** Upload documents step — follows claim details step. */
export const CREATE_CLAIM_UPLOAD_DOCUMENTS_SECTION = {
  title: 'Upload documents',
  uploadedTitle: 'Uploaded docs',
  subtitle: 'Attach the documents listed below to proceed',
  cardHeading: 'Required documents',
};

/** Upload list row — empty file field (Figma Partner Portal). */
export const CREATE_CLAIM_UPLOAD_DOCUMENTS_EMPTY_PLACEHOLDER = 'No file chosen';

export const CREATE_CLAIM_UPLOAD_DOCUMENTS_UPLOAD_CTA = 'Upload';
export const CREATE_CLAIM_UPLOAD_DOCUMENTS_ADD_MORE_CTA = 'Add more';

/** Subsections inside the upload card (mandatory vs optional). */
export const CREATE_CLAIM_UPLOAD_DOCUMENT_GROUPS = {
  mandatory: {
    title: 'Mandatory documents',
  },
  optional: {
    title: 'Optional documents',
  },
} as const;

export const CREATE_CLAIM_UPLOAD_DOCUMENTS_FOOTER = {
  continueCta: 'Next',
};

/** Bank verification step (Figma 5876:37142). */
export const CREATE_CLAIM_BANK_VERIFICATION_SECTION = {
  title: 'Bank verification',
  subtitle: 'Please fill bank details to verify correctness of the account',
};

export const CREATE_CLAIM_BANK_FORM = {
  cardHeading: 'Enter bank account details',
  accountNumber: 'Account no.',
  ifscCode: 'IFSC code',
};

export const CREATE_CLAIM_BANK_VERIFICATION_FOOTER = {
  skipCta: 'Skip',
  submitCta: 'Submit claim',
};

export const CREATE_CLAIM_POLICY_SIDEBAR_LABELS = {
  policyNumber: 'Policy number',
  uhid: 'UHID',
  productName: 'Product name',
  customerName: 'Customer name',
  city: 'City',
  phone: 'Phone',
  premium: 'Premium',
};

/** Accordion sections (status text is computed from mandatory field completion). */
export const CREATE_CLAIM_DETAILS_ACCORDION = [
  {
    id: 'insured-informant',
    heading: 'Insured & informant details',
  },
  {
    id: 'nominee',
    heading: 'Nominee details',
  },
  {
    id: 'incident',
    heading: 'Incident details',
  },
] as const;

export type CreateClaimDetailsAccordionSectionId =
  (typeof CREATE_CLAIM_DETAILS_ACCORDION)[number]['id'];

export const CREATE_CLAIM_DETAILS_ACCORDION_COMPLETED_LABEL = 'Completed';

export const CREATE_CLAIM_INSURED_FORM_LABELS = {
  insuredName: 'Insured name',
  informantName: 'Informant name',
  informantPhone: 'Informant phone number',
  informantEmail: 'Informant email',
};

export const CREATE_CLAIM_NOMINEE_FORM_LABELS = {
  nomineeName: 'Nominee name',
  nomineePhone: 'Nominee phone',
  nomineeEmail: 'Nominee email',
  nomineeDateOfBirth: 'Date of birth (Nominee)',
};

/** Incident accordion (Figma 5876:36593). */
export const CREATE_CLAIM_INCIDENT_FORM_LABELS = {
  dateOfIncident: 'Date of incident',
  dateOfIntimation: 'Date of intimation',
  descriptionOfIncident: 'Description of incident',
};

export const CREATE_CLAIM_INCIDENT_DESCRIPTION_PLACEHOLDER = 'Enter description of incident';

export const CREATE_CLAIM_INCIDENT_WORD_LIMIT = 500;

/** Year dropdown lower bound for date-of-incident and nominee DOB pickers */
export const CREATE_CLAIM_DATE_CALENDAR_FROM_YEAR = 1900;

export const CREATE_CLAIM_GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

/** Upload grid column order (Figma 5876:37056): left column then right. */
export const CREATE_CLAIM_UPLOAD_SLOTS = [
  {
    id: 'claimant-statement',
    column: 'left' as const,
    title: 'Claimant statement',
    subtitle: 'Click to upload',
  },
  {
    id: 'kyc-documents',
    column: 'left' as const,
    title: 'KYC Documents',
    subtitle: 'Click to upload',
  },
  {
    id: 'member-info-form',
    column: 'left' as const,
    title: 'Member info form',
    subtitle: 'Click to upload',
  },
  {
    id: 'death-certificate',
    column: 'right' as const,
    title: 'Death certificate',
    subtitle: 'Click to upload',
  },
  {
    id: 'cancelled-cheque',
    column: 'right' as const,
    title: 'Cancelled cheque',
    subtitle: 'Click to upload',
  },
] as const;

export type CreateClaimUploadSlotId = (typeof CREATE_CLAIM_UPLOAD_SLOTS)[number]['id'];
