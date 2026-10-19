import type {
  ClaimDocumentRow,
  ClaimDocumentStatus,
  UploadAdditionalDocumentsData,
  UploadDocumentsRow,
  ViewDocumentItem,
  ViewDocumentsData,
} from '@/lib/types/claims-management/claimDetails';
import {
  UPLOAD_DOCUMENTS_DIALOG_BUTTONS,
  UPLOAD_DOCUMENTS_DIALOG_CLAIM_SUMMARY,
  UPLOAD_DOCUMENTS_DIALOG_DEFAULT_OPTIONS,
  UPLOAD_DOCUMENTS_DIALOG_GROUPS,
  UPLOAD_DOCUMENTS_DIALOG_LABELS,
  UPLOAD_DOCUMENTS_DIALOG_PLACEHOLDERS,
  UPLOAD_DOCUMENTS_DIALOG_TITLE,
} from '@/lib/constants/claimsDetail.constants';
import {
  DocumentsData,
  RequestedDocument,
  UploadedDocument,
} from '@/lib/types/claims-management/uploadedDocumentApi';
import { formatDate, formatEnum } from '@/lib/utils';

const mapStatus = (state: string): ClaimDocumentStatus => {
  switch (state) {
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'Under evaluation';
  }
};

export type UploadDocumentsDialogGroup = {
  id: string;
  title: string;
  rows: UploadDocumentsRow[];
};

export type UploadRequiredBannerData = {
  title: string;
  description: string;
  actionLabel: string;
};

export const resolveUploadDocumentsDialogData = (
  data?: Partial<UploadAdditionalDocumentsData>,
): UploadAdditionalDocumentsData => ({
  title: data?.title || UPLOAD_DOCUMENTS_DIALOG_TITLE,
  claimSummary: data?.claimSummary || UPLOAD_DOCUMENTS_DIALOG_CLAIM_SUMMARY,
  labels: {
    documentRequested:
      data?.labels?.documentRequested || UPLOAD_DOCUMENTS_DIALOG_LABELS.documentRequested,
    uploadedDocument:
      data?.labels?.uploadedDocument || UPLOAD_DOCUMENTS_DIALOG_LABELS.uploadedDocument,
  },
  placeholders: {
    documentRequested:
      data?.placeholders?.documentRequested ||
      UPLOAD_DOCUMENTS_DIALOG_PLACEHOLDERS.documentRequested,
    uploadedDocument:
      data?.placeholders?.uploadedDocument || UPLOAD_DOCUMENTS_DIALOG_PLACEHOLDERS.uploadedDocument,
    note: data?.placeholders?.note || UPLOAD_DOCUMENTS_DIALOG_PLACEHOLDERS.note,
  },
  buttons: {
    upload: data?.buttons?.upload || UPLOAD_DOCUMENTS_DIALOG_BUTTONS.upload,
    addDocument: data?.buttons?.addDocument || UPLOAD_DOCUMENTS_DIALOG_BUTTONS.addDocument,
    cancel: data?.buttons?.cancel || UPLOAD_DOCUMENTS_DIALOG_BUTTONS.cancel,
    submit: data?.buttons?.submit || UPLOAD_DOCUMENTS_DIALOG_BUTTONS.submit,
  },
  options: {
    documentRequested:
      data?.options?.documentRequested || UPLOAD_DOCUMENTS_DIALOG_DEFAULT_OPTIONS.documentRequested,
  },
});

const mapRequestedDocumentOptions = (requestedDocuments: RequestedDocument[]) =>
  Array.from(new Set(requestedDocuments.map((document) => document.type)))
    .filter(Boolean)
    .map((type) => ({ value: type, label: formatEnum(type) }));

export const mapUploadDialogDataFromApiData = (params: {
  apiData?: DocumentsData;
  claimSummary: string;
}): Partial<UploadAdditionalDocumentsData> => {
  const requestedDocuments = params.apiData?.requestedDocuments ?? [];

  return {
    claimSummary: params.claimSummary,
    options: {
      documentRequested: mapRequestedDocumentOptions(requestedDocuments),
    },
  };
};

