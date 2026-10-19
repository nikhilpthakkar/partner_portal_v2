import type { PolicyDetailsData } from '@/lib/types/policy-management/policyDetails';

export const POLICY_DETAILS_RESPONSE: PolicyDetailsData = {
  actions: [
    {
      id: 'download',
      label: 'Download',
      type: 'download',
      variant: 'outline',
      iconOnly: true,
    },
    {
      id: 'share',
      label: 'Share policy',
      type: 'share',
      variant: 'outline',
    },
    {
      id: 'endorse',
      label: 'Endorse policy',
      type: 'endorse',
      variant: 'primary',
    },
  ],
  tabs: [
    { value: 'policy-details', label: 'Policy details' },
    { value: 'endorsements', label: 'Endorsements' },
    { value: 'claims-history', label: 'Claims history' },
    { value: 'communication', label: 'Communication' },
    { value: 'health-cards', label: 'Health cards' },
  ],
};
