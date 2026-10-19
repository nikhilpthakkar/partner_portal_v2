import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePartnerStore } from '../store/partner.store';
import {
  fetchPolicyHealthCardPdf,
  fetchPolicyHealthCards,
  sharePolicyHealthCard,
} from '../services/policy-health-card/api';
import { usePolicyHealthCardStore } from '../store/policyHealthCard.store';
import type { HealthCardSharePayload } from '../types/policy-management/policyHealthCardApi';
import { toast } from 'sonner';

export const useGetAllPolicyHealthCardsQuery = () => {
  const { partnerId, lob, productIds } = usePartnerStore();
  const { policyId } = usePolicyHealthCardStore();

  const GET_ALL_POLICY_HEALTH_CARDS_QUERY_KEY = ['get-all-policy-health-cards'];
  return useQuery({
    queryKey: [...GET_ALL_POLICY_HEALTH_CARDS_QUERY_KEY, partnerId, lob, policyId, productIds],
    queryFn: () =>
      fetchPolicyHealthCards({
        partnerId,
        lob,
        policyId,
        productIds,
      }),
  });
};

export const useDownloadPolicyHealthCardPdfQuery = () => {
  const queryClient = useQueryClient();
  const { partnerId, lob, productIds } = usePartnerStore();
  const { policyId } = usePolicyHealthCardStore();

  const GET_POLICY_HEALTH_CARD_PDF_QUERY_KEY = ['get-policy-health-card-pdf'];

  const downloadPolicyHealthCardPdf = (uhid: string) =>
    queryClient.fetchQuery({
      queryKey: [
        ...GET_POLICY_HEALTH_CARD_PDF_QUERY_KEY,
        partnerId,
        lob,
        policyId,
        uhid,
        productIds,
      ],
      queryFn: () =>
        fetchPolicyHealthCardPdf({
          partnerId,
          lob,
          policyId,
          uhid,
          productIds,
        }),
    });

  return {
    downloadPolicyHealthCardPdf,
  };
};

export const useSharePolicyHealthCardMutation = () => {
  const { partnerId, lob, productIds } = usePartnerStore();

  return useMutation({
    mutationFn: (payload: HealthCardSharePayload) =>
      sharePolicyHealthCard({
        partnerId,
        lob,
        payload,
        productIds,
      }),
    onSuccess: () => {
      toast.success('Health card shared successfully');
    },
    onError: () => {
      toast.error('Failed to share health card');
    },
  });
};
