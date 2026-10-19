export type PolicyManualRefundDestination = 'partner' | 'customer';

export type PolicyManualRefundFormValues = {
  policyNumber: string;
  accountHolderName: string;
  remark: string;
  utr: string;
  bankAccountDetails: string;
  ifsc: string;
  refundAmount: string;
  priority: string;
  refundDestination: PolicyManualRefundDestination | '';
};

export type PolicyManualRefundFormErrors = Partial<
  Record<keyof PolicyManualRefundFormValues, string>
>;

export type PolicyManualRefundRequestPayload = {
  plan: string;
  accountNumber: string;
  ifsc: string;
  accountHolder: string;
  refundAmount: number;
  remark: string;
  utr?: string;
  priority: string;
  refundDestination: PolicyManualRefundDestination;
};

export type PolicyManualRefundResponse = {
  success?: boolean;
  message?: string;
};
