import type { SelectOption } from '@/lib/types/Global';

export type WizardStepId =
  | 'search-policy'
  | 'select-claim-type'
  | 'add-claim-details'
  | 'upload-required-documents'
  | 'bank-verification';

export function wizardStepIndex(step: WizardStepId): number {
  switch (step) {
    case 'search-policy':
      return 0;
    case 'select-claim-type':
      return 1;
    case 'add-claim-details':
      return 2;
    case 'upload-required-documents':
      return 3;
    case 'bank-verification':
      return 4;
    default:
      return 0;
  }
}

export type CreateClaimFilterOption = SelectOption<string>;
