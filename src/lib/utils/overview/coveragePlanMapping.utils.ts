import type { CoverageMappingItem } from '@/lib/types/overview/coveragePlanMapping';

export const extractCoverIdsFromMappings = (
  mappings: CoverageMappingItem[] | undefined,
): string[] => {
  if (!mappings?.length) {
    return [];
  }

  return [...new Set(mappings.flatMap((mapping) => mapping.cover_ids))].sort();
};
