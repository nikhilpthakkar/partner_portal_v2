import ErrorCard from '@/components/molecules/ErrorCard';
import UploadRequiredBanner from '@/components/molecules/UploadRequiredBanner';
import ClaimDetailsTable from '@/components/organisms/ClaimDetailsTable';
import Skeleton from '@/components/ui/skeleton';
import type {
  ClaimDocumentActionType,
  ClaimDocumentRow,
  ViewDocumentItem,
  ViewDocumentsData,
} from '@/lib/types/claims-management/claimDetails';
import { useSearchParams } from 'next/navigation';
import { useFetchUploadedDocumentsQuery } from '@/lib/query/claimsDetail.queries';
import { useEffect, useMemo } from 'react';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackUploadedDocumentsDownload,
  trackUploadedDocumentsDownloadException,
  trackUploadedDocumentsTabFetchException,
  trackUploadedDocumentsViewList,
} from '@/lib/segment/track/claims';
import {
  mapDocumentToViewItem,
  mapUploadRequiredBannerFromApiData,
} from '@/lib/adapter/claims-detail/claimsDocuments.adapter';
import type { UploadedDocument } from '@/lib/types/claims-management/uploadedDocumentApi';
import { downloadMultipleFiles, formatDate, formatEnum } from '@/lib/utils';
import { toast } from 'sonner';

type UploadedDocumentsTabProps = {
  onOpenViewDialog: (selected: ViewDocumentsData, documents: ViewDocumentItem) => void;
  onUploadDocumentsClick: () => void;
};

export default function UploadedDocumentsTab({
  onOpenViewDialog,
  onUploadDocumentsClick,
}: UploadedDocumentsTabProps) {
  const searchParams = useSearchParams();
  const segmentBase = useSegmentPartnerBase();
  const claimNumber = searchParams.get('claimNumber')?.trim() || '';

  const { data, isLoading, isError, error } = useFetchUploadedDocumentsQuery({
    claimNumber,
    enabled: Boolean(claimNumber),
  });

  useEffect(() => {
    if (!isError) return;
    trackUploadedDocumentsTabFetchException(segmentBase, claimNumber);
  }, [claimNumber, isError, segmentBase]);

  const documentsTable = useMemo<ClaimDocumentRow[]>(() => {
    const uploadedDocuments = data?.data?.uploadedDocuments ?? [];
    if (uploadedDocuments.length === 0) {
      return [];
    }

    const uploadedDocumentsByDocumentId = uploadedDocuments.reduce<
      Record<string, UploadedDocument[]>
    >((groupedDocuments, document, index) => {
      const groupKey = document.documentId || `uploaded-document-${index + 1}`;
      if (!groupedDocuments[groupKey]) {
        groupedDocuments[groupKey] = [];
      }
      groupedDocuments[groupKey].push(document);
      return groupedDocuments;
    }, {});

    const mapStatusFromDocuments = (documents: UploadedDocument[]): ClaimDocumentRow['status'] => {
      const normalizedStates = documents.map((document) => document.state.toUpperCase());
      if (normalizedStates.every((state) => state === 'APPROVED')) {
        return 'Approved';
      }
      if (normalizedStates.some((state) => state === 'REJECTED')) {
        return 'Rejected';
      }
      return 'Under evaluation';
    };

    return Object.entries(uploadedDocumentsByDocumentId).map(([documentId, documents]) => {
      const firstDocument = documents[0];
      const latestUploadedDocument = [...documents].sort(
        (left, right) =>
          new Date(right.uploadedAt ?? 0).getTime() - new Date(left.uploadedAt ?? 0).getTime(),
      )[0];
      const uniqueNotes = Array.from(
        new Set(
          documents
            .map((document) => document.note?.trim())
            .filter((note): note is string => Boolean(note)),
        ),
      );

      return {
        id: documentId,
        label: formatEnum(firstDocument?.type),
        uploadedBy: firstDocument?.uploadedBy?.name ?? '-',
        date: formatDate(latestUploadedDocument?.uploadedAt ?? '-'),
        note: uniqueNotes.join(', ') || '-',
        status: mapStatusFromDocuments(documents),
        actions: [{ type: 'view' }, { type: 'download' }],
        document: mapDocumentToViewItem(documents),
      };
    });
  }, [data?.data?.uploadedDocuments]);
  const uploadRequiredBanner = useMemo(
    () => mapUploadRequiredBannerFromApiData(data?.data),
    [data],
  );

  const handleDocumentAction = (action: ClaimDocumentActionType, row: ClaimDocumentRow) => {
    const selectedDocument = documentsTable?.find((doc) => doc.id === row.id);
    if (!selectedDocument) return;

    if (action === 'view') {
      trackUploadedDocumentsViewList(segmentBase, {
        entity_name: row.id,
        claim_number: claimNumber,
      });
      onOpenViewDialog(selectedDocument.document.data[0], selectedDocument.document);
    }

    if (action === 'download') {
      const downloadableDocuments = selectedDocument.document.data;
      if (downloadableDocuments.length === 0) {
        toast.error('No documents available to download');
        return;
      }

      trackUploadedDocumentsDownload(segmentBase, {
        entity_name: row.id,
        claim_number: claimNumber,
      });

      try {
        downloadMultipleFiles(downloadableDocuments);
        toast.success('Document download started');
      } catch {
        toast.error('Failed to download document');
        trackUploadedDocumentsDownloadException(segmentBase, claimNumber);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-policy-info-card border border-policy-info-border bg-policy-info-bg p-6">
        <Skeleton className="mb-4 h-6 w-56" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorCard
        title="Unable to load uploaded documents"
        description={error?.response?.data?.message ?? 'Please try again.'}
      />
    );
  }

  if (!documentsTable) {
    return (
      <ErrorCard
        title="No uploaded documents found"
        description="There are no uploaded documents for this claim yet."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {uploadRequiredBanner && (
        <UploadRequiredBanner
          title={uploadRequiredBanner.title}
          description={uploadRequiredBanner.description}
          actionLabel={uploadRequiredBanner.actionLabel}
          onActionClick={onUploadDocumentsClick}
        />
      )}
      <ClaimDetailsTable
        variant="documents"
        data={documentsTable}
        onDocumentAction={handleDocumentAction}
      />
    </div>
  );
}
