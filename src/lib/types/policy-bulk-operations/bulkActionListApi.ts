import type { Pagination } from '@/lib/types/Global';

export type BulkActionApiStatus = 'processing' | 'completed' | 'partial_successful' | 'failed';

export type BulkActionResultFiles = {
  inputFile: string;
  successFile: string;
  errorFile: string;
};

export type BulkActionListItem = {
  fileName: string;
  totalRecords: number;
  action: string;
  status: BulkActionApiStatus;
  uploadedOn: string;
  uploadedBy?: string;
  resultFiles: BulkActionResultFiles;
  uploadedByDetails?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    user_id?: string;
  };
};

export type BulkActionListMetaFilters = {
  bulkActionType: string;
  partnerId: string;
  lob: string;
  products: string[];
};

export type BulkActionListBody = {
  data: BulkActionListItem[];
  pagination: Pagination;
  meta: {
    timestamp: string;
    traceId: string;
    filters: BulkActionListMetaFilters;
  };
};

/** Full HTTP payload (may include top-level success/message from backend). */
export type BulkActionListApiResponse = BulkActionListBody & {
  success?: boolean;
  message?: string;
};
