import type { ApiResponse } from '@/lib/types/Global';

export type ManualRefundStatus = 'initiated' | 'settled';

export type ManualRefundPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export type ManualRefundInstrumentType = 'BANK' | 'UPI';

export type InitiatedByDetails = {
  userType?: string | null;
  user_type?: string | null;
  userIdV1?: string | null;
  user_id_v1?: string | null;
  email?: string | null;
  name?: string | null;
};

/** Flat instrument fields on all BFF → portal manual refund responses. */
export type ManualRefundData = {
  id: number;
  policyId?: number | null;
  policyEkey?: string | null;
  policyNumber?: string | null;
  partnerId?: string | null;
  planId?: string | null;
  instrumentType?: ManualRefundInstrumentType | string | null;
  accountNumber?: string | null;
  ifsc?: string | null;
  accountHolder?: string | null;
  bankName?: string | null;
  vpa?: string | null;
  refundAmount?: number | null;
  refundSource?: string | null;
  source?: string | null;
  status?: ManualRefundStatus | string | null;
  utr?: string | null;
  remark?: string | null;
  priority?: string | null;
  /** Payout destination: `customer` or `partner`. Not `initiatedBy.user_type`. */
  refundDestination?: 'customer' | 'partner' | string | null;
  initiatedBy?: InitiatedByDetails | null;
  createdOn?: string | null;
  updatedOn?: string | null;
};

export type ManualRefundPagination = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type ManualRefundListData = {
  refunds: ManualRefundData[];
  pagination: ManualRefundPagination;
};

export type ManualRefundListFilters = {
  lob?: string;
  partner?: string;
  productIds?: string[];
  status?: string | null;
  priority?: string | null;
  policyNumber?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
};

export type ManualRefundListResponse = ApiResponse<
  ManualRefundListData,
  ManualRefundListFilters
> & {
  success?: boolean;
  message?: string;
};

export type UpdateManualRefundStatusPayload = {
  utr: string;
  remark: string;
  priority: string;
};

export type UpdateManualRefundStatusResponse = {
  success?: boolean;
  message?: string;
};
