export type BulkActionStatusCounts = {
  processing: number;
  successful: number;
  partial_successful: number;
  failed: number;
};

export type BulkActionStatusSummaryData = {
  counts: BulkActionStatusCounts;
  total: number;
};

export type BulkActionStatusSummaryFilters = {
  productIds: string[];
  from: string;
  to: string;
  partnerId: string;
  lob: string;
  plan?: string[];
  uploadedBy?: string[];
};
