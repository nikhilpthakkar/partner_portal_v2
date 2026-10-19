import type { ApiResponse } from '@/lib/types/Global';
import type { ManualRefundData } from '@/lib/types/manual-refunds/manualRefundsApi';

export type PremiumBreakup = {
  amount: number;
  gst: number;
  sgst: number;
  cgst: number;
  igst: number;
  breakup: Record<string, string | number | boolean | null>[];
};

export type PolicyRefundPremiumValue = number | PremiumBreakup;

export type PolicyRefundCalculationData = {
  plan: string;
  originalPremium: PremiumBreakup;
  updatedPremium: PremiumBreakup;
  refundPremium: PremiumBreakup;
  withinFreeLookPeriod: boolean;
};

export type PolicyRefundCalculationFilters = {
  policyId: string;
  productIds: string[];
  partnerId: string;
  plan: string;
  lob: string;
  cancellationDate: string;
};

export type PolicyRefundCalculationResponse = ApiResponse<
  PolicyRefundCalculationData,
  PolicyRefundCalculationFilters
>;

export type PolicyRefundBankDetail = {
  ifsc?: string | null;
  accountHolder?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
};

export type PolicyRefundBankDetailsFilters = {
  partner: string;
  policyId: string;
  productIds: string[];
  plan: string;
  lob: string;
};

export type PolicyRefundBankDetailsResponse = ApiResponse<
  PolicyRefundBankDetail[],
  PolicyRefundBankDetailsFilters
>;

export type PolicyValidateBankAccountPayload = {
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
};

export type PolicyValidateBankAccountData = {
  isValid: boolean;
  matchRatio: number;
  verifiedAccountHolderName: string;
  providedAccountHolderName: string;
  accountNumber: string;
  ifsc: string;
  validationStatus: string;
};

export type PolicyValidateBankAccountFilters = {
  productIds: string[];
  partnerId: string;
  ifsc: string;
  lob: string;
};

export type PolicyValidateBankAccountResponse = ApiResponse<
  PolicyValidateBankAccountData,
  PolicyValidateBankAccountFilters
> & {
  success?: boolean;
  message?: string;
};

export type PolicyEndorsementType =
  | 'PRE_CLOSURE'
  | 'CANCELLATION'
  | 'UPDATE_NOMINEE'
  | 'UPDATE_INSURED'
  | 'UPDATE_DEPENDENT';

export type PolicyRefundMode = 'FLOAT' | 'ACCOUNT';

export type PolicyEndorseBankAccount = {
  ifsc: string;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
};

type PolicyEndorsePolicyPayloadBase = {
  plan: string;
  endorsementType: PolicyEndorsementType;
  updatedOn: string;
  category?: string;
};

export type PolicyEndorseNominee = {
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender?: string;
  relationship: string;
  plan: string;
};

export type PolicyEndorseInsured = {
  id: string;
  name: string;
  dob: string;
  user_id: number;
  phone: string;
  email: string;
  gender?: string;
  uhid?: string;
  health_card?: string;
  no_of_stops?: number;
  advance_purchase_window?: number;
};

export type PolicyEndorseInsuredUpdate = Partial<
  Pick<PolicyEndorseInsured, 'name' | 'dob' | 'phone' | 'email' | 'gender'>
> & {
  maritalStatus?: string;
};

export type PolicyEndorseDependent = {
  id?: string;
  name: string;
  dob: string;
  user_id: number;
  phone: string;
  email: string;
  gender?: string;
  relationship?: string;
  uhid?: string;
  health_card?: string;
  no_of_stops?: number;
  advance_purchase_window?: number;
};

export type PolicyEndorseDependentUpdateType = 'CREATE' | 'UPDATE' | 'DELETE';

export type PolicyEndorsePerson = {
  id: string;
  insured: PolicyEndorseInsured;
  dependents?: PolicyEndorseDependent[];
};

export type PolicyEndorseInsuredUpdatePerson = {
  id: string;
  insured: PolicyEndorseInsuredUpdate;
};

export type PolicyEndorsePolicyPayload =
  | (PolicyEndorsePolicyPayloadBase & {
      refundMode: 'FLOAT';
    })
  | (PolicyEndorsePolicyPayloadBase & {
      refundMode: 'ACCOUNT';
      bankAccount: PolicyEndorseBankAccount;
    })
  | (PolicyEndorsePolicyPayloadBase & {
      endorsementType: 'UPDATE_NOMINEE';
      refundMode: 'ACCOUNT';
      nominee: PolicyEndorseNominee;
      insuredPhone?: string;
    })
  | (PolicyEndorsePolicyPayloadBase & {
      endorsementType: 'UPDATE_INSURED';
      endorsementProofs: string[];
      persons: PolicyEndorseInsuredUpdatePerson[];
    })
  | (PolicyEndorsePolicyPayloadBase & {
      endorsementType: 'UPDATE_DEPENDENT';
      updateType: PolicyEndorseDependentUpdateType;
      endorsementProofs: string[];
      personId: string;
      dependentId?: string;
      dependent?: PolicyEndorseDependent;
      insuredPhone?: string;
    });

export type PolicyEndorsePolicyResponse = {
  success?: boolean;
  message?: string;
};

export type PolicyRefundDetailsUiState =
  | 'MANUAL_INITIATED'
  | 'MANUAL_SETTLED'
  | 'FAILED_RETRYABLE'
  | 'IN_PROGRESS'
  | 'SUCCESS'
  | 'FAILED'
  | 'NONE'
  | (string & {});

export type PolicyRefundCustomerAccountDetails = {
  number: string;
  ifsc: string;
  name: string;
  bankName?: string;
};

export type PolicyRefundEntry = {
  cashfreeTransferId: string;
  paymentId?: string;
  requestId: string;
  refundAmount: number;
  initiatedOn: string;
  completedOn?: string;
  utr?: string | null;
  status: string;
  customerAccountDetails: PolicyRefundCustomerAccountDetails;
  userType: string;
  retryable: boolean;
  uiState: PolicyRefundDetailsUiState;
  failureReason?: string;
  originalPremium?: PolicyRefundPremiumValue | null;
  currentPremium?: PolicyRefundPremiumValue | null;
  refundSource?: string | null;
  source?: string | null;
  expectedBy?: string;
  expectedCompletionDate?: string;
};

export type PolicyManualRefund = ManualRefundData;

export type PolicyRefundDetailsData = {
  policyEkey: string;
  policyNumber: string;
  productId: string;
  uiState: PolicyRefundDetailsUiState;
  originalPremium?: PolicyRefundPremiumValue | null;
  currentPremium?: PolicyRefundPremiumValue | null;
  refundAmount?: number | null;
  refundSource?: string | null;
  source?: string | null;
  refunds: PolicyRefundEntry[];
  activeManualRefund?: PolicyManualRefund | null;
  expectedBy?: string;
  expectedCompletionDate?: string;
};

export type PolicyRefundDetailsFilters = {
  partner: string;
  policyId: string;
  productIds: string[];
  plan: string;
  lob: string;
};

export type PolicyRefundDetailsResponse = ApiResponse<
  PolicyRefundDetailsData,
  PolicyRefundDetailsFilters
>;

export type PolicyEndorsementDocumentUploadPayload = {
  requestContext: 'POLICY' | 'CLAIM';
  documentType: string;
  referenceId: string;
  document: File;
};

export type PolicyEndorsementDocumentUploadResponse = {
  type: string;
  id: string;
  name: string;
  url: string;
  page_id: string;
  created_on: string;
  key_name: string | null;
};
