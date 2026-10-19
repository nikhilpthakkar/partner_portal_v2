import { useQuery } from '@tanstack/react-query';
import { fetchCoveragePlanMapping } from '@/lib/services/overview/api';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { usePartnerStore } from '@/lib/store/partner.store';

export const COVERAGE_PLAN_MAPPING_QUERY_KEY = ['coverage-plan-mapping'];

export const useCoveragePlanMappingQuery = (enabled = true) => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery({
    queryKey: [...COVERAGE_PLAN_MAPPING_QUERY_KEY, partnerId, lob, productIds],
    queryFn: () => fetchCoveragePlanMapping({ partnerId, lob, productIds }),
    enabled: enabled && isReady && productIds.length > 0,
  });
};
