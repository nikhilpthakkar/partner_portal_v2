/** Status groups accepted by GET /claims/minimal for partner portal LOBs. */
export const CLAIMS_MINIMAL_API_STATUS_GROUPS = [
  'registered',
  'inprogress',
  'document_requested',
  'bank_details_requested',
  'paid',
  'rejected',
  'closed',
  'withdrawn',
] as const;

export type ClaimsMinimalApiStatusGroup = (typeof CLAIMS_MINIMAL_API_STATUS_GROUPS)[number];

export const sanitizeClaimsMinimalApiStatusGroups = (statusGroups: string[]): string[] => {
  const allowed = new Set<string>(CLAIMS_MINIMAL_API_STATUS_GROUPS);
  return statusGroups.filter((status) => allowed.has(status));
};
