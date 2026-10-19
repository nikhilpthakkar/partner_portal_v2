export type PolicyBulkUploadEndorsementActionApi = {
  endorsementType: string;
  applicable: boolean;
  reason?: string;
};

export type PolicyBulkUploadEndorsementTypeApplicableResponse = {
  data: {
    category: string;
    plan: string;
    endorsements: {
      FINANCIAL: PolicyBulkUploadEndorsementActionApi[];
      NON_FINANCIAL: PolicyBulkUploadEndorsementActionApi[];
    };
  };
  meta: {
    lob: string;
    partnerId: string;
    policyId: string;
    timestamp: string;
    traceId: string;
    errors: string[];
  };
};
