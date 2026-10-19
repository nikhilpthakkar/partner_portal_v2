import { Pagination } from '../Global';

export type ClaimsDetailResponse = {
  claims: ClaimsDetailData[];
  pagination: Pagination;
};

export type ClaimStatusCountItem = {
  statusGroup: string;
  count: number;
};

export type ClaimStatusCountData = {
  statusCounts: ClaimStatusCountItem[];
  totalCount: number;
};

export type DeductionDetails = {
  totalAdmissibleAmount: number;
};

export type ClaimsDetailData = {
  createdOn?: string;
  claimantName?: string;
  claimantPhone?: string;

  claimRequestNumber: string;
  policyNumber: string;
  planId: string;
  coverId: string;
  statusGroup: string;
  detailedStatus: string;
  fnolCompletedOn: Date | string;
  metadata?: ClaimMetadata;
  claimUsers: ClaimUsers;
  incidentDetails: IncidentDetails;
  bankDetails?: BankDetails;
  payments: Payment[];
  nomineeDetails?: NomineeDetails;
  policyEkey: string;
  reserveDetails?: Record<string, unknown>;
  deductionDetails?: DeductionDetails;
  statusTimeline: unknown[];
};

export type ClaimMetadata = {
  lead_insurer?: string;
  is_updated_by_handler?: boolean;
  is_eligible_for_payout?: boolean;
  update_details?: {
    classified_cover?: string;
    classified_claim_type?: string;
    updated_on?: string;
  };
};

export type ClaimUsers = {
  claimants: Claimant[];
  informant?: Informant;
  guardian?: Guardian;
};

export type Claimant = {
  name: string;
  email?: string;
  phone: string;
  userId: string;
  dob?: string;
  gender?: string;
  whatsappOptIn?: boolean;
  relationship: string;
  city?: string;
  state?: string;
};

export type Informant = {
  name: string;
  email?: string;
  phone: string;
  userId: string;
  whatsappOptIn?: boolean;
};

export type Guardian = {
  name?: string;
  whatsappOptIn?: boolean;
  relationship?: string;
};

export type IncidentDetails = {
  data: IncidentData;
};

export type IncidentData = {
  hospital_id?: string;
  hospital_name?: string;
  hospital_pincode?: string;
  is_listed_hospital?: boolean;
  incident_date?: string;
  cause_of_death?: string;

  hospitalization_date?: {
    admit?: string;
    discharge?: string;
  };

  incident_description?: string;
};

export type BankDetails = {
  id: string;
  accountHolder: string;
  type: 'upi' | 'bank';
  source: string;
  sendToCentral: boolean;

  upiId?: string;
  accountNumber?: string;
  bankName?: string;
};

export type Payment = {
  id?: string;
  claimRequestNumber: string;
  amount: number;
  claimedAmount?: number;
  status?: string;
  subType?: string;
  mode?: string;
  settlementType?: string;
  utrNumber?: string;
};

export type NomineeDetails = {
  name: string;
  phone: string;
  relation: string;
};

export type ClaimsDetailFilters = {
  fromDate: string | null;
  toDate: string | null;
  claimNumbers: string[] | null;
  insuredNames: string[] | null;
  phoneNumber: string | null;
  productIds: string[];
  insuredUserIds: string[] | null;
  policyNumber: string | null;
  partnerId: string;
  statusGroups: string[];
  lob: string;
};
