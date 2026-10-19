'use client';

import { useMemo } from 'react';
import { Eye, Inbox, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  isUploadDocumentRowCompleted,
  resolveUploadDocumentsDialogData,
  mapUploadDocumentsRowsToGroups,
} from '@/lib/adapter/claims-detail/claimsDocuments.adapter';
import type {
  UploadAdditionalDocumentsData,
  UploadDocumentsRow,
} from '@/lib/types/claims-management/claimDetails';
import { cn, formatEnum, getFileTypeFromFilename } from '@/lib/utils';

type UploadDocumentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Partial<UploadAdditionalDocumentsData>;
  rows: UploadDocumentsRow[];
  onDocumentRequestedChange: (rowId: string, value: string) => void;
  onNotesChange: (rowId: string, value: string) => void;
  onUploadClick: (rowId: string) => void;
  onViewClick?: (rowId: string) => void;
  onDeleteClick?: (rowId: string) => void;
  onAddDocument: (rowId: string, isAdditional: boolean) => void;
  activeUploadRowId?: string;
  uploadProgressByRow?: Record<string, number>;
  onSubmit: () => void;
  className?: string;
};

export default function UploadDocumentsDialog({
  open,
  onOpenChange,
  data,
  rows,
  onNotesChange,
  onUploadClick,
  onViewClick,
  onDeleteClick,
  onAddDocument,
  activeUploadRowId,
  uploadProgressByRow = {},
  onSubmit,
  className,
}: UploadDocumentsDialogProps) {
  const resolvedData = useMemo(() => resolveUploadDocumentsDialogData(data), [data]);
  const groupedRows = useMemo(() => mapUploadDocumentsRowsToGroups(rows), [rows]);

  const hasIncompleteUploads = useMemo(() => {
    return rows.some((row) => !isUploadDocumentRowCompleted(row));
  }, [rows]);

  const handleSubmit = () => {
    if (activeUploadRowId) {
      toast.error('Please wait for the current upload to complete.');
      return;
    }

    if (hasIncompleteUploads) {
      toast.error('Please upload all required documents before submitting.');
      return;
    }

    onSubmit();
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && activeUploadRowId) {
      toast.warning('Cannot close while upload is in progress.');
      return;
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        showCloseButton
        className={cn(
          'w-full max-w-[760px] rounded-xl mx-auto border border-upload-additional-documents-table-border bg-upload-additional-documents-table-bg p-6 shadow-upload-additional-documents-table',
          className,
        )}
      >
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-semibold leading-none">
            {resolvedData.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-normal text-muted-foreground">
            {resolvedData.claimSummary}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[615px] overflow-y-auto">
          {groupedRows.map((group) => (
            <div key={group.id} className="space-y-4">
              <p className="text-sm font-medium leading-none text-foreground">{group.title}</p>

              <div className="space-y-6">
                {Array.from(
                  group.rows.reduce((mappedRows, row) => {
                    const documentKey = row.documentId || row.groupId || row.id;
                    const documentRows = mappedRows.get(documentKey) ?? [];
                    documentRows.push(row);
                    mappedRows.set(documentKey, documentRows);
                    return mappedRows;
                  }, new Map<string, UploadDocumentsRow[]>()),
                ).map(([documentKey, documentRows], docIndex) => {
                  const firstRow = documentRows[0];
                  const uploaded = documentRows.some((row) => isUploadDocumentRowCompleted(row));
                  const hasUnuploadedRows = documentRows.some(
                    (row) => !isUploadDocumentRowCompleted(row),
                  );
                  const isUploadingRow = firstRow.id === activeUploadRowId;
                  const uploadProgress = uploadProgressByRow[firstRow.id] ?? 0;
                  const firstDocumentComment = firstRow?.comment?.trim() ?? '';
                  const showReadOnlyComment = Boolean(firstDocumentComment);
                  const documentNumber = docIndex + 1;

                  return (
                    <div
                      key={documentKey}
                      className="rounded-xl border border-border bg-card p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <ol
                          className="text-sm font-medium leading-none text-foreground list-decimal list-inside"
                          start={documentNumber}
                        >
                          <li>
                            <span className="leading-none">{formatEnum(firstRow.type)}</span>
                          </li>
                        </ol>
                        {!uploaded && !isUploadingRow && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onUploadClick(firstRow.id)}
                            disabled={Boolean(activeUploadRowId)}
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </Button>
                        )}
                        {isUploadingRow && (
                          <Button type="button" variant="outline" size="sm" disabled>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading... {uploadProgress}%
                          </Button>
                        )}
                      </div>

                      {showReadOnlyComment && (
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 space-y-1.5">
                          <p className="text-xs font-medium leading-none text-blue-600">
                            Reason for re-upload request
                          </p>
                          <p className="text-xs leading-normal text-blue-600 whitespace-pre-line">
                            {firstDocumentComment}
                          </p>
                        </div>
                      )}

                      {uploaded && (
                        <div className="rounded-md bg-slate-50 p-3.5 space-y-2.5">
                          {documentRows.map((row) => {
                            const isRowUploaded = isUploadDocumentRowCompleted(row);

                            if (isRowUploaded) {
                              return (
                                <div
                                  key={row.id}
                                  className="flex items-center gap-3 rounded-md border border-border bg-white p-3"
                                >
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-blue-50">
                                    <Inbox className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-1 leading-none">
                                    <p className="text-sm font-medium text-card-foreground truncate">
                                      {row.filename || `${formatEnum(row.type)}.pdf`}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {getFileTypeFromFilename(row.filename)}
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => onViewClick?.(row.id)}
                                      aria-label="View uploaded document"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => onDeleteClick?.(row.id)}
                                      aria-label="Delete uploaded document"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          })}

                          {documentRows.some((row) => !isUploadDocumentRowCompleted(row)) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const unuploadedRow = documentRows.find(
                                  (row) => !isUploadDocumentRowCompleted(row),
                                );
                                if (unuploadedRow) {
                                  onUploadClick(unuploadedRow.id);
                                }
                              }}
                              disabled={Boolean(activeUploadRowId)}
                              className="w-full"
                            >
                              {activeUploadRowId &&
                              documentRows.some((row) => row.id === activeUploadRowId) ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Uploading... {uploadProgressByRow[activeUploadRowId] ?? 0}%
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  Upload
                                </>
                              )}
                            </Button>
                          )}

                          <Textarea
                            value={firstRow.note}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 500) {
                                onNotesChange(firstRow.id, value);
                              }
                            }}
                            placeholder={resolvedData.placeholders.note}
                            className="min-h-[60px] w-full text-xs resize-none"
                            maxLength={500}
                          />
                          {firstRow.note && (
                            <p className="text-xs text-muted-foreground text-right">
                              {firstRow.note.length}/500 characters
                            </p>
                          )}

                          {!hasUnuploadedRows && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                onAddDocument(firstRow.id, firstRow.isAdditional ?? false)
                              }
                              className="h-auto text-sm hover:bg-transparent hover:text-primary"
                            >
                              <Plus className="h-4 w-4" />
                              Add additional files
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-3.5">
          <Button
            variant="outline"
            onClick={() => handleDialogClose(false)}
            disabled={Boolean(activeUploadRowId)}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={Boolean(activeUploadRowId)}
            className="bg-upload-additional-documents-table-primary-bg text-upload-additional-documents-table-primary-text hover:bg-upload-additional-documents-table-primary-bg-hover disabled:opacity-50"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
