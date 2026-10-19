'use client';

import { toast } from 'sonner';

import { PolicyAutoRefundFailedBanner } from '@/components/molecules/PolicyAutoRefundFailedBanner';

const POLICY_AUTO_REFUND_FAILED_TOAST_ID = 'policy-auto-refund-failed';

type PolicyAutoRefundFailedToastOptions = {
  onReinitiateRefund: () => void;
};

export function showPolicyAutoRefundFailedToast({
  onReinitiateRefund,
}: PolicyAutoRefundFailedToastOptions) {
  toast.custom(
    (id) => (
      <PolicyAutoRefundFailedBanner
        onInitiateRefundManually={() => {
          onReinitiateRefund();
          toast.dismiss(id);
        }}
      />
    ),
    {
      id: POLICY_AUTO_REFUND_FAILED_TOAST_ID,
      duration: Infinity,
    },
  );
}

export function dismissPolicyAutoRefundFailedToast() {
  toast.dismiss(POLICY_AUTO_REFUND_FAILED_TOAST_ID);
}
