import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchAllRecipients, policyShareTrigger } from '@/lib/services/policy-share/api';
import { usePartnerStore } from '@/lib/store/partner.store';
import { usePolicyShareStore } from '@/lib/store/policyShare.store';
import type { PolicyShareTriggerPayload } from '@/lib/types/policy-management/policyShareApi';
import { toast } from 'sonner';

export const GET_ALL_RECIPIENTS_QUERY_KEY = ['get-all-recipients'];

export const useGetAllRecipientsQuery = () => {
  const { partnerId, lob, productIds } = usePartnerStore();
  const { policyId, isDialogOpen } = usePolicyShareStore();

  return useQuery({
    queryKey: [...GET_ALL_RECIPIENTS_QUERY_KEY, partnerId, lob, policyId, productIds],
    queryFn: () =>
      fetchAllRecipients({
        policyId,
        partnerId,
        lob,
        productIds,
      }),
    enabled: isDialogOpen && Boolean(policyId),
  });
};

export const usePolicyShareTriggerMutation = () => {
  const { partnerId, lob, productIds } = usePartnerStore();

  return useMutation({
    mutationFn: (payload: PolicyShareTriggerPayload) =>
      policyShareTrigger({ partnerId, lob, payload, productIds }),
    onSuccess: () => {
      toast.success('The policy details have been successfully sent to the requested recipient.');
    },
    onError: () => {
      toast.error('Failed to send policy share request');
    },
  });
};
