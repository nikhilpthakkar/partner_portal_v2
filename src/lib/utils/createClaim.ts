import {
  CREATE_CLAIM_POLICY_SIDEBAR_LABELS,
  CreateClaimFlowStepId,
  type CreateClaimDetailsAccordionSectionId,
} from '@/lib/constants/createClaim.constants';
import {
  evaluateMandatoryFieldCompletion,
  type FieldCompletionRule,
  type SectionCompletionResult,
} from '@/lib/utils/fieldCompletion';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import type { PolicyDetailsApiPolicy } from '@/lib/types/policy-management/policyDetailsApi';
import { formatCurrency, formatDate, formatEnum } from '@/lib/utils';
import { isValidEmail, isValidIndianMobile } from '@/lib/utils/validation';
import { format, isAfter, isValid, parse, startOfDay, startOfToday } from 'date-fns';
import { isAxiosError } from 'axios';

const CREATE_CLAIM_DATE_STORAGE_FMT = 'yyyy-MM-dd';

const CREATE_CLAIM_URL_STATE_STEPS = new Set<CreateClaimFlowStepId>([
  CreateClaimFlowStepId.AddClaimDetails,
  CreateClaimFlowStepId.UploadRequiredDocuments,
  CreateClaimFlowStepId.BankVerification,
]);

/** `state` query values allowed after claim type is chosen. */
export function parseCreateClaimFlowUrlState(
  raw: string | null | undefined,
): CreateClaimFlowStepId | null {
  const s = raw?.trim() ?? '';
  if (!s) return null;
  const asStep = s as CreateClaimFlowStepId;
  return CREATE_CLAIM_URL_STATE_STEPS.has(asStep) ? asStep : null;
}

/** Resolve wizard step from `state` param; missing/invalid defaults to add claim details (legacy URLs). */
export function resolvePostClaimTypeStepFromUrl(urlState: string): CreateClaimFlowStepId {
  return parseCreateClaimFlowUrlState(urlState) ?? CreateClaimFlowStepId.AddClaimDetails;
}

export function formatIssuedOnDisplay(raw: string) {
  if (!raw.trim()) return '-';
  const parsed = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? raw : formatDate(parsed);
}

export function formatIssuedOnLong(raw: string) {
  if (!raw.trim()) return '-';
  const parsed = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? raw : format(parsed, 'd MMMM yyyy');
}

export function resolveSumAssured(policy: RecentSearchPolicy) {
  const n = policy.planDetails?.sumInsured;
  if (typeof n === 'number' && !Number.isNaN(n)) {
    return formatCurrency(n);
  }
  return '—';
}

export function resolveUhid(policy: RecentSearchPolicy) {
  return policy.uhid ?? policy.persons?.[0]?.insured?.uhid ?? '—';
}

export type CreateClaimNomineeDefaults = {
  nomineeName: string;
  nomineePhone: string;
  nomineeEmail: string;
  nomineeDateOfBirth: string;
};

const normalizeNomineeDobForClaimForm = (dob?: string): string => {
  if (!dob?.trim()) return '';

  const trimmed = dob.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  const ddMmYyyy = parse(trimmed, 'dd/MM/yyyy', new Date());
  if (isValid(ddMmYyyy)) {
    return format(ddMmYyyy, CREATE_CLAIM_DATE_STORAGE_FMT);
  }

  const parsed = new Date(trimmed.includes('T') ? trimmed : `${trimmed}T00:00:00`);
  if (isValid(parsed)) {
    return format(parsed, CREATE_CLAIM_DATE_STORAGE_FMT);
  }

  return '';
};

const normalizeNomineePhoneForClaimForm = (phone?: string): string => {
  const digits = phone?.replace(/\D/g, '') ?? '';
  if (!digits) return '';
  return digits.slice(-10);
};

export function getCreateClaimNomineeDefaultsFromPolicy(
  policy: RecentSearchPolicy,
): CreateClaimNomineeDefaults {
  const nominee = policy.persons?.[0]?.nominee;

  return {
    nomineeName: nominee?.name?.trim() ?? '',
    nomineePhone: normalizeNomineePhoneForClaimForm(nominee?.phone),
    nomineeEmail: nominee?.email?.trim() ?? '',
    nomineeDateOfBirth: normalizeNomineeDobForClaimForm(nominee?.dob),
  };
}

