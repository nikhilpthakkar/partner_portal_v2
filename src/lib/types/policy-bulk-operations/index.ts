export type {
  BulkActionStatusCounts,
  BulkActionStatusSummaryData,
  BulkActionStatusSummaryFilters,
} from './bulkActionStatusSummaryApi';
export type {
  BulkActionApiStatus,
  BulkActionListApiResponse,
  BulkActionListBody,
  BulkActionListItem,
  BulkActionListMetaFilters,
  BulkActionResultFiles,
} from './bulkActionListApi';
export type {
  BulkActionUploadedByResponse,
  BulkActionUploadedByUser,
} from './bulkActionUploadedByApi';

export type BulkOperationStatus = 'processing' | 'successful' | 'partially_successful' | 'failed';

export type BulkOperationAction = 'Issuance' | 'Cancellation' | 'Endorsement';

export type BulkOperationRow = {
  id: string;
  fileName: string;
  planName: string;
  totalRecords: number;
  action: BulkOperationAction;
  status: BulkOperationStatus;
  uploadedOn: string;
  uploadedBy: string;
  uploadedOnDate: Date;
  successFileUrl?: string;
  errorFileUrl?: string;
  inputFileUrl?: string;
};
