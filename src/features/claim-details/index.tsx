'use client';

import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Breadcrumbs from '@/components/molecules/Breadcrumbs';
import { PAGE_LAYOUT_CLASS, PAGE_TITLE_CLASS } from '@/components/molecules/PageHeading';
import SegmentedTabs from '@/components/molecules/SegmentedTabs';
import ShareDetailsDialog from '@/components/organisms/ShareDetailsDialog';
import StatusTimeline from '@/components/organisms/StatusTimeline';
import UploadDocumentsDialog from '@/components/organisms/UploadDocumentsDialog';
import ViewDocumentsDialog from '@/components/organisms/ViewDocumentsDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Skeleton from '@/components/ui/skeleton';
import type {
  UploadAdditionalDocumentsData,
  UploadDocumentsRow,
  ViewDocumentItem,
  ViewDocumentsData,
} from '@/lib/types/claims-management/claimDetails';
import {
  UPLOADED_DOCUMENTS_QUERY_KEY,
  useClaimStatusTimelineQuery,
  useCachedClaimDetailsQuery,
  useDeleteUploadedDocumentMutation,
  useFetchUploadedDocumentsQuery,
  useSubmitUploadedDocumentsMutation,
  useUploadClaimDocumentsMutation,
} from '@/lib/query/claimsDetail.queries';
import { useClaimsDetailStore } from '@/lib/store/claimsDetail.store';
import { usePartnerStore } from '@/lib/store/partner.store';
import { useClaimShareDialog } from '@/lib/hooks/useClaimShareDialog';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { cn, formatEnum, sanitizeFileName } from '@/lib/utils';
import { DOCUMENT_UPLOAD_ACCEPT, isDocumentUploadAllowed } from '@/lib/utils/documentUpload';
import { mapClaimToViewModel } from '@/lib/adapter/claims-detail/claimsDetails.adapter';
import { OTHERS_RECIPIENT_ID } from '@/lib/adapter/policy-share/policyShare.adapter';
import {
  mapUploadDialogDataFromApiData,
  mapUploadRowsFromApiData,
} from '@/lib/adapter/claims-detail/claimsDocuments.adapter';
import { mapClaimTrackingToTimelineData } from '@/lib/adapter/claims-detail/statusTimeline.adapter';
import { CLAIM_DETAILS_TABS, DEFAULT_TAB } from '@/lib/constants/claimsDetail.constants';
import { SHARE_CLAIM_STATUS_CONFIG } from '@/lib/constants/policyShare.constants';
import ClaimsOverviewTab from '@/features/claim-details/tabs/ClaimsOverviewTab';
import ClaimantInformationTab from '@/features/claim-details/tabs/ClaimantInformationTab';
import UploadedDocumentsTab from '@/features/claim-details/tabs/UploadedDocumentsTab';
import CommunicationLogTab from '@/features/claim-details/tabs/CommunicationLogTab';
import { statusStyles } from '@/lib/adapter/overview/claimsTable.adapter';
import { Share2 } from 'lucide-react';
import {
  trackClaimDetailsOpenUploadDialog,
  trackClaimDetailsPageException,
  trackClaimDetailsPageView,
  trackClaimDetailsShareClick,
  trackClaimDetailsSwitchTab,
  trackClaimDetailsUploadDialogView,
  trackClaimDetailsViewDocumentsDialogView,
  trackClaimDocumentDeleted,
  trackClaimDocumentsSubmitSuccess,
  trackClaimDocumentUploaded,
  trackClaimStatusShareDialogView,
  trackClaimStatusShareSubmit,
  trackClaimUploadAddAdditionalDocument,
  trackClaimUploadBrowse,
  trackClaimUploadException,
  trackClaimViewerSelectDocument,
  trackClaimViewUploadedRow,
} from '@/lib/segment/track/claims';

