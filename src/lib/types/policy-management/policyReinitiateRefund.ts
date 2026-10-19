export type PolicyRetryRefundOption =
  | 'correct_bank_details'
  | 'add_bank_account'
  | 'partner_bank_account';

export type PolicyReinitiateRefundFormValues = {
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  accountHolderName: string;
  ifscCode: string;
};

export type PolicyReinitiateRefundFormErrors = Partial<
  Record<keyof PolicyReinitiateRefundFormValues, string>
>;

export type PolicyReinitiateRefundAccountDetails = {
  accountNumber: string;
  ifsc: string;
  accountHolder: string;
  bankName: string;
};

export type PolicyReinitiateRefundRequestPayload = {
  plan: string;
  paymentId: string;
  entityType: string;
  accountDetails: PolicyReinitiateRefundAccountDetails;
};

export type PolicyReinitiateRefundResponse = {
  success?: boolean;
  message?: string;
};

export type PolicyReinitiateRefundContext = {
  paymentId: string;
  entityType: string;
  bankName: string;
};
