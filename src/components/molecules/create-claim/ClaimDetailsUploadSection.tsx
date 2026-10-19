import { Button } from '@/components/ui/button';
import {
  CREATE_CLAIM_UPLOAD_DOCUMENT_GROUPS,
  CREATE_CLAIM_UPLOAD_DOCUMENTS_EMPTY_PLACEHOLDER,
} from '@/lib/constants/createClaim.constants';
import type { ClaimDocumentUploadSlot } from '@/lib/utils/createClaimDocumentUploadSlots';
import type { SubmitDeathClaimDocumentItem } from '@/lib/types/claims-management/deathClaimApi';
import { cn } from '@/lib/utils';

import { useMemo, type ChangeEventHandler, type MutableRefObject } from 'react';

import { Check, Eye, Loader2, Plus } from 'lucide-react';

const CLAIM_UPLOAD_HELPER_TEXT = 'Supported formats: PDF, JPG, PNG. Max file size: 10MB.';

export type ClaimDetailsUploadSectionProps = {
  uploadSlots: ClaimDocumentUploadSlot[];
  uploadSlotFiles: Partial<Record<string, File[]>>;
  uploadInputsRef: MutableRefObject<Partial<Record<string, HTMLInputElement | null>>>;
  onUploadSlotChange: (slotId: string) => ChangeEventHandler<HTMLInputElement>;
  uploadedDocuments?: Partial<Record<string, SubmitDeathClaimDocumentItem[]>>;
  onViewUploadedDocument?: (slotId: string) => void;
  readOnly?: boolean;
  /** Slot id currently uploading to the partner document upload API. */
  uploadingSlotId?: string | null;
};