export default function ClaimDetails() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasInitializedUploadRowsRef = useRef(false);
  const searchParams = useSearchParams();
  const segmentBase = useSegmentPartnerBase();
  const claimNumber = searchParams.get('claimNumber')?.trim() || '';
  const [activeUploadRowId, setActiveUploadRowId] = useState('');
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const { setClaimNumber, policyNumber } = useClaimsDetailStore();
  const {
    data: claimsDetailResponse,
    isLoading,
    isError: isClaimDetailsFetchError,
  } = useCachedClaimDetailsQuery();
  const { mutateAsync: uploadClaimDocumentsMutate, isPending: isUploadingDocument } =
    useUploadClaimDocumentsMutation();
  const { mutateAsync: submitUploadedDocumentsMutate, isPending: isSubmittingDocuments } =
    useSubmitUploadedDocumentsMutation();
  const { mutateAsync: deleteUploadedDocumentMutate } = useDeleteUploadedDocumentMutation();
  const { data: uploadedDocumentsResponse, refetch: refetchUploadedDocuments } =
    useFetchUploadedDocumentsQuery({
      claimNumber,
      enabled: Boolean(claimNumber),
    });

  useEffect(() => {
    setClaimNumber(claimNumber);
    return () => {
      setClaimNumber('');
    };
  }, [claimNumber, setClaimNumber]);

  const selectedClaim = useMemo(() => {
    const claims = claimsDetailResponse?.data?.claims ?? [];
    if (claims.length === 0) return undefined;
    if (!claimNumber) return claims[0];
    return claims.find((claim) => claim.claimRequestNumber === claimNumber) ?? claims[0];
  }, [claimsDetailResponse, claimNumber]);
  const resolvedClaimNumber = claimNumber || selectedClaim?.claimRequestNumber || '';
  const { data: claimStatusTimelineResponse, isError: isClaimTimelineError } =
    useClaimStatusTimelineQuery({
      claimNumber: resolvedClaimNumber,
      enabled: Boolean(resolvedClaimNumber),
    });

  const exceptionType = useMemo(() => {
    if (isClaimDetailsFetchError) return 'cached_claim_details';
    if (isClaimTimelineError) return 'claim_status_timeline';
    return undefined;
  }, [isClaimDetailsFetchError, isClaimTimelineError]);

  useEffect(() => {
    trackClaimDetailsPageView(segmentBase, resolvedClaimNumber);
  }, [segmentBase, resolvedClaimNumber]);

  useEffect(() => {
    if (!isClaimDetailsFetchError && !isClaimTimelineError) return;
    trackClaimDetailsPageException(segmentBase, {
      claimNumber: resolvedClaimNumber,
      exception_type: exceptionType,
      exceptionMessage: exceptionType
        ? `Unable to load ${exceptionType} data`
        : 'Unable to load claim details',
    });
  }, [
    exceptionType,
    isClaimDetailsFetchError,
    isClaimTimelineError,
    segmentBase,
    resolvedClaimNumber,
  ]);

  const data = useMemo(() => {
    if (!selectedClaim) return undefined;
    return mapClaimToViewModel(selectedClaim);
  }, [selectedClaim]);
  const claimSummaryBanner = useMemo(() => {
    const claimantName = selectedClaim?.claimUsers?.claimants?.[0]?.name ?? '-';
    const referenceNumber = selectedClaim?.claimRequestNumber || claimNumber || '-';
    return `Claim ID ${referenceNumber} | ${claimantName}`;
  }, [claimNumber, selectedClaim]);

  const [activeTab, setActiveTab] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const {
    shareDialogOpen,
    isRecipientsLoading,
    recipients,
    effectiveSelectedId,
    channels,
    dependentChannelsByMember,
    activeDependentMemberId,
    othersChannelErrors,
    setShareChannels,
    onOpenChange: handleShareDialogOpen,
    openDialogForClaim,
    onSelectRecipient: handleSelectRecipient,
    onDependentChannelsChange: handleDependentChannelsChange,
    onDependentActiveMemberChange: handleDependentActiveMemberChange,
    onChannelValueChange: handleChannelValueChange,
    canShare,
    submitShare: handleShareSubmit,
  } = useClaimShareDialog();
  const [uploadDocumentRows, setUploadDocumentRows] = useState<UploadDocumentsRow[]>([]);
  const [uploadProgressByRow, setUploadProgressByRow] = useState<Record<string, number>>({});
  const [viewDocumentItem, setViewDocumentItem] = useState<ViewDocumentItem>();
  const [selectedViewDocument, setSelectedViewDocument] = useState<ViewDocumentsData | null>(null);

  useEffect(() => {
    if (!selectedViewDocument) return;
    const updated = viewDocumentItem?.data.find((doc) => doc.id === selectedViewDocument.id);
    if (updated) setSelectedViewDocument(updated);
  }, [viewDocumentItem, selectedViewDocument]);

  const prevUploadDialogOpenRef = useRef(false);
  const prevViewDialogOpenRef = useRef(false);

  useEffect(() => {
    if (uploadDialogOpen && !prevUploadDialogOpenRef.current) {
      trackClaimDetailsUploadDialogView(segmentBase, resolvedClaimNumber);
    }
    prevUploadDialogOpenRef.current = uploadDialogOpen;
  }, [uploadDialogOpen, segmentBase, resolvedClaimNumber]);

  useEffect(() => {
    if (viewDialogOpen && !prevViewDialogOpenRef.current) {
      trackClaimDetailsViewDocumentsDialogView(segmentBase, resolvedClaimNumber);
    }
    prevViewDialogOpenRef.current = viewDialogOpen;
  }, [viewDialogOpen, segmentBase, resolvedClaimNumber]);

  const uploadDialogData = useMemo<Partial<UploadAdditionalDocumentsData>>(() => {
    const claimantName = selectedClaim?.claimUsers?.claimants?.[0]?.name ?? '-';
    const referenceNumber = selectedClaim?.claimRequestNumber || claimNumber || '-';
    return mapUploadDialogDataFromApiData({
      apiData: uploadedDocumentsResponse?.data,
      claimSummary: `Claim ID ${referenceNumber} | ${claimantName}`,
    });
  }, [claimNumber, selectedClaim, uploadedDocumentsResponse]);

  const uploadRowsFromApi = useMemo<UploadDocumentsRow[]>(
    () => mapUploadRowsFromApiData(uploadedDocumentsResponse?.data),
    [uploadedDocumentsResponse],
  );

  useEffect(() => {
    if (!uploadDialogOpen) {
      hasInitializedUploadRowsRef.current = false;
      setUploadDocumentRows([]);
      setUploadProgressByRow({});
      return;
    }

    if (uploadRowsFromApi.length === 0) return;

    if (!hasInitializedUploadRowsRef.current) {
      setUploadDocumentRows(uploadRowsFromApi);
      hasInitializedUploadRowsRef.current = true;
      return;
    }

    setUploadDocumentRows((currentRows) => {
      const mergedRows = uploadRowsFromApi.map((apiRow) => {
        const existingRow = currentRows.find(
          (row) => row.documentId === apiRow.documentId || row.id === apiRow.id,
        );
        return existingRow
          ? {
              ...apiRow,
              note: existingRow.note,
            }
          : apiRow;
      });

      const additionalRows = currentRows.filter((row) => {
        if (!row.id.includes('-additional-')) return false;
        const isDuplicate = mergedRows.some(
          (mergedRow) =>
            (row.pageId && mergedRow.pageId === row.pageId) ||
            (row.documentId &&
              mergedRow.documentId === row.documentId &&
              row.pageId === mergedRow.pageId),
        );
        return !isDuplicate;
      });
      return [...mergedRows, ...additionalRows];
    });
  }, [uploadDialogOpen, uploadRowsFromApi]);

  const resolvedTab = activeTab || DEFAULT_TAB || '';
  const timelineData = useMemo(
    () => mapClaimTrackingToTimelineData(claimStatusTimelineResponse?.data),
    [claimStatusTimelineResponse?.data],
  );
  const headerTitle = data?.header.title ?? (claimNumber ? `Claim: ${claimNumber}` : 'Claim');
  const headerStatus = data?.header.statusLabel;
  const headerActionLabel = data?.header.actionLabel ?? 'Share update';

  const handleShareClick = () => {
    if (!claimNumber || !selectedClaim) {
      toast.error('Claim is not available');
      return;
    }

    const policyEkey = selectedClaim?.policyEkey?.trim();

    trackClaimDetailsShareClick(segmentBase, claimNumber);
    openDialogForClaim(claimNumber, policyEkey, policyNumber);
  };

  const handleNotesChange = useCallback(
    (rowId: string, value: string) => {
      setUploadDocumentRows((rows) => {
        const sourceRow = rows.find((row) => row.id === rowId);
        if (!sourceRow) return rows;

        const targetDocumentId = sourceRow.documentId;
        const targetGroupId = sourceRow.groupId || sourceRow.id;

        return rows.map((row) => {
          const shouldUpdate =
            row.id === rowId ||
            (targetDocumentId && row.documentId === targetDocumentId) ||
            (!targetDocumentId && (row.groupId === targetGroupId || row.id === targetGroupId));

          return shouldUpdate ? { ...row, note: value } : row;
        });
      });
    },
    [setUploadDocumentRows],
  );

  const handleDocumentRequestedChange = useCallback(
    (rowId: string, value: string) => {
      setUploadDocumentRows((rows) =>
        rows.map((row) => (row.id === rowId ? { ...row, documentRequestedValue: value } : row)),
      );
    },
    [setUploadDocumentRows],
  );

  const handleAddUploadDocument = (rowId: string, isAdditional: boolean) => {
    const sourceRowPreview = uploadDocumentRows.find((row) => row.id === rowId);
    trackClaimUploadAddAdditionalDocument(segmentBase, {
      entity_name: sourceRowPreview?.type ?? rowId,
      claim_number: claimNumber,
    });

    setUploadDocumentRows((rows) => {
      const sourceIndex = rows.findIndex((row) => row.id === rowId);
      if (sourceIndex < 0) return rows;

      const sourceRow = rows[sourceIndex];
      const resolvedGroupId = sourceRow.groupId || sourceRow.id;
      const additionalRow: UploadDocumentsRow = {
        id: `${resolvedGroupId}-additional-${Date.now()}`,
        groupId: resolvedGroupId,
        documentId: sourceRow.documentId,
        isAdditional,
        taskId: sourceRow.taskId,
        machineInstanceId: sourceRow.machineInstanceId,
        type: sourceRow.type,
        state: sourceRow.state,
        comment: '',
        note: '',
        isUploaded: false,
      };

      const lastIndexInGroup = rows.reduce((lastIdx, row, idx) => {
        const rowGroupId = row.groupId || row.id;
        const rowDocumentId = row.documentId;
        if (
          rowGroupId === resolvedGroupId ||
          (rowDocumentId && rowDocumentId === sourceRow.documentId)
        ) {
          return idx;
        }
        return lastIdx;
      }, sourceIndex);

      const updatedRows = [...rows];
      updatedRows.splice(lastIndexInGroup + 1, 0, additionalRow);
      return updatedRows;
    });
  };

  const handleUploadClick = (rowId: string) => {
    if (isUploadingDocument || !claimNumber || activeUploadRowId) return;
    if (!fileInputRef.current) return;

    const rowForUpload = uploadDocumentRows.find((row) => row.id === rowId);
    trackClaimUploadBrowse(segmentBase, {
      entity_name: rowForUpload?.type ?? rowId,
      claim_number: claimNumber,
    });

    fileInputRef.current.value = '';
    setActiveUploadRowId(rowId);

    const handleFocus = () => {
      setTimeout(() => {
        if (!fileInputRef.current?.files?.length) {
          setActiveUploadRowId('');
        }
        window.removeEventListener('focus', handleFocus);
      }, 300);
    };

    window.addEventListener('focus', handleFocus);

    fileInputRef.current.click();
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      event.target.value = '';
      setActiveUploadRowId('');
      return;
    }

    if (!(await isDocumentUploadAllowed(selectedFile, event.target))) {
      setActiveUploadRowId('');
      return;
    }

    const sanitizedName = sanitizeFileName(selectedFile.name);

    const sanitizedFile = new File([selectedFile], sanitizedName, {
      type: selectedFile.type,
    });

    const rowId = activeUploadRowId;

    if (!sanitizedFile || !rowId || !claimNumber) {
      event.target.value = '';
      setActiveUploadRowId('');
      return;
    }

    const selectedRow = uploadDocumentRows.find((row) => row.id === rowId);
    if (!selectedRow?.machineInstanceId || !selectedRow.taskId || !selectedRow.type) {
      event.target.value = '';
      setActiveUploadRowId('');
      return;
    }

    setUploadProgressByRow((prev) => ({ ...prev, [rowId]: 0 }));

    try {
      const uploadedDocument = await uploadClaimDocumentsMutate({
        claimNumber,
        documentType: selectedRow.type,
        machineInstanceId: selectedRow.machineInstanceId,
        taskId: selectedRow.taskId,
        file: sanitizedFile,
        onUploadProgress: (progress) => {
          setUploadProgressByRow((prev) => ({ ...prev, [rowId]: progress }));
        },
      });

      setUploadDocumentRows((rows) =>
        rows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                filename: sanitizedName,
                pageId: uploadedDocument.pageId,
                type: uploadedDocument.type,
                state: uploadedDocument.state,
                viewUrl: uploadedDocument.viewUrl,
                uploadedAt: uploadedDocument.uploadedAt,
                isUploaded: true,
              }
            : row,
        ),
      );

      await refetchUploadedDocuments();

      trackClaimDocumentUploaded(segmentBase, {
        entity_name: sanitizedName,
        claim_number: claimNumber,
      });
    } catch (error) {
      console.error('Error uploading document', error);
      toast.error('Failed to upload document');
      trackClaimUploadException(segmentBase, {
        claim_number: claimNumber,
        exception_type: 'upload_claim_document',
        exception_message: 'Failed to upload document',
      });
    } finally {
      setUploadProgressByRow((prev) => {
        const updated = { ...prev };
        delete updated[rowId];
        return updated;
      });
      event.target.value = '';
      setActiveUploadRowId('');
    }
  };

  const handleSubmitUploadedDocuments = async () => {
    if (!claimNumber) {
      throw new Error('Claim number is missing');
    }
    try {
      const refreshedDocumentsResponse = await refetchUploadedDocuments();
      const latestRequestedDocuments =
        refreshedDocumentsResponse.data?.data?.requestedDocuments ?? [];

      if (latestRequestedDocuments.length === 0) {
        toast.error('No requested documents available to submit');
        setUploadDialogOpen(false);
        return;
      }

      const notesByPageId = uploadDocumentRows.reduce<Record<string, string>>((acc, row) => {
        const trimmedNotes = row.note.trim();
        if (!trimmedNotes) return acc;
        if (row.pageId) {
          acc[row.pageId] = trimmedNotes;
        }
        return acc;
      }, {});

      const payload = latestRequestedDocuments.map((document) => ({
        document_id: document?.documentId ?? '',
        page_id: document?.pageId ?? '',
        note_text: notesByPageId[document?.pageId ?? ''] ?? '',
      }));

      await submitUploadedDocumentsMutate({
        claimNumber,
        notes: payload,
      });

      await queryClient.invalidateQueries({
        queryKey: [...UPLOADED_DOCUMENTS_QUERY_KEY, partnerId, lob, productIds, claimNumber],
      });
      trackClaimDocumentsSubmitSuccess(segmentBase, claimNumber);
      toast.success('Documents submitted successfully');
      setUploadDialogOpen(false);
    } catch (error) {
      console.error('Error submitting uploaded documents', error);
      toast.error('Failed to submit documents');
      trackClaimUploadException(segmentBase, {
        claim_number: claimNumber,
        exception_type: 'submit_claim_documents',
        exception_message: 'Failed to submit documents',
      });
    }
  };

  const handleOpenViewDialog = (selected: ViewDocumentsData, documents: ViewDocumentItem) => {
    setSelectedViewDocument(selected);
    setViewDocumentItem(documents);
    setViewDialogOpen(true);
  };

  const handleViewUploadedDocument = (rowId: string) => {
    const selectedRow = uploadDocumentRows.find((row) => row.id === rowId);
    if (!selectedRow?.viewUrl) return;

    trackClaimViewUploadedRow(segmentBase, {
      entity_name: rowId,
      claim_number: claimNumber,
    });

    const selectedDocument: ViewDocumentsData = {
      id: selectedRow.pageId || selectedRow.id,
      label: selectedRow.filename || formatEnum(selectedRow.type),
      previewUrl: selectedRow.viewUrl,
      uploadedAt: selectedRow.uploadedAt || new Date().toISOString(),
      note: selectedRow.note,
    };

    setViewDocumentItem({
      data: [selectedDocument],
    });

    setSelectedViewDocument(selectedDocument);
    setViewDialogOpen(true);
  };

  const handleDeleteUploadedDocument = async (rowId: string) => {
    await refetchUploadedDocuments();
    const machineInstanceId = uploadedDocumentsResponse?.data?.machineInstanceId;
    const selectedRow = uploadDocumentRows.find((row) => row.id === rowId);
    if (!selectedRow) return;
    const taskId = selectedRow.requestTaskId || selectedRow.taskId;

    if (!claimNumber || !machineInstanceId || !selectedRow?.pageId || !taskId) {
      toast.error('Unable to delete document. Missing required information.');
      return;
    }

    try {
      await deleteUploadedDocumentMutate({
        claimNumber,
        machineInstanceId,
        taskId,
        pageId: selectedRow.pageId,
      });

      setUploadDocumentRows((rows) => {
        const sameDocumentRows = rows.filter((row) => {
          if (selectedRow.documentId && row.documentId) {
            return row.documentId === selectedRow.documentId;
          }
          if (selectedRow.groupId && row.groupId) {
            return row.groupId === selectedRow.groupId;
          }
          return row.id === selectedRow.id;
        });

        const isAdditionalRow = selectedRow.id.includes('-additional-');

        if (isAdditionalRow && sameDocumentRows.length > 1) {
          return rows.filter((row) => row.id !== rowId);
        }

        return rows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                filename: undefined,
                pageId: undefined,
                viewUrl: undefined,
                uploadedAt: undefined,
                isUploaded: false,
              }
            : row,
        );
      });

      await refetchUploadedDocuments();
      trackClaimDocumentDeleted(segmentBase, {
        entity_name: selectedRow.pageId ?? rowId,
        claim_number: claimNumber,
      });
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document', error);
      toast.error('Failed to delete document');
      trackClaimUploadException(segmentBase, {
        claim_number: claimNumber,
        exception_type: 'delete_claim_document',
        exception_message: 'Failed to delete document',
      });
    }
  };

  const handleSelectViewDocument = useCallback(
    (document: ViewDocumentsData) => {
      trackClaimViewerSelectDocument(segmentBase, {
        entity_name: document.id,
        claim_number: resolvedClaimNumber,
      });
      setSelectedViewDocument(document);
    },
    [segmentBase, resolvedClaimNumber],
  );

  const renderTabContent = () => {
    switch (resolvedTab) {
      case CLAIM_DETAILS_TABS[0].value:
        return <ClaimsOverviewTab />;
      case CLAIM_DETAILS_TABS[1].value:
        return <ClaimantInformationTab />;
      case CLAIM_DETAILS_TABS[2].value:
        return (
          <UploadedDocumentsTab
            onOpenViewDialog={handleOpenViewDialog}
            onUploadDocumentsClick={() => {
              trackClaimDetailsOpenUploadDialog(segmentBase, {
                entity_name: CLAIM_DETAILS_TABS[2].value,
                claim_number: claimNumber,
              });
              setUploadDialogOpen(true);
            }}
          />
        );
      case CLAIM_DETAILS_TABS[3].value:
        return <CommunicationLogTab policyEkey={selectedClaim?.policyEkey?.trim() || ''} />;
      default:
        return null;
    }
  };

  const renderHeaderSection = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {isLoading && !data ? (
            <>
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-6 w-20" />
            </>
          ) : (
            <>
              <h1 className={PAGE_TITLE_CLASS}>{headerTitle}</h1>
              {headerStatus && (
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-md border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground',
                    statusStyles[headerStatus],
                  )}
                >
                  {headerStatus}
                </Badge>
              )}
            </>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!claimNumber}
          className="bg-claims-details-action-button-bg h-8 rounded-md text-claims-details-action-button-text px-3 py-2 hover:bg-claims-details-action-button-hover-bg hover:text-claims-details-action-button-hover-text shadow-claims-details-action-button gap-2"
          onClick={handleShareClick}
        >
          <Share2 className="h-4 w-4" />
          {headerActionLabel}
        </Button>
      </div>
    </div>
  );

  const renderContentSection = () => (
    <>
      <div className="flex flex-col gap-4">
        <SegmentedTabs
          value={resolvedTab}
          onValueChange={(value) => {
            trackClaimDetailsSwitchTab(segmentBase, {
              entity_name: value,
              claim_number: resolvedClaimNumber,
            });
            setActiveTab(value);
          }}
          tabs={CLAIM_DETAILS_TABS}
          className="w-full py-3 min-h-12 max-w-5xl"
          triggerClassName="h-10 py-4 px-2"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">{renderTabContent()}</div>
        <div className="lg:col-span-1">
          <StatusTimeline title={timelineData.title} items={timelineData.items} />
        </div>
      </div>
    </>
  );

  const renderDialogSection = () => (
    <>
      <ShareDetailsDialog
        open={shareDialogOpen}
        onOpenChange={handleShareDialogOpen}
        title={SHARE_CLAIM_STATUS_CONFIG.title}
        description={SHARE_CLAIM_STATUS_CONFIG.description}
        descriptionHighlight={claimNumber}
        claimBannerText={claimSummaryBanner}
        recipients={recipients}
        selectedRecipientId={effectiveSelectedId}
        onSelectRecipient={handleSelectRecipient}
        channels={channels}
        onChannelsChange={setShareChannels}
        dependentChannelsByMember={dependentChannelsByMember}
        onDependentChannelsChange={handleDependentChannelsChange}
        activeDependentMemberId={activeDependentMemberId}
        onDependentActiveMemberChange={handleDependentActiveMemberChange}
        onChannelValueChange={handleChannelValueChange}
        channelErrors={
          effectiveSelectedId === OTHERS_RECIPIENT_ID ? othersChannelErrors : undefined
        }
        loading={isRecipientsLoading}
        cancelLabel={SHARE_CLAIM_STATUS_CONFIG.cancelLabel}
        shareLabel={SHARE_CLAIM_STATUS_CONFIG.shareLabel}
        onCancel={() => handleShareDialogOpen(false)}
        onShare={() => {
          handleShareSubmit();
          trackClaimStatusShareSubmit(segmentBase, claimNumber);
        }}
        canShare={canShare}
        showCloseButton
        sendSegmentEvent={() => {
          trackClaimStatusShareDialogView(segmentBase, claimNumber);
        }}
      />

      <UploadDocumentsDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        data={uploadDialogData}
        rows={uploadDocumentRows}
        activeUploadRowId={activeUploadRowId}
        uploadProgressByRow={uploadProgressByRow}
        onDocumentRequestedChange={handleDocumentRequestedChange}
        onNotesChange={handleNotesChange}
        onUploadClick={handleUploadClick}
        onViewClick={handleViewUploadedDocument}
        onDeleteClick={handleDeleteUploadedDocument}
        onAddDocument={handleAddUploadDocument}
        onSubmit={handleSubmitUploadedDocuments}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={DOCUMENT_UPLOAD_ACCEPT}
        onChange={handleFileSelect}
        disabled={isUploadingDocument || isSubmittingDocuments}
      />

      <ViewDocumentsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        documentsLabel="Documents"
        notesLabel="Document notes"
        notesPlaceholder="Notes about this document (optional)"
        emptyPreviewLabel="No document selected."
        documents={viewDocumentItem}
        selectedDocument={selectedViewDocument}
        onSelectDocument={handleSelectViewDocument}
      />
    </>
  );

  return (
    <div className={PAGE_LAYOUT_CLASS}>
      <Breadcrumbs />
      {renderHeaderSection()}
      {renderContentSection()}
      {renderDialogSection()}
    </div>
  );
}