/** Maps policy-details API shape to create-claim / policy-search `RecentSearchPolicy`. */
export function mapPolicyDetailsApiPolicyToRecentSearchPolicy(
  p: PolicyDetailsApiPolicy,
): RecentSearchPolicy {
  const firstInsured = p.persons?.find((person) => person.insured != null)?.insured;

  return {
    status: p.status,
    policyId: p.policyId,
    policyNumber: p.policyNumber,
    startDate: p.startDate,
    endDate: p.endDate,
    issuedOn: p.issuedOn ?? '',
    planDetails: p.planDetails ? { planId: p.planDetails.planId } : undefined,
    premium: p.premium ? { amount: p.premium.amount } : undefined,
    persons: p.persons?.map((person) => ({
      insured: person.insured
        ? {
            name: person.insured.name,
            uhid: person.insured.uhid,
            gender: person.insured.gender,
            phone: person.insured.phone,
          }
        : undefined,
      nominee: person.nominee
        ? {
            name: person.nominee.name,
            phone: person.nominee.phone,
            email: person.nominee.email,
            dob: person.nominee.dob,
          }
        : undefined,
    })),
    certificatePdf: p.certificatePdf ?? p.certificateUrl,
    uhid: firstInsured?.uhid,
    customer: firstInsured
      ? {
          phone: firstInsured.phone,
          email: firstInsured.email,
          city: firstInsured.city,
        }
      : undefined,
  };
}

export function resolvePremiumDisplay(policy: RecentSearchPolicy) {
  const n = policy?.premium?.amount;
  if (typeof n === 'number' && !Number.isNaN(n)) {
    return formatCurrency(n);
  }
  return '—';
}

export function formatDisplayIndianPhone(raw?: string) {
  if (!raw?.trim()) return '—';
  const digits = raw.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) {
    return raw.trim();
  }
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function limitIncidentDescriptionWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ');
}

