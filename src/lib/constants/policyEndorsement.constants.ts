import { SelectOption } from '../types/Global';

export const POLICY_ENDORSEMENT_HEADER = {
  title: 'Endorse policy',
  description: 'Selected policy',
  notice:
    'Policy changes reflect immediately. In scenarios involving bank account refunds, transfers can take 2-3 days. ',
};

export const FINANCIAL_POLICY_ENDORSEMENT_HEADER = {
  PreClosure: {
    title: 'Endorse policy: Pre-close policy',
    description: 'Selected policy',
    dateTitle: 'Select closure date',
  },
  PolicyCancellation: {
    title: 'Endorse policy: Cancel policy',
    description: 'Selected policy',
    dateTitle: 'Select cancellation date',
  },
};

export const FINANCIAL_POLICY_ENDORSEMENT_STEPS: Record<string, { id: string; title: string }> = {
  CLOSURE_DATE: {
    id: 'CLOSURE_DATE',
    title: 'Select closure date',
  },
  REFUND_DETAILS: {
    id: 'REFUND_DETAILS',
    title: 'Refund details',
  },
  REFUND_DESTINATION: {
    id: 'REFUND_DESTINATION',
    title: 'Select refund mode',
  },
  CANCELLATION_DATE: {
    id: 'CANCELLATION_DATE',
    title: 'Select cancellation date',
  },
} as const;

export const ADD_NEW_BANK_ACCOUNT_VALUE = 'add-new-account';
export const BANK_OPTIONS = [
  'Axis Bank',
  'Bandhan Bank',
  'Bank of Baroda',
  'Bank of India',
  'Canara Bank',
  'Central Bank of India',
  'City Union Bank',
  'Federal Bank',
  'HDFC Bank',
  'ICICI Bank',
  'IDBI Bank',
  'IDFC FIRST Bank',
  'Indian Bank',
  'Indian Overseas Bank',
  'IndusInd Bank',
  'Jammu & Kashmir Bank',
  'Karnataka Bank',
  'Karur Vysya Bank',
  'Kotak Mahindra Bank',
  'Punjab & Sind Bank',
  'Punjab National Bank',
  'RBL Bank',
  'South Indian Bank',
  'State Bank of India',
  'Tamilnad Mercantile Bank',
  'UCO Bank',
  'Union Bank of India',
  'YES Bank',
] as const;

export const GENDER_OPTIONS: SelectOption[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const MARITAL_STATUS_OPTIONS: SelectOption[] = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
] as const;

export const NOMINEE_RELATIONSHIP_OPTIONS: SelectOption[] = [
  { value: 'Mother', label: 'Mother' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother-in-Law', label: 'Mother-in-Law' },
  { value: 'Father-in-Law', label: 'Father-in-Law' },
  { value: 'Husband', label: 'Husband' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Sister', label: 'Sister' },
] as const;

export const DEPENDENT_RELATIONSHIP_OPTIONS: SelectOption[] = [
  { value: 'Mother', label: 'Mother' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother-in-Law', label: 'Mother-in-Law' },
  { value: 'Father-in-Law', label: 'Father-in-Law' },
  { value: 'Husband', label: 'Husband' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
] as const;

export const NON_FINANCIAL_POLICY_ENDORSEMENT_STEPS: Record<string, { id: string; title: string }> =
  {
    SELECT_INSURED: {
      id: 'SELECT_INSURED',
      title: 'Select insured',
    },
    INSURED_UPDATION: {
      id: 'INSURED_UPDATION',
      title: 'Insured updation',
    },
    NOMINEE_UPDATE: {
      id: 'NOMINEE_UPDATE',
      title: 'Nominee update',
    },
    NOMINEE_FORM: {
      id: 'NOMINEE_FORM',
      title: 'Nominee details',
    },
  } as const;
