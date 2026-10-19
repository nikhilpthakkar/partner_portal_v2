'use client';

import { useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';

import { AppImage } from '@/components/atoms/AppImage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type {
  ViewDocumentItem,
  ViewDocumentsData,
} from '@/lib/types/claims-management/claimDetails';
import { cn } from '@/lib/utils';
import { useClaimTabData } from '@/features/claim-details/tabs/useClaimTabData';
import { useSearchParams } from 'next/navigation';
import { VIEW_DOCUMENTS_DIALOG_TITLE } from '@/lib/constants/claimsDetail.constants';

type ViewDocumentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentsLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  emptyPreviewLabel: string;
  documents: ViewDocumentItem | undefined;
  selectedDocument: ViewDocumentsData | null;
  onSelectDocument: (document: ViewDocumentsData) => void;
  className?: string;
};

export default function ViewDocumentsDialog({
  open,
  onOpenChange,
  documentsLabel,
  notesLabel,
  notesPlaceholder,
  emptyPreviewLabel,
  documents,
  selectedDocument,
  onSelectDocument,
  className,
}: ViewDocumentsDialogProps) {
  const { panel } = useClaimTabData({
    panelId: 'claimant-information',
  });
  const claimantName = panel?.summary?.columns?.[0]?.[0]?.value;
  const claimNumber = useSearchParams().get('claimNumber');

  const claimSummary = useMemo(() => {
    return `Claim ID ${claimNumber} | ${claimantName}`;
  }, [claimNumber, claimantName]);

  useEffect(() => {
    if (open && documents && documents.data.length > 0 && !selectedDocument) {
      onSelectDocument(documents.data[0]);
    }
  }, [open, documents, selectedDocument, onSelectDocument]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'mx-auto w-full max-w-7xl border border-border bg-card p-6 shadow-xs',
          className,
        )}
      >
        <div className="flex flex-col gap-6">
          <DialogHeader className="flex flex-col gap-0">
            <DialogTitle className="text-lg font-semibold text-foreground">
              {VIEW_DOCUMENTS_DIALOG_TITLE}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {claimSummary}
            </DialogDescription>
          </DialogHeader>

          <div className="flex h-[70vh] flex-col gap-6 overflow-hidden lg:flex-row">
            {/* LEFT SIDE */}
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex h-full flex-col gap-4 md:flex-row">
                {/* DOCUMENT LIST */}
                <div className="flex w-full flex-col gap-2 md:w-56">
                  <p className="text-sm font-medium text-foreground">{documentsLabel}</p>

                  {documents && (
                    <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
                      {documents.data.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No pages available</p>
                      ) : (
                        documents.data.map((document) => {
                          const isActive = document.id === selectedDocument?.id;

                          return (
                            <Button
                              key={document.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onSelectDocument(document)}
                              className={cn(
                                'w-full justify-between text-xs',
                                isActive && 'bg-muted',
                              )}
                            >
                              <span className="truncate">{document.label}</span>

                              <ChevronRight
                                className={cn(
                                  'h-4 w-4 text-muted-foreground transition-opacity',
                                  !isActive && 'opacity-0',
                                )}
                              />
                            </Button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* PREVIEW */}
                <div className="flex h-full flex-1 items-center justify-center rounded-md border border-border bg-muted p-4">
                  {selectedDocument?.previewUrl ? (
                    (() => {
                      let extension = '';

                      try {
                        const urlObj = new URL(selectedDocument.previewUrl);
                        extension = urlObj.pathname.split('.').pop()?.toLowerCase() || '';
                      } catch {
                        extension = '';
                      }

                      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension);
                      const isPdf = extension === 'pdf';

                      if (isImage) {
                        return (
                          <div className="relative h-full w-full">
                            <AppImage
                              src={selectedDocument.previewUrl}
                              alt={`${selectedDocument.label} preview`}
                              fill
                              sizes="(min-width: 1024px) 60vw, 100vw"
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        );
                      }

                      if (isPdf) {
                        return (
                          <iframe
                            src={selectedDocument.previewUrl}
                            className="h-full w-full rounded-md"
                            title={selectedDocument.label}
                          />
                        );
                      }

                      return (
                        <Button type="button" variant="outline" size="sm" asChild>
                          <a
                            href={selectedDocument.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            Download File
                          </a>
                        </Button>
                      );
                    })()
                  ) : (
                    <p className="text-sm text-muted-foreground">{emptyPreviewLabel}</p>
                  )}
                </div>
              </div>
            </div>

            {/* NOTES */}
            {selectedDocument && selectedDocument.note && (
              <div key={selectedDocument.note} className="flex w-full flex-col gap-2 lg:w-72">
                <p className="text-sm font-medium text-foreground">{notesLabel}</p>
                <Textarea
                  readOnly
                  value={selectedDocument.note}
                  placeholder={notesPlaceholder}
                  className="min-h-24 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
