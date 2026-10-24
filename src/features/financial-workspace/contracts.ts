/** Proposed BFF contracts. No endpoint or service support is implied by these types. */
export type MoneyPaise = number;
export interface AuthenticatedGrant {
  walletGroups: {
    walletGroupId: string;
    /** Stable identity and editable display name are separate. */
    displayName: string;
    financial: { vanId: string; actions: ('view' | 'export' | 'dispute' | 'post' | 'approve')[] }[];
    operational: {
      partnerId: string;
      planId: string;
      module: 'policies' | 'claims' | 'manual-refunds';
      actions: ('view' | 'act')[];
    }[];
    canManageGroupName: boolean;
  }[];
  canManageAccess: boolean;
  version: string;
}
export interface FinancialReadRequest {
  walletGroupId: string;
  vanIds: string[];
  from: string;
  to: string;
  timezone: 'Asia/Kolkata';
  cursor?: string;
}
export interface FinancialCommandRequest<T> {
  walletGroupId: string;
  requestId: string;
  idempotencyKey: string;
  expectedRevision: string;
  payload: T;
}
export type FinancialCommandOutcome<T> =
  | { status: 'committed'; requestId: string; revision: string; result: T }
  | { status: 'pending'; requestId: string; retryAfterMs: number }
  | {
      status: 'rejected';
      requestId: string;
      code:
        | 'FORBIDDEN'
        | 'REVISION_CONFLICT'
        | 'DUPLICATE_REFERENCE'
        | 'SOURCE_UNAVAILABLE'
        | 'INVALID';
      fieldErrors?: Record<string, string>;
      message: string;
    };
export interface VerifiedPayoutEvent {
  eventId: string;
  obligationId: string;
  attemptId: string;
  state: 'pending' | 'failed' | 'settled';
  completedAt?: string;
  utr?: string;
  amountPaise: MoneyPaise;
}
export interface SourceStamp {
  cutoff: string;
  sourceWatermarks: Record<string, string>;
  reconciliation: 'matched' | 'mismatch' | 'delayed';
  revision: string;
  grantVersion: string;
}
