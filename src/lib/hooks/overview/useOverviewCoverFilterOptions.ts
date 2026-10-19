import { useMemo } from 'react';
import type { SelectOption } from '@/lib/types/Global';
import { useCoveragePlanMappingQuery } from '@/lib/query/overview/coveragePlanMapping.queries';
import { formatEnum } from '@/lib/utils';
import { extractCoverIdsFromMappings } from '@/lib/utils/overview/coveragePlanMapping.utils';
import { useOverviewCoverIdSync } from './useOverviewCoverIdSync';

type OverviewCoverFilterOptions = {
  coverOptions: SelectOption[];
  isLoading: boolean;
  isError: boolean;
};

/**
 * Provides cover filter UI options and keeps store cover IDs in sync with mapping.
 */
export const useOverviewCoverFilterOptions = (enabled = true): OverviewCoverFilterOptions => {
  useOverviewCoverIdSync(enabled);

  const { data, isLoading, isError } = useCoveragePlanMappingQuery(enabled);

  const coverOptions = useMemo(() => {
    const coverIds = extractCoverIdsFromMappings(data?.data?.coverage_mappings);

    return coverIds.map((id) => ({
      value: id,
      label: formatEnum(id),
    }));
  }, [data]);

  return {
    coverOptions,
    isLoading,
    isError,
  };
};
