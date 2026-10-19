import type { EndorsePolicyIconName } from '@/lib/types/policy-management/policyDetails';
import type { PolicyEndorsementResponse } from '@/lib/types/policy-management/policyEndorsementApi';

export type EndorsePolicyDialogAction = {
  id: string;
  title: string;
  description: string;
  icon: EndorsePolicyIconName;
  applicable: boolean;
};

export type EndorsePolicyDialogSection = {
  id: string;
  title: string;
  actions: EndorsePolicyDialogAction[];
};

type EndorsementActionConfig = Omit<EndorsePolicyDialogAction, 'applicable'>;

const ENDORSEMENT_ACTION_CONFIG: Record<string, EndorsementActionConfig> = {
  PreClosure: {
    id: 'PreClosure',
    title: 'Pre-Close policy',
    description: 'Stop coverage before the scheduled end',
    icon: 'calendar-off',
  },
  PolicyCancellation: {
    id: 'PolicyCancellation',
    title: 'Cancel policy',
    description: 'Revoke policy and void coverage immediately',
    icon: 'file-x',
  },
  InsuredUpdation: {
    id: 'InsuredUpdation',
    title: 'Update insured details',
    description: 'Edit personal info and contact details',
    icon: 'user-round',
  },
  NomineeUpdate: {
    id: 'NomineeUpdate',
    title: 'Update nominee details',
    description: 'Edit nominee info and contact details',
    icon: 'user-round-check',
  },
  DependentUpdation: {
    id: 'DependentUpdation',
    title: 'Update dependent details',
    description: 'Edit dependent info and contact details',
    icon: 'users',
  },
  DependentAddition: {
    id: 'DependentAddition',
    title: 'Update dependent details',
    description: 'Add dependent info and contact details',
    icon: 'users',
  },
};

const ENDORSEMENT_SECTIONS = [
  {
    id: 'financial',
    title: 'Financial endorsement',
    actionTypes: ['PreClosure', 'PolicyCancellation'],
  },
  {
    id: 'non-financial',
    title: 'Non-Financial endorsement',
    actionTypes: ['InsuredUpdation', 'NomineeUpdate', 'DependentUpdation'],
  },
] as const;

export const mapPolicyEndorsementDialogSections = (
  apiData?: PolicyEndorsementResponse,
): EndorsePolicyDialogSection[] => {
  const financialEndorsements = apiData?.data?.endorsements?.FINANCIAL || [];
  const nonFinancialEndorsements = apiData?.data?.endorsements?.NON_FINANCIAL || [];
  const applicableByType = new Map(
    [...financialEndorsements, ...nonFinancialEndorsements].map((endorsement) => [
      endorsement.endorsementType,
      endorsement.applicable,
    ]),
  );

  return ENDORSEMENT_SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    actions: section.actionTypes.map((actionType) => {
      const config = ENDORSEMENT_ACTION_CONFIG[actionType];
      const isDependentAction = actionType === 'DependentUpdation';

      return {
        ...config,
        applicable: isDependentAction
          ? (applicableByType.get('DependentUpdation') ?? false) ||
            (applicableByType.get('DependentAddition') ?? false)
          : (applicableByType.get(actionType) ?? false),
      };
    }),
  }));
};
