export type CoverageMappingItem = {
  plan_id: string;
  cover_ids: string[];
};

export type CoveragePlanMappingPayload = {
  coverage_mappings: CoverageMappingItem[];
};

export type CoveragePlanMappingMetaFilters = {
  partnerId: string;
  productIds: string[];
  lob: string;
};
