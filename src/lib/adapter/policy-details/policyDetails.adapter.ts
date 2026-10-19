import type {
  PolicyDetailsPanel,
  PolicyDetailsSection,
} from '@/lib/types/policy-management/policyDetails';
import type {
  PolicyDetailsApiPolicy,
  PolicyDetailsPartnerIdentifier,
} from '@/lib/types/policy-management/policyDetailsApi';
import { formatPolicyDisplayDate } from '@/lib/utils/policyDate.utils';

const resolvePartnerIdentifierLabel = (identifier: PolicyDetailsPartnerIdentifier): string => {
  const displayName = identifier.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  return identifier.field?.trim() || '-';
};

const resolvePartnerIdentifierFields = (policy: PolicyDetailsApiPolicy) => {
  const identifiers = policy.partnerIdentifiers;
  if (!identifiers?.length) {
    return [];
  }

  return identifiers.flatMap((identifier, index) => {
    if (identifier == null) {
      return [];
    }

    const field = identifier.field?.trim();
    const value = identifier.value?.trim();
    if (!field || !value) {
      return [];
    }

    return [
      {
        id: field || `partner-identifier-${index}`,
        label: resolvePartnerIdentifierLabel(identifier),
        value,
        copyValue: value,
      },
    ];
  });
};

const resolvePolicyDetailsSections = (policy: PolicyDetailsApiPolicy): PolicyDetailsSection[] => {
  const insured = policy.persons?.[0]?.insured;
  const nominee = policy.persons?.[0]?.nominee;
  const partnerIdentifierFields = resolvePartnerIdentifierFields(policy);

  const sections: PolicyDetailsSection[] = [
    {
      id: 'policy-information',
      title: 'Policy information',
      columns: [
        [
          {
            id: 'policy-number',
            label: 'Policy number',
            value: policy.policyNumber ?? '-',
            copyValue: policy.policyNumber ?? '-',
          },
          {
            id: 'plan-id',
            label: 'Plan ID',
            value: policy.planDetails?.planId ?? '-',
          },
          {
            id: 'plan-type',
            label: 'Plan type',
            value: policy?.planType ?? '-',
          },
          {
            id: 'uhid',
            label: 'UHID',
            value: insured?.uhid ?? '-',
          },
        ],
        [
          {
            id: 'issued-date',
            label: 'Issued date',
            value: formatPolicyDisplayDate(policy.issuedOn),
          },
          {
            id: 'start-date',
            label: 'Start date',
            value: formatPolicyDisplayDate(policy.startDate),
          },
          {
            id: 'end-date',
            label: 'End date',
            value: formatPolicyDisplayDate(policy.endDate),
          },
          ...partnerIdentifierFields,
        ],
      ],
    },
    {
      id: 'customer-information',
      title: 'Customer information',
      columns: [
        [
          {
            id: 'customer-name',
            label: 'Customer name',
            value: insured?.name ?? '-',
          },
          {
            id: 'customer-email',
            label: 'Email',
            value: insured?.email ?? '-',
          },
          {
            id: 'customer-phone',
            label: 'Phone',
            value: insured?.phone ?? '-',
          },
          {
            id: 'customer-nominee',
            label: 'Nominee',
            value: `${nominee?.name ?? '-'} (${nominee?.relationship ?? '-'})`,
          },
        ],
      ],
    },
  ];

  return sections;
};

export const mapPolicyDetailsToPanel = (policy?: PolicyDetailsApiPolicy): PolicyDetailsPanel => ({
  id: 'policy-details',
  sections: policy ? resolvePolicyDetailsSections(policy) : [],
});
