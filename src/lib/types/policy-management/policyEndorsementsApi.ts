import type { Pagination } from '@/lib/types/Global';
import type { PolicyEndorsementCreatedBy } from './policyDetails';

export type PolicyEndorsementChangeset = {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  diff: Array<{
    op: string;
    path: string;
    value: unknown;
  }>;
  changes: Array<{
    field: string;
    operation: string;
    old_value: unknown;
    new_value: unknown;
  }>;
};

export type PolicyEndorsement = {
  created_by: PolicyEndorsementCreatedBy;
  type: string;
  applicable_for: string;
  date: string;
  description: string;
  status: string;
  changeset?: PolicyEndorsementChangeset;
};

export type PolicyEndorsementsResponse = {
  policy_id: string;
  endorsements: PolicyEndorsement[];
  pagination: Pagination;
};

export type PolicyEndorsementsFilters = {
  policyNumber: string;
  partnerId: string;
  lob: string;
  page: number;
  size: number;
  includeFullData?: boolean;
};
