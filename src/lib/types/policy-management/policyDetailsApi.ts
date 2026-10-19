export type PolicyDetailsPremium = {
  sgst: number;
  amount: number;
  gst: number;
  cgst: number;
  igst: number;
};

export type PolicyDetailsPersonAccount = {
  number: string;
  ifsc: string;
};

export type PolicyDetailsInsured = {
  id: string;
  name: string;
  dob: string;
  user_id: number;
  phone: string;
  email: string;
  gender?: string;
  marital_status?: string;
  maritalStatus?: string;
  city?: string;
  state?: string;
  account?: PolicyDetailsPersonAccount;
  uhid?: string;
  health_card?: string;
  health_card_image?: string;
};

export type PolicyDetailsNominee = {
  id?: string;
  uhid?: string;
  name: string;
  phone: string;
  user_id: number;
  email: string;
  relationship: string;
  dob: string;
  health_card?: string;
  health_card_image?: string;
  gender?: string;
};

export type PolicyDetailsDependent = {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  dob?: string;
  relationship?: string;
  uhid?: string;
  health_card?: string;
  health_card_image?: string;
};

export type PolicyDetailsPerson = {
  insured?: PolicyDetailsInsured;
  nominee?: PolicyDetailsNominee;
  id?: string;
  dependents?: PolicyDetailsDependent[];
};

export type PolicyDetailsPlan = {
  planId?: string;
};

export type PolicyDetailsPartnerIdentifier = {
  field: string;
  displayName?: string;
  value: string;
  multiValued?: boolean;
};

export type PolicyDetailsApiPolicy = {
  status: string;
  policyId: string;
  referenceId?: string;
  startDate?: string;
  endDate?: string;
  issuedOn?: string;
  policyNumber: string;
  certificatePdf?: string;
  certificateUrl?: string;
  premium?: PolicyDetailsPremium;
  persons?: PolicyDetailsPerson[];
  planDetails?: PolicyDetailsPlan;
  planType?: string;
  category?: string;
  partnerIdentifiers?: PolicyDetailsPartnerIdentifier[];
};

export type PolicyDetailsResponse = {
  policies: PolicyDetailsApiPolicy[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
  };
};

export type PolicyDetailsFilters = {
  productIds: string[];
  policyNumber: string;
  partnerId: string;
  lob: string;
};
