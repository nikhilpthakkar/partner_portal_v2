export type DocumentsData = {
  uploadedDocuments: UploadedDocument[];
  requestedDocuments: RequestedDocument[];
  machineInstanceId: string;
  taskId: string;
};

export type UploadedDocument = {
  documentId: string;
  pageId: string;
  type: string;
  name: string;
  state: string;
  // taskId: string;
  viewUrl: string;
  uploadedAt: Date | string;
  uploadedBy: UploadedBy;
  note: string;
  filename: string;
};

export type UploadedBy = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type RequestedDocument = {
  documentId?: string;
  pageId?: string;
  filename?: string;
  type: string;
  state: string;
  taskId?: string;
  viewUrl?: string;
  isResubmission: boolean;
  note: string;
  comment: string;
  uploadedAt?: Date | string;
};

export type DocumentsFilters = {};

export type UploadDocumentsData = {
  pageId: string;
  type: string;
  state: string;
  viewUrl: string;
  uploadedAt: Date | string;
  userId: string;
};
