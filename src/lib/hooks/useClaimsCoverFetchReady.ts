import { useCoveragePlanMappingQuery } from '@/lib/query/overview/coveragePlanMapping.queries';
import { useClaimsDetailStore } from '@/lib/store/claimsDetail.store';

/**
 * Returns whether cover IDs have been synced and cover-filtered claims queries can run.
 */
export const useClaimsCoverFetchReady = (enabled = true): boolean => {
  const coverIdsInitialized = useClaimsDetailStore((state) => state.coverIdsInitialized);
  const { isLoading: isCoverageMappingLoading } = useCoveragePlanMappingQuery(enabled);

  return enabled && coverIdsInitialized && !isCoverageMappingLoading;
};
