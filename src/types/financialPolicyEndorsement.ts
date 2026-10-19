import type { PolicyRefundBankDetail } from '@/lib/types/policy-management/policyRefundApi';

export type NewBankAccountFormValues = {
  insuredPersonId: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  accountHolderName: string;
  ifscCode: string;
};

export type BankValidationConfirmation = {
  policyHolderName: string;
  bankAccountName: string;
  isNameMatch: boolean;
};

export type BankAccountOption = {
  value: string;
  label: string;
  details: PolicyRefundBankDetail;
};

export const DEFAULT_NEW_BANK_ACCOUNT_FORM: NewBankAccountFormValues = {
  insuredPersonId: '',
  bankName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  accountHolderName: '',
  ifscCode: '',
};
