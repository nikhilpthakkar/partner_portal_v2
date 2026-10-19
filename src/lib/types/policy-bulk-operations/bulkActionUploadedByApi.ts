export type BulkActionUploadedByUser = {
  first_name?: string;
  last_name?: string;
  user_id?: string;
  email?: string;
};

export type BulkActionUploadedByResponse = {
  data: BulkActionUploadedByUser[];
};
