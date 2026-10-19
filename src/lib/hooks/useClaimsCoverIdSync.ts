import { useLayoutEffect, useMemo } from 'react';
import { useCoveragePlanMappingQuery } from '@/lib/query/overview/coveragePlanMapping.queries';
import { useClaimsDetailStore } from '@/lib/store/claimsDetail.store';
import { extractCoverIdsFromMappings } from '@/lib/utils/overview/coveragePlanMapping.utils';

/**
 * Syncs cover IDs from the coverage plan mapping into claims detail store state.
 */
export const useClaimsCoverIdSync = (enabled = true): void => {
  const { data, isLoading } = useCoveragePlanMappingQuery(enabled);
  const applyCoverIdsFromMapping = useClaimsDetailStore((state) => state.applyCoverIdsFromMapping);
  const markCoverIdsSyncPending = useClaimsDetailStore((state) => state.markCoverIdsSyncPending);

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
