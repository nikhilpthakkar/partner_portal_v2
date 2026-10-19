import { useQuery } from '@tanstack/react-query';
import { fetchOverviewConfig } from '@/lib/services/overview/api';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';

export const OVERVIEW_CONFIG_QUERY_KEY = ['overview-config'];

export const useOverviewConfigQuery = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();

  return useQuery({
    queryKey: [...OVERVIEW_CONFIG_QUERY_KEY, partnerId, lob],
    queryFn: () => fetchOverviewConfig({ partnerId, lob }),
    enabled: isReady && Boolean(partnerId) && Boolean(lob),
  });
};
