import { useLayoutEffect, useMemo } from 'react';
import { useCoveragePlanMappingQuery } from '@/lib/query/overview/coveragePlanMapping.queries';
import { useOverviewStore } from '@/lib/store/overview.store';
import { extractCoverIdsFromMappings } from '@/lib/utils/overview/coveragePlanMapping.utils';

/**
 * Syncs cover IDs from the coverage plan mapping into overview store state.
 * Must run before cover-filtered overview queries to avoid duplicate API calls.
 */
export const useOverviewCoverIdSync = (enabled = true): void => {
  const { data, isLoading } = useCoveragePlanMappingQuery(enabled);
  const applyCoverIdsFromMapping = useOverviewStore((state) => state.applyCoverIdsFromMapping);
  const markCoverIdsSyncPending = useOverviewStore((state) => state.markCoverIdsSyncPending);

  const mappingCoverIds = useMemo(
    () => extractCoverIdsFromMappings(data?.data?.coverage_mappings),
    [data],
  );

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    if (isLoading) {
      markCoverIdsSyncPending();
      return;
    }

    applyCoverIdsFromMapping(mappingCoverIds);
  }, [enabled, isLoading, mappingCoverIds, applyCoverIdsFromMapping, markCoverIdsSyncPending]);
};
