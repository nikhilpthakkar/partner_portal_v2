import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { updatePartnerOverviewConfiguration } from '@/lib/services/overview/api';
import type { UpdatePartnerOverviewConfigurationRequest } from '@/lib/types/overview/config';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { OVERVIEW_CONFIG_QUERY_KEY } from '@/lib/query/overview/overviewConfig.queries';

export const useUpdateOverviewConfigMutation = () => {
  const queryClient = useQueryClient();
  const { partnerId } = usePartnerConfigReady();

  return useMutation({
    mutationFn: (payload: UpdatePartnerOverviewConfigurationRequest) => {
      if (!partnerId) {
        throw new Error('Partner configuration not ready');
      }

      return updatePartnerOverviewConfiguration({ partnerId, payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OVERVIEW_CONFIG_QUERY_KEY });
      toast.success('Metrics configuration saved');
    },
    onError: () => {
      toast.error('Failed to save metrics configuration');
    },
  });
};