export const mapUploadRequiredBannerFromApiData = (
  apiData?: DocumentsData,
): UploadRequiredBannerData | null => {
  const requestedDocuments = apiData?.requestedDocuments ?? [];
  if (requestedDocuments.length === 0) return null;

  const uniqueDocumentsMap = new Map<string, RequestedDocument>();
  requestedDocuments.forEach((document) => {
    const key = document.documentId || document.type;
    if (!uniqueDocumentsMap.has(key)) {
      uniqueDocumentsMap.set(key, document);
    }
  });

  const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

  const rejectedDocuments = uniqueDocuments.filter(
    (document) => document.state.toUpperCase() === 'REJECTED' || document.isResubmission,
  );
  const additionalDocuments = uniqueDocuments.filter(
    (document) => document.state.toUpperCase() !== 'APPROVED' && !document.isResubmission,
  );

  if (rejectedDocuments.length === 0 && additionalDocuments.length === 0) return null;

  const rejectedNames = rejectedDocuments
    .map((document) => formatEnum(document.type))
    .filter(Boolean)
    .join(', ');

  let description = '';
  if (additionalDocuments.length > 0) {
    description = `Our team requires ${additionalDocuments.length} additional ${
      additionalDocuments.length === 1 ? 'document' : 'documents'
    } to proceed.`;
  }

  if (rejectedNames) {
    const rejectionText = `The ${rejectedNames} that was previously submitted was rejected and requires a re-upload.`;
    description = description ? `${description} Additionally, ${rejectionText}` : rejectionText;
  }

  return {
    title: 'Action Required: Update your claim documents',
    description,
    actionLabel: 'Upload documents',
  };
};

export const isUploadDocumentRowCompleted = (row: UploadDocumentsRow): boolean =>
  Boolean(row.isUploaded || (row.documentId && row.uploadedAt && row.viewUrl));

export const mapUploadDocumentsRowsToGroups = (
  rows: UploadDocumentsRow[],
): UploadDocumentsDialogGroup[] => {
  const additionalRows = rows.filter((row) => row.isAdditional);
  const requestedRows = rows.filter((row) => !row.isAdditional);

  const additionalUniqueCount = new Set(additionalRows.map((row) => row.type)).size;
  const requestedUniqueCount = new Set(requestedRows.map((row) => row.type)).size;

  return [
    {
      id: UPLOAD_DOCUMENTS_DIALOG_GROUPS.additional.id,
      title: `${additionalUniqueCount} ${UPLOAD_DOCUMENTS_DIALOG_GROUPS.additional.label}`,
      rows: additionalRows,
    },
    {
      id: UPLOAD_DOCUMENTS_DIALOG_GROUPS.reupload.id,
      title: `${requestedUniqueCount} ${UPLOAD_DOCUMENTS_DIALOG_GROUPS.reupload.label}`,
      rows: requestedRows,
    },
  ].filter((group) => group.rows.length > 0);
};

export const mapUploadRowsFromApiData = (apiData?: DocumentsData): UploadDocumentsRow[] => {
  if (!apiData) return [];
  const requestedDocuments = apiData.requestedDocuments;

  return requestedDocuments
    .filter((requestedDocument) => Boolean(requestedDocument.type))
    .map((requestedDocument, index) => {
      const resolvedRowId = requestedDocument.documentId
        ? `${requestedDocument.documentId}-${index + 1}`
        : `upload-doc-${index + 1}`;
      return {
        id: resolvedRowId,
        groupId: resolvedRowId,
        filename: requestedDocument.filename,
        isAdditional: !requestedDocument.isResubmission,
        taskId: apiData.taskId,
        requestTaskId: requestedDocument.taskId,
        machineInstanceId: apiData.machineInstanceId,
        documentId: requestedDocument.documentId,
        pageId: requestedDocument.pageId,
        type: requestedDocument.type,
        state: requestedDocument.state,
        viewUrl: requestedDocument.viewUrl,
        uploadedAt: requestedDocument.uploadedAt,
        comment: requestedDocument.comment,
        note: '',
        isUploaded: false,
      };
    });
};

export const mapUploadedDocumentsToTable = (
  apiData?: DocumentsData,
): ClaimDocumentRow[] | undefined => {
  if (!apiData?.uploadedDocuments?.length) return [];

  return apiData.uploadedDocuments.map((document, index) => {
    const resolvedRowId = `${document.documentId}-${document.pageId || index + 1}`;
    return {
      id: resolvedRowId,
      label: formatEnum(document.type),
      uploadedBy: document.uploadedBy?.name ?? '-',
      date: formatDate(document.uploadedAt ?? '-'),
      note: document.note ?? '-',
      status: mapStatus(document.state),
      actions: [{ type: 'view' }, { type: 'download' }],
      document: mapDocumentToViewItem([document]),
    };
  });
};

export const mapDocumentToViewItem = (documents: UploadedDocument[] = []): ViewDocumentItem => {
  if (!documents.length) return { data: [] };

  const data: ViewDocumentsData[] = documents
    .filter((document) => Boolean(document.viewUrl))
    .map((document, index) => ({
      id: document.pageId,
      label: `${formatEnum(document.type)} ${index + 1}`,
      previewUrl: document.viewUrl,
      uploadedAt: document.uploadedAt as string,
      note: document.note ?? '',
    }));

  return {
    data,
  };
};
