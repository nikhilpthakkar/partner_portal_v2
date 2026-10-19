import { Suspense } from 'react';

import PolicyDetailsPageSkelton from '@/components/molecules/skeltons/PolicyDetailsPageSkelton';
import PolicyDetails from '@/features/policy-details';

export default function PolicyDetailsPage() {
  return (
    <Suspense fallback={<PolicyDetailsPageSkelton />}>
      <PolicyDetails />
    </Suspense>
  );
}
