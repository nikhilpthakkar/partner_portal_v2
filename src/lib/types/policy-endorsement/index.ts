import { PolicyDetailsInsured } from '../policy-management/policyDetailsApi';

export type RefundDestination = 'float' | 'bank';

export type FinancialPolicyEndorsementStep = 1 | 2 | 3;

export type NonFinancialPolicyEndorsementProps = {
  policyNumber: string;
  policyId: string;
  plan: string;
  insuredName: string;
  endorsementType: string;
  onBackToEndorsementType: () => void;
  onEndorsementSuccess: () => Promise<void>;
};

export type InsuredOption = {
  value: string;
  label: string;
  insured: PolicyDetailsInsured | undefined;
};

export type NonFinancialEndorsementStep =
  | 'select-insured'
  | 'insured-updation'
  | 'nominee-update'
  | 'nominee-form'
  | 'dependent-update'
  | 'dependent-form';