/** Parse ISO local date (`yyyy-MM-dd`) from claim form controlled string state */
export function parseCreateClaimStoredDate(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = parse(trimmed, CREATE_CLAIM_DATE_STORAGE_FMT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

/** Upper year bound for claim date pickers (current calendar year). */
export function getCreateClaimCalendarToYear(): number {
  return new Date().getFullYear();
}

export function serializeCreateClaimStoredDate(date: Date | undefined): string {
  if (!date) return '';
  return format(date, CREATE_CLAIM_DATE_STORAGE_FMT);
}

/** True when the calendar day should be blocked (future days). */
export function isCreateClaimFutureCalendarDay(date: Date): boolean {
  return isAfter(startOfDay(date), startOfToday());
}

const getDateOnlyTime = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/**
 * Incident date picker: disable outside policy period (when dates exist) and after today,
 * using the same date-only comparison as FinancialPolicyEndorsementDateStep.
 */
export function buildCreateClaimIncidentDateCalendarDisabled(policy: RecentSearchPolicy) {
  const periodDate = (raw?: string) => {
    const t = raw?.trim() ?? '';
    if (!t) return undefined;
    const d = new Date(t.includes('T') ? t : `${t}T00:00:00`);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };

  const start = periodDate(policy.startDate);
  const end = periodDate(policy.endDate);
  const todayOnly = getDateOnlyTime(new Date());

  const minDateTime = start !== undefined ? getDateOnlyTime(start) : undefined;
  let maxDateTime = todayOnly;
  if (end !== undefined) {
    const endTime = getDateOnlyTime(end);
    maxDateTime = endTime > todayOnly ? todayOnly : endTime;
  }

  return (date: Date) => {
    const selectedDateTime = getDateOnlyTime(date);

    return (
      (minDateTime !== undefined && selectedDateTime < minDateTime) ||
      (maxDateTime !== undefined && selectedDateTime > maxDateTime)
    );
  };
}

export type CreateClaimPolicySummaryRow = { label: string; value: string };

export function buildCreateClaimPolicySummaryRows(
  selectedPolicy: RecentSearchPolicy,
  insuredSummaryName: string,
): CreateClaimPolicySummaryRow[] {
  return [
    { label: CREATE_CLAIM_POLICY_SIDEBAR_LABELS.policyNumber, value: selectedPolicy.policyNumber },
    { label: CREATE_CLAIM_POLICY_SIDEBAR_LABELS.uhid, value: resolveUhid(selectedPolicy) },
    {
      label: CREATE_CLAIM_POLICY_SIDEBAR_LABELS.productName,
      value: formatEnum(selectedPolicy.planDetails?.planId ?? '—'),
    },
    {
      label: CREATE_CLAIM_POLICY_SIDEBAR_LABELS.customerName,
      value: insuredSummaryName,
    },
    {
      label: CREATE_CLAIM_POLICY_SIDEBAR_LABELS.city,
      value: selectedPolicy.customer?.city ?? '—',
    },
    {
      label: CREATE_CLAIM_POLICY_SIDEBAR_LABELS.phone,
      value: formatDisplayIndianPhone(selectedPolicy.customer?.phone),
    },
    {
      label: CREATE_CLAIM_POLICY_SIDEBAR_LABELS.premium,
      value: resolvePremiumDisplay(selectedPolicy),
    },
  ];
}

export type CreateClaimDetailsProgressValues = {
  insuredNameField: string;
  informantName: string;
  informantPhone: string;
  informantEmail: string;
  nomineeName: string;
  nomineePhone: string;
  nomineeEmail: string;
  nomineeDateOfBirth: string;
  dateOfIncident: string;
  dateOfIntimation: string;
  descriptionOfIncident: string;
};

const CREATE_CLAIM_DETAILS_SECTION_RULES: Record<
  CreateClaimDetailsAccordionSectionId,
  readonly FieldCompletionRule<CreateClaimDetailsProgressValues>[]
> = {
  'insured-informant': [
    {
      id: 'insuredName',
      isComplete: (v: CreateClaimDetailsProgressValues) => v.insuredNameField.trim() !== '',
    },
    {
      id: 'informantName',
      isComplete: (v: CreateClaimDetailsProgressValues) => v.informantName.trim() !== '',
    },
    {
      id: 'informantPhone',
      isComplete: (v: CreateClaimDetailsProgressValues) => isValidIndianMobile(v.informantPhone),
    },
    {
      id: 'informantEmail',
      isComplete: (v: CreateClaimDetailsProgressValues) => isValidEmail(v.informantEmail),
    },
  ],
  nominee: [
    {
      id: 'nomineeName',
      isComplete: (v: CreateClaimDetailsProgressValues) => v.nomineeName.trim() !== '',
    },
    {
      id: 'nomineePhone',
      isComplete: (v: CreateClaimDetailsProgressValues) => isValidIndianMobile(v.nomineePhone),
    },
    {
      id: 'nomineeEmail',
      isComplete: (v: CreateClaimDetailsProgressValues) => isValidEmail(v.nomineeEmail),
    },
    {
      id: 'nomineeDateOfBirth',
      isComplete: (v: CreateClaimDetailsProgressValues) => v.nomineeDateOfBirth.trim() !== '',
    },
  ],
  incident: [
    {
      id: 'dateOfIncident',
      isComplete: (v: CreateClaimDetailsProgressValues) => v.dateOfIncident.trim() !== '',
    },
    {
      id: 'dateOfIntimation',
      isComplete: (v: CreateClaimDetailsProgressValues) => v.dateOfIntimation.trim() !== '',
    },
    {
      id: 'descriptionOfIncident',
      isComplete: (v: CreateClaimDetailsProgressValues) => v.descriptionOfIncident.trim() !== '',
    },
  ],
};

export function getCreateClaimDetailsSectionProgress(
  sectionId: CreateClaimDetailsAccordionSectionId,
  values: CreateClaimDetailsProgressValues,
): SectionCompletionResult {
  return evaluateMandatoryFieldCompletion(CREATE_CLAIM_DETAILS_SECTION_RULES[sectionId], values);
}

export function formatCreateClaimDetailsRemainingLabel(remainingIncomplete: number): string {
  if (remainingIncomplete <= 0) return '';
  return remainingIncomplete === 1 ? '1 detail left' : `${remainingIncomplete} details left`;
}

export function readPartnerPortalApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) {
    return fallback;
  }
  const api = error.response?.data as
    | Partial<{ message?: unknown; downstreamError?: { message?: unknown } }>
    | undefined;
  const downstreamMsg =
    typeof api?.downstreamError?.message === 'string' && api.downstreamError.message.trim() !== ''
      ? api.downstreamError.message.trim()
      : null;
  const topMsg =
    typeof api?.message === 'string' && api.message.trim() !== '' ? api.message.trim() : null;
  return downstreamMsg ?? topMsg ?? fallback;
}

export function formatDeathClaimCreatedSuccessMessage(
  insuredDisplayName: string,
  policyNumber: string,
  claimId: string,
): string {
  return `Death claim for ${insuredDisplayName} with policy number ${policyNumber} was created successfully. Claim ID is ${claimId}`;
}