function DocumentUploadRow({
  listIndex,
  slot,
  uploadSlotFiles,
  uploadInputsRef,
  onUploadSlotChange,
  uploadedDocuments,
  onViewUploadedDocument,
  isUploading,
  readOnly,
}: {
  listIndex: number;
  slot: ClaimDocumentUploadSlot;
  uploadSlotFiles: Partial<Record<string, File[]>>;
  uploadInputsRef: MutableRefObject<Partial<Record<string, HTMLInputElement | null>>>;
  onUploadSlotChange: (slotId: string) => ChangeEventHandler<HTMLInputElement>;
  uploadedDocuments?: SubmitDeathClaimDocumentItem[];
  onViewUploadedDocument?: (slotId: string) => void;
  isUploading: boolean;
  readOnly: boolean;
}) {
  const files = uploadSlotFiles[slot.id] ?? [];
  const uploaded = files.length > 0 || Boolean(uploadedDocuments?.length);
  const displayItems = Array.from(
    { length: Math.max(files.length, uploadedDocuments?.length ?? 0) },
    (_, index) => ({
      filename:
        files[index]?.name ??
        uploadedDocuments?.[index]?.filename ??
        CREATE_CLAIM_UPLOAD_DOCUMENTS_EMPTY_PLACEHOLDER,
      uploadedDocument: uploadedDocuments?.[index],
    }),
  );

  const openPicker = () => {
    if (isUploading || readOnly) return;
    uploadInputsRef.current[slot.id]?.click();
  };

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="text-sm font-semibold leading-snug text-pagination-text">
        <span aria-hidden>{listIndex}. </span>
        {slot.title}
        {slot.isRequired ? (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <input
          ref={(el) => {
            uploadInputsRef.current[slot.id] = el;
          }}
          type="file"
          className="sr-only"
          accept={slot.accept}
          aria-required={slot.isRequired}
          aria-label={`Upload file for ${listIndex}. ${slot.title}`}
          disabled={isUploading || readOnly}
          onChange={onUploadSlotChange(slot.id)}
        />
        <div
          className={cn(
            'flex min-h-10 w-full flex-1 flex-wrap items-center gap-2',
            isUploading && 'opacity-80',
          )}
        >
          {displayItems.length > 0 ? (
            displayItems.map((item, index) => (
              <div
                key={`${slot.id}-${item.filename}-${index}`}
                className="flex min-h-10 w-full items-center gap-2 rounded-lg border border-green-200 bg-green-50/50 px-3 py-2.5 text-left shadow-xs sm:min-w-40"
              >
                <span
                  className="min-w-0 flex-1 truncate text-sm font-medium text-pagination-text"
                  title={item.filename}
                >
                  {item.filename}
                </span>
                <Check className="size-5 shrink-0 text-green-600" strokeWidth={2.5} aria-hidden />
              </div>
            ))
          ) : (
            <div
              className={cn(
                'flex min-h-10 w-full flex-1 items-center gap-2 rounded-lg border border-pagination-border bg-white px-3 py-2.5 text-left shadow-xs',
                isUploading && 'opacity-80',
              )}
            >
              <span className="min-w-0 flex-1 truncate text-sm text-pagination-text-muted">
                {CREATE_CLAIM_UPLOAD_DOCUMENTS_EMPTY_PLACEHOLDER}
              </span>
              {isUploading ? (
                <Loader2
                  className="size-5 shrink-0 animate-spin text-pagination-text-muted"
                  aria-hidden
                />
              ) : null}
            </div>
          )}
        </div>
        {!readOnly ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 shadow-xs"
            disabled={isUploading}
            aria-label={uploaded ? `Add more ${slot.title}` : `Upload ${slot.title}`}
            title={uploaded ? `Add more ${slot.title}` : `Upload ${slot.title}`}
            onClick={openPicker}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
          </Button>
        ) : null}
        {uploadedDocuments?.some((document) => document.url) && onViewUploadedDocument ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 shadow-xs"
            disabled={isUploading}
            aria-label={`View ${slot.title}`}
            title={`View ${slot.title}`}
            onClick={() => onViewUploadedDocument(slot.id)}
          >
            <Eye className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-pagination-text-muted">{CLAIM_UPLOAD_HELPER_TEXT}</p>
    </div>
  );
}

function DocumentUploadGroup({
  title,
  slots,
  uploadSlotFiles,
  uploadInputsRef,
  onUploadSlotChange,
  uploadedDocuments,
  onViewUploadedDocument,
  readOnly,
  uploadingSlotId,
  headingId,
}: {
  title: string;
  slots: ClaimDocumentUploadSlot[];
  uploadSlotFiles: Partial<Record<string, File[]>>;
  uploadInputsRef: MutableRefObject<Partial<Record<string, HTMLInputElement | null>>>;
  onUploadSlotChange: (slotId: string) => ChangeEventHandler<HTMLInputElement>;
  uploadedDocuments?: Partial<Record<string, SubmitDeathClaimDocumentItem[]>>;
  onViewUploadedDocument?: (slotId: string) => void;
  readOnly: boolean;
  uploadingSlotId: string | null | undefined;
  headingId: string;
}) {
  if (slots.length === 0) return null;

  return (
    <section aria-labelledby={headingId}>
      <h3
        id={headingId}
        className="border-pagination-border border-b pb-3 text-base font-semibold text-pagination-text"
      >
        {title}
      </h3>
      <div className="divide-pagination-border">
        {slots.map((slot, index) => (
          <DocumentUploadRow
            key={slot.id}
            listIndex={index + 1}
            slot={slot}
            uploadSlotFiles={uploadSlotFiles}
            uploadInputsRef={uploadInputsRef}
            onUploadSlotChange={onUploadSlotChange}
            uploadedDocuments={uploadedDocuments?.[slot.id]}
            onViewUploadedDocument={onViewUploadedDocument}
            isUploading={uploadingSlotId === slot.id}
            readOnly={readOnly}
          />
        ))}
      </div>
    </section>
  );
}

export function ClaimDetailsUploadSection({
  uploadSlots,
  uploadSlotFiles,
  uploadInputsRef,
  onUploadSlotChange,
  uploadedDocuments,
  onViewUploadedDocument,
  readOnly = false,
  uploadingSlotId = null,
}: ClaimDetailsUploadSectionProps) {
  const { mandatorySlots, optionalSlots } = useMemo(() => {
    const mandatory: ClaimDocumentUploadSlot[] = [];
    const optional: ClaimDocumentUploadSlot[] = [];
    for (const slot of uploadSlots) {
      if (readOnly && !uploadedDocuments?.[slot.id]) {
        continue;
      }
      if (slot.isRequired) {
        mandatory.push(slot);
      } else {
        optional.push(slot);
      }
    }
    return { mandatorySlots: mandatory, optionalSlots: optional };
  }, [readOnly, uploadSlots, uploadedDocuments]);

  return (
    <div className="flex flex-col gap-6">
      <DocumentUploadGroup
        title={CREATE_CLAIM_UPLOAD_DOCUMENT_GROUPS.mandatory.title}
        slots={mandatorySlots}
        uploadSlotFiles={uploadSlotFiles}
        uploadInputsRef={uploadInputsRef}
        onUploadSlotChange={onUploadSlotChange}
        uploadedDocuments={uploadedDocuments}
        onViewUploadedDocument={onViewUploadedDocument}
        readOnly={readOnly}
        uploadingSlotId={uploadingSlotId}
        headingId="create-claim-upload-mandatory-heading"
      />
      <DocumentUploadGroup
        title={CREATE_CLAIM_UPLOAD_DOCUMENT_GROUPS.optional.title}
        slots={optionalSlots}
        uploadSlotFiles={uploadSlotFiles}
        uploadInputsRef={uploadInputsRef}
        onUploadSlotChange={onUploadSlotChange}
        uploadedDocuments={uploadedDocuments}
        onViewUploadedDocument={onViewUploadedDocument}
        readOnly={readOnly}
        uploadingSlotId={uploadingSlotId}
        headingId="create-claim-upload-optional-heading"
      />
    </div>
  );
}
