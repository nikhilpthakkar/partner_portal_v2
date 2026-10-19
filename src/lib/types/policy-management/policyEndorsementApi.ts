export type PolicyDependentCount = {
  adults: number;
  children: number;
  parents: number;
};

export type PolicyDependentMaximumAllowed = {
  adults: number;
  children: number;
};

export type PolicyDependentRemainingCapacity = {
  adults: number;
  children: number;
  parents: number;
  validRelationships: string[];
};

export type PolicyDependentAdditionConstraints = {
  currentDependentsCount: PolicyDependentCount;
  maximumAllowed: PolicyDependentMaximumAllowed;
  remainingCapacity: PolicyDependentRemainingCapacity;
  validRelationships: string[];
  maritalBased: boolean;
  ageValidationRules?: PolicyDependentAgeValidationRules;
};

export type PolicyDependentUpdationConstraints = {
  validRelationships: string[];
  ageValidationRules?: PolicyDependentAgeValidationRules;
};

export type PolicyDependentAgeRange = {
  min: number;
  max: number;
};

export type PolicyDependentAgeValidationRules = {
  self?: number;
  spouse?: number;
  children?: number;
  dependentAgeRange?: PolicyDependentAgeRange;
};

export type PreClosureDateRangeInfo = {
  fromDate: string;
  toDate: string;
  freeLookPeriodDays: number;
};

export type PolicyEndorsementActionApi = {
  endorsementType: string;
  applicable: boolean;
  reason?: string;
  dependentAdditionConstraints?: PolicyDependentAdditionConstraints;
  dependentUpdationConstraints?: PolicyDependentUpdationConstraints;
  preClosureDateRangeInfo?: PreClosureDateRangeInfo;
};

export type PolicyEndorsementResponse = {
  data: {
    policyId: string;
    plan: string;
    endorsements: {
      FINANCIAL: PolicyEndorsementActionApi[];
      NON_FINANCIAL: PolicyEndorsementActionApi[];
    };
  };
  meta: {
    lob: string;
    partnerId: string;
    policyId: string;
    timestamp: string;
    traceId: string;
    errors: string[];
  };
};
