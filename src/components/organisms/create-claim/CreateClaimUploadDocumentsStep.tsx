'use client';

import { ClaimDetailsUploadSection } from '@/components/molecules/create-claim/ClaimDetailsUploadSection';
import { CreateClaimPolicySidebar } from '@/components/molecules/create-claim/CreateClaimPolicySidebar';
import { CreateClaimSelectionSummary } from '@/components/molecules/create-claim/CreateClaimSelectionSummary';
import { CreateClaimUploadedDocumentViewerDialog } from '@/components/molecules/create-claim/CreateClaimUploadedDocumentViewerDialog';
import { Button } from '@/components/ui/button';
import {
  CREATE_CLAIM_FOOTER,
  CREATE_CLAIM_UPLOAD_DOCUMENTS_FOOTER,
  CREATE_CLAIM_UPLOAD_DOCUMENTS_SECTION,
} from '@/lib/constants/createClaim.constants';
import type { ClaimDocumentUploadSlot } from '@/lib/utils/createClaimDocumentUploadSlots';
import type { SubmitDeathClaimDocumentItem } from '@/lib/types/claims-management/deathClaimApi';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import type { CreateClaimPolicySummaryRow } from '@/lib/utils/createClaim';
import { useState, type ChangeEventHandler, type MutableRefObject } from 'react';
import { Loader2 } from 'lucide-react';

export type CreateClaimUploadDocumentsStepProps = {
  selectedPolicy: RecentSearchPolicy;
  insuredSummaryName: string;
  sidebarRows: CreateClaimPolicySummaryRow[];
  uploadSlots: ClaimDocumentUploadSlot[];
  documentsLoadError: boolean;
  documentsLoading: boolean;
  uploadSlotFiles: Partial<Record<string, File[]>>;
  uploadedDocuments?: Partial<Record<string, SubmitDeathClaimDocumentItem[]>>;
  documentsReadOnly?: boolean;
  uploadInputsRef: MutableRefObject<Partial<Record<string, HTMLInputElement | null>>>;
  onUploadSlotChange: (slotId: string) => ChangeEventHandler<HTMLInputElement>;
  onRetryLoadDocuments?: () => void;
  onBack?: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  /** Accidental-death flow: slot id while file is uploading to document service */
  uploadingSlotId?: string | null;
  /** When set (e.g. autosave copy), shown bottom-left instead of selection summary (Figma draft line). */
  draftStatusLine?: string;
};

export function CreateClaimUploadDocumentsStep({
  selectedPolicy,
  insuredSummaryName,
  sidebarRows,
  uploadSlots,
  documentsLoadError,
  documentsLoading,
  uploadSlotFiles,
  uploadedDocuments,
  documentsReadOnly = false,
  uploadInputsRef,
  onUploadSlotChange,
  onRetryLoadDocuments,
  onBack,
  onContinue,
  continueDisabled = false,
  uploadingSlotId = null,
  draftStatusLine,
}: CreateClaimUploadDocumentsStepProps) {
  const showUploadGrid = !documentsLoading && !documentsLoadError && uploadSlots.length > 0;
  const [selectedDocuments, setSelectedDocuments] = useState<SubmitDeathClaimDocumentItem[]>([]);

  const handleViewUploadedDocument = (slotId: string) => {
    setSelectedDocuments(uploadedDocuments?.[slotId]?.filter((document) => document.url) ?? []);
  };

  return (
    <>
      <div className="flex w-full flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold leading-none text-pagination-text">
            {documentsReadOnly
              ? CREATE_CLAIM_UPLOAD_DOCUMENTS_SECTION.uploadedTitle
              : CREATE_CLAIM_UPLOAD_DOCUMENTS_SECTION.title}
          </h2>
          <p className="text-sm leading-5 text-pagination-text-muted">
            {CREATE_CLAIM_UPLOAD_DOCUMENTS_SECTION.subtitle}
          </p>
        </div>

        <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="bg-muted/30 overflow-hidden rounded-lg border border-pagination-border p-6 shadow-xs">
              {documentsLoading ? (
                <div
                  className="flex min-h-width-200 flex-col items-center justify-center gap-3 py-8 text-sm text-pagination-text-muted"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="size-8 animate-spin text-pagination-text-muted" aria-hidden />
                  <span>Loading required documents…</span>
                </div>
              ) : null}
              {documentsLoadError ? (
                <div className="flex min-h-width-200 flex-col items-center justify-center gap-4 py-8 text-center">
                  <p className="text-sm text-pagination-text">
                    We could not load the list of required documents. Please try again.
                  </p>
                  {onRetryLoadDocuments ? (
                    <Button type="button" variant="secondary" onClick={onRetryLoadDocuments}>
                      Retry
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {showUploadGrid ? (
                <ClaimDetailsUploadSection
                  uploadSlots={uploadSlots}
                  uploadSlotFiles={uploadSlotFiles}
                  uploadInputsRef={uploadInputsRef}
                  onUploadSlotChange={onUploadSlotChange}
                  uploadedDocuments={uploadedDocuments}
                  onViewUploadedDocument={handleViewUploadedDocument}
                  readOnly={documentsReadOnly}
                  uploadingSlotId={uploadingSlotId}
                />
              ) : null}
              {!documentsLoading && !documentsLoadError && uploadSlots.length === 0 ? (
                <p className="py-8 text-center text-sm text-pagination-text-muted">
                  {'No documents to upload for this claim type.'}
                </p>
              ) : null}
            </div>
          </div>

          <CreateClaimPolicySidebar
            rows={sidebarRows}
            rowDensity="compact"
            className="bg-muted border-pagination-border shrink-0 shadow-xs lg:w-width-280 w-full rounded-[10px] border px-4 py-3 lg:sticky lg:top-4 lg:max-h-[min(650px,calc(100vh-140px))] lg:overflow-y-auto"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {draftStatusLine ? (
            <p className="max-w-xl text-sm italic text-pagination-text-muted">{draftStatusLine}</p>
          ) : (
            <CreateClaimSelectionSummary
              insuredName={insuredSummaryName}
              policyNumber={selectedPolicy.policyNumber}
            />
          )}
          <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-auto">
            {onBack ? (
              <Button
                type="button"
                variant="secondary"
                className="h-10 rounded-lg border-pagination-border bg-white px-5 text-sm font-medium shadow-xs"
                onClick={onBack}
              >
                {CREATE_CLAIM_FOOTER.backCta}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="default"
              onClick={onContinue}
              disabled={continueDisabled}
              className="h-10 rounded-lg bg-create-claim-button px-5 text-sm font-medium text-create-claim-button-text shadow-xs hover:bg-create-claim-button-hover disabled:opacity-60"
            >
              {CREATE_CLAIM_UPLOAD_DOCUMENTS_FOOTER.continueCta}
            </Button>
          </div>
        </div>
      </div>
      <CreateClaimUploadedDocumentViewerDialog
        open={selectedDocuments.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDocuments([]);
          }
        }}
        documents={selectedDocuments}
      />
    </>
  );
}
