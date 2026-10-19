import { useCoveragePlanMappingQuery } from '@/lib/query/overview/coveragePlanMapping.queries';
import { useOverviewStore } from '@/lib/store/overview.store';

/**
 * Returns whether cover IDs have been synced and cover-filtered queries can run.
 */
export const useOverviewCoverFetchReady = (enabled = true): boolean => {
  const coverIdsInitialized = useOverviewStore((state) => state.coverIdsInitialized);
  const { isLoading: isCoverageMappingLoading } = useCoveragePlanMappingQuery(enabled);

  return enabled && coverIdsInitialized && !isCoverageMappingLoading;
};
