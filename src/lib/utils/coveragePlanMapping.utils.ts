import { CREATE_CLAIM_TYPE_OPTIONS } from '@/lib/constants/createClaim.constants';
import type { CoverageMappingItem } from '@/lib/types/overview/coveragePlanMapping';

export const ACCIDENTAL_DEATH_COVER_ID = CREATE_CLAIM_TYPE_OPTIONS[0].id;

const normalizeId = (value: string): string => value.trim().toLowerCase();

export const getAllCoverIds = (mappings: CoverageMappingItem[]): string[] =>
  [...new Set(mappings.flatMap((mapping) => mapping.cover_ids.map(normalizeId)))].sort();

export const hasOnlyAccidentalDeathCover = (mappings: CoverageMappingItem[]): boolean => {
  const coverIds = getAllCoverIds(mappings);
  return coverIds.length === 1 && coverIds[0] === ACCIDENTAL_DEATH_COVER_ID;
};

export const getCoverIdsForPlan = (
  mappings: CoverageMappingItem[],
  planId: string,
): string[] => {
  const normalizedPlanId = normalizeId(planId);
  const mapping = mappings.find((item) => normalizeId(item.plan_id) === normalizedPlanId);
  return mapping?.cover_ids.map(normalizeId) ?? [];
};

export const isPlanEligibleForInAppClaimCreation = (
  mappings: CoverageMappingItem[],
  planId: string | undefined,
): boolean => {
  if (!planId?.trim()) {
    return false;
  }

  const planCoverIds = getCoverIdsForPlan(mappings, planId);
  return planCoverIds.includes(ACCIDENTAL_DEATH_COVER_ID);
};
