import type { Pagination } from '@/lib/types/Global';

export type PolicyClaimMetadata = {
  is_eligible_for_payout: boolean;
  lead_insurer: string;
};

export type PolicyClaimUser = {
  name: string;
  email?: string;
  phone?: string;
  userId?: string;
  dob?: string;
  gender?: string;
  whatsappOptIn?: boolean;
  relationship?: string;
  city?: string;
  state?: string;
};

export type PolicyClaimGuardian = {
  name?: string;
  whatsappOptIn?: boolean;
  relationship?: string;
};

export type PolicyClaimUsers = {
  claimants: PolicyClaimUser[];
  informant?: PolicyClaimUser;
  guardian?: PolicyClaimGuardian;
};

export type PolicyClaimIncidentData = {
  incident_date?: string;
  hospitalization_date?: string | Record<string, never> | null;
  incident_description?: string;
};

export type PolicyClaimIncidentDetails = {
  data: PolicyClaimIncidentData;
};

export type PolicyClaimBankDetails = {
  accountHolder?: string;
  type?: string;
  upiId?: string;
  source?: string;
  sendToCentral?: boolean;
  id?: string;
};

export type PolicyClaimPayment = {
  amount?: number;
};

export type PolicyClaimDocument = {
  documentId: string;
  state: string;
  type: string;
  createdOn: string;
  pageId: string;
  claimRequestNumber: string;
};

export type PolicyClaim = {
  claimRequestNumber: string;
  statusGroup: string;
  detailedStatus: string;
  fnolCompletedOn?: string;
  metadata?: PolicyClaimMetadata;
  claimUsers?: PolicyClaimUsers;
  incidentDetails?: PolicyClaimIncidentDetails;
  bankDetails?: PolicyClaimBankDetails;
  payments?: PolicyClaimPayment[];
  documents?: PolicyClaimDocument[];
  reserveDetails?: Record<string, never>;
};

export type PolicyClaimsResponse = {
  claims: PolicyClaim[];
  pagination: Pagination;
};

export type PolicyClaimsFilters = {
  fromDate: string | null;
  insuredNames: string[] | null;
  productIds: string[];
  insuredUserIds: string[] | null;
  toDate: string | null;
  policyNumber: string;
  partnerId: string;
  statusGroups: string[] | null;
  lob: string;
};
