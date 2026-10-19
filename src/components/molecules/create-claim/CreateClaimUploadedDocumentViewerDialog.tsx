'use client';

import { AppImage } from '@/components/atoms/AppImage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SubmitDeathClaimDocumentItem } from '@/lib/types/claims-management/deathClaimApi';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export type CreateClaimUploadedDocumentViewerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: SubmitDeathClaimDocumentItem[];
};

function resolveDocumentExtension(document: SubmitDeathClaimDocumentItem | null): string {
  const filenameExtension = document?.filename.split('.').pop()?.toLowerCase() ?? '';
  if (filenameExtension) return filenameExtension;

  try {
    return document?.url
      ? (new URL(document.url).pathname.split('.').pop()?.toLowerCase() ?? '')
      : '';
  } catch {
    return '';
  }
}

export function CreateClaimUploadedDocumentViewerDialog({
  open,
  onOpenChange,
  documents,
}: CreateClaimUploadedDocumentViewerDialogProps) {
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0);
  const selectedDocument = documents[selectedDocumentIndex] ?? documents[0] ?? null;
  const documentTitle = selectedDocument?.name ?? 'Uploaded documents';

  const extension = resolveDocumentExtension(selectedDocument);
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension);
  const isPdf = extension === 'pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto w-full max-w-5xl border border-border bg-card p-6 shadow-xs">
        <DialogHeader className="flex flex-col gap-1">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {documentTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {selectedDocument?.filename ?? 'Document preview'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[70vh] flex-col gap-4 overflow-hidden md:flex-row">
          <div className="flex w-full flex-col gap-2 md:w-56">
            <p className="text-sm font-medium text-foreground">Documents</p>
            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
              {documents.map((document, index) => {
                const isActive = index === selectedDocumentIndex;
                return (
                  <Button
                    key={`${document.document_id}-${index}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDocumentIndex(index)}
                    className={cn('w-full justify-between text-xs', isActive && 'bg-muted')}
                  >
                    <span className="truncate">{document.filename || document.name}</span>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-opacity',
                        !isActive && 'opacity-0',
                      )}
                      aria-hidden
                    />
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex h-full flex-1 items-center justify-center rounded-md border border-border bg-muted p-4">
            {selectedDocument?.url && isImage ? (
              <div key={selectedDocument.url} className="relative h-full w-full">
                <AppImage
                  src={selectedDocument.url}
                  alt={`${selectedDocument.name} preview`}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : null}

            {selectedDocument?.url && isPdf ? (
              <iframe
                key={selectedDocument.url}
                src={selectedDocument.url}
                className="h-full w-full rounded-md"
                title={selectedDocument.name}
              />
            ) : null}

            {selectedDocument?.url && !isImage && !isPdf ? (
              <Button type="button" variant="outline" size="sm" asChild>
                <a
                  href={selectedDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  {'Download File'}
                </a>
              </Button>
            ) : null}

            {!selectedDocument?.url ? (
              <p className="text-sm text-muted-foreground">{'No document selected.'}</p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
