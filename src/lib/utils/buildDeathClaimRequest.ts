import type { CreateDeathClaimRequestBody } from '@/lib/types/claims-management/deathClaimApi';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';

function resolveInsuredPhone(policy: RecentSearchPolicy, fallback: string): string {
  const fromPerson = policy.persons?.find((p) => p.insured?.phone)?.insured?.phone?.trim();
  if (fromPerson) return fromPerson;
  const fromCustomer = policy.customer?.phone?.trim();
  if (fromCustomer) return fromCustomer;
  return fallback.trim();
}

export type BuildDeathClaimRequestInput = {
  coverId: string;
  policyNumber: string;
  selectedPolicy: RecentSearchPolicy;
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

export function buildCreateDeathClaimRequestBody(
  input: BuildDeathClaimRequestInput,
): CreateDeathClaimRequestBody {
  const insuredPhone = resolveInsuredPhone(input.selectedPolicy, input.nomineePhone);

  return {
    cover_id: input.coverId,
    policy_number: input.policyNumber.trim(),
    incident_details: {
      incident_description: input.descriptionOfIncident?.trim() ?? '',
      incident_date: input.dateOfIncident.trim(),
      intimation_date: input.dateOfIntimation.trim(),
    },
    claimant_details: [
      {
        name: input.nomineeName.trim(),
        phone: input.nomineePhone.trim(),
        email: input.nomineeEmail.trim(),
        whatsapp_opt_in: false,
        type: 'CLAIMANT',
        dob: input.nomineeDateOfBirth.trim(),
      },
      {
        type: 'INFORMANT',
        name: input.informantName.trim(),
        phone: input.informantPhone.trim(),
        email: input.informantEmail.trim(),
      },
      {
        type: 'INSURED',
        name: input.insuredNameField.trim(),
        phone: insuredPhone,
      },
    ],
  };
}
