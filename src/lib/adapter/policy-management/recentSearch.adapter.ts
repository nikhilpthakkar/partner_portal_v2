import type { PolicyTableRow, RecentSearchPolicy } from '@/lib/types/policy-management';
import { formatEnum } from '@/lib/utils';

const resolveIssuedOn = (issuedOn?: string): string => {
  if (!issuedOn) {
    return '';
  }

  return issuedOn.includes('T') ? issuedOn.split('T')[0] : issuedOn;
};

const resolveStatus = (status = ''): string => status.toLowerCase();

export const mapRecentSearchPoliciesToRows = (policies: RecentSearchPolicy[]): PolicyTableRow[] =>
  policies.map((policy) => ({
    id: policy.policyId,
    policyNumber: policy.policyNumber,
    insuredName: policy.persons?.[0]?.insured?.name ?? '-',
    customerPhone: policy?.customer?.phone ?? '-',
    productName: policy.planDetails?.planId ?? '-',
    issuedOn: resolveIssuedOn(policy.issuedOn),
    status: resolveStatus(policy.status),
    actions: [],
    certificatePdf: policy.certificatePdf,
  }));
