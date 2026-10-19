export type DeathClaimClaimantDetailClaimant = {
  name: string;
  phone: string;
  email: string;
  whatsapp_opt_in: boolean;
  type: 'CLAIMANT';
  dob: string;
};

export type DeathClaimClaimantDetailInformant = {
  type: 'INFORMANT';
  name: string;
  phone: string;
  email: string;
};

export type DeathClaimClaimantDetailInsured = {
  type: 'INSURED';
  name: string;
  phone: string;
};

export type DeathClaimClaimantDetail =
  | DeathClaimClaimantDetailClaimant
  | DeathClaimClaimantDetailInformant
  | DeathClaimClaimantDetailInsured;

export type CreateDeathClaimRequestBody = {
  cover_id: string;
  policy_number: string;
  incident_details: {
    incident_description: string;
    incident_date: string;
    intimation_date: string;
  };
  claimant_details: DeathClaimClaimantDetail[];
};

export type CreateDeathClaimResponseData = {
  claimRequestNumber: string;
  machineInstanceId: string;
};

export type CreateDeathClaimResponse = {
  success: boolean;
  message: string;
  data: CreateDeathClaimResponseData;
  meta: {
    traceId: string;
    timestamp: string;
  };
};

/** GET …/death-claims/required-documents — per-document metadata from API */
export type DeathClaimRequiredDocument = {
  name: string;
  type: string;
  required: boolean;
  extension: string[];
};

export type DeathClaimRequiredDocumentsData = {
  documentTypes: DeathClaimRequiredDocument[];
};

export type DeathClaimRequiredDocumentsResponse = {
  success: boolean;
  message: string;
  data: DeathClaimRequiredDocumentsData;
  meta: {
    traceId: string;
    timestamp: string;
  };
};

/** POST …/death-claims/{machineInstanceId}/documents */
export type SubmitDeathClaimDocumentItem = {
  document_id: string;
  type: string;
  name: string;
  url: string;
  filename: string;
  page_id: string;
};

export type SubmitDeathClaimDocumentsResponse = {
  success: boolean;
  message: string;
  meta: {
    traceId: string;
    timestamp: string;
  };
};

export type SubmitDeathClaimBankDetailsPayload = {
  account_number: string;
  ifsc_code: string;
};

export type DeathClaimBankDetailsOperationResponse = {
  success: boolean;
  message: string;
  meta?: {
    traceId: string;
    timestamp: string;
  };
};
