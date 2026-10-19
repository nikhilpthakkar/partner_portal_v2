'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CircleCheckBig, Upload, X } from 'lucide-react';
import {
  useCreateSupportTicketMutation,
  useDisputeDocumentUploadMutation,
} from '@/lib/query/financials.queries';
import type { PolicyEndorsementDocumentUploadResponse } from '@/lib/types/policy-management/policyRefundApi';
import type { CreateSupportTicketApiResponse } from '@/lib/types/financials';
import { cn } from '@/lib/utils';
import { DOCUMENT_UPLOAD_ACCEPT, isDocumentUploadAllowed } from '@/lib/utils/documentUpload';
import SimpleSelect from '@/components/molecules/SimpleSelect';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackSupportCloseDialog,
  trackSupportDialogView,
  trackSupportRemoveDocument,
  trackSupportSelectCategory,
  trackSupportSubmitException,
  trackSupportSubmitTicket,
  trackSupportUploadDocument,
  trackSupportUploadException,
} from '@/lib/segment/track/support';

const MAX_DESCRIPTION_WORDS = 500;
const SUPPORT_TICKET_CATEGORY_OPTIONS = [
  { value: 'overview', label: 'overview' },
  { value: 'policy_management', label: 'policy management' },
  { value: 'claims_management', label: 'claims management' },
  { value: 'financials', label: 'financials' },
  { value: 'reports', label: 'reports' },
];

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

type RaiseDisputeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEntryIds?: string[];
  selectedEntryPeriods?: string[];
  selectedEntryDate?: string;
  selectedEntryAmount?: number;
};

type StagedDisputeFile = Pick<PolicyEndorsementDocumentUploadResponse, 'id' | 'url' | 'name'>;
type SupportTicketSuccess = Pick<
  CreateSupportTicketApiResponse,
  'ticketId' | 'userEmail' | 'resolutionBy'
>;

export default function RaiseDisputeModal({ open, onOpenChange }: RaiseDisputeModalProps) {
  const segmentBase = useSegmentPartnerBase();
  const segmentBaseRef = useRef(segmentBase);
  segmentBaseRef.current = segmentBase;
  const [issueCategory, setIssueCategory] = useState(SUPPORT_TICKET_CATEGORY_OPTIONS[0].value);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<StagedDisputeFile[]>([]);
  const [supportTicketSuccess, setSupportTicketSuccess] = useState<SupportTicketSuccess | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRaiseDisputeInFlightRef = useRef(false);
  const { mutate: createSupportTicket, isPending } = useCreateSupportTicketMutation();
  const { mutate: uploadDisputeDocument, isPending: isUploadingDocument } =
    useDisputeDocumentUploadMutation();

  const descriptionWordCount = countWords(description);
  const categoryValid = issueCategory.trim().length > 0;
  const descriptionValid =
    description.trim().length > 0 && descriptionWordCount <= MAX_DESCRIPTION_WORDS;

  useEffect(() => {
    if (open) {
      trackSupportDialogView(segmentBaseRef.current);
    }
  }, [open]);

  const resetForm = () => {
    setIssueCategory(SUPPORT_TICKET_CATEGORY_OPTIONS[0].value);
    setDescription('');
    setFiles([]);
    setSupportTicketSuccess(null);
    isRaiseDisputeInFlightRef.current = false;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (
      !categoryValid ||
      !descriptionValid ||
      isPending ||
      isUploadingDocument ||
      isRaiseDisputeInFlightRef.current
    ) {
      return;
    }
    isRaiseDisputeInFlightRef.current = true;
    trackSupportSubmitTicket(segmentBase, {
      category: issueCategory,
      document_count: files.length,
    });
    createSupportTicket(
      {
        category: issueCategory,
        description,
        documents: files.map(({ url, name }) => ({ url, name })),
      },
      {
        onSettled: () => {
          isRaiseDisputeInFlightRef.current = false;
        },
        onSuccess: ({ ticketId, userEmail, resolutionBy }) => {
          setSupportTicketSuccess({ ticketId, userEmail, resolutionBy });
        },
        onError: (mutationError) => {
          trackSupportSubmitException(segmentBase, {
            exception_message:
              mutationError instanceof Error ? mutationError.message : undefined,
          });
        },
      },
    );
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      trackSupportCloseDialog(segmentBase);
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    void (async () => {
      for (const file of selected) {
        if (!(await isDocumentUploadAllowed(file, e.target))) return;
      }
      uploadDisputeDocument(selected, {
        onSuccess: (responses: PolicyEndorsementDocumentUploadResponse[]) => {
          setFiles((prev) => [
            ...prev,
            ...responses.map(({ id, url, name }) => ({ id, url, name })),
          ]);
          responses.forEach(({ name }) => {
            trackSupportUploadDocument(segmentBase, name);
          });
          e.target.value = '';
        },
        onError: (mutationError) => {
          trackSupportUploadException(segmentBase, {
            exception_message:
              mutationError instanceof Error ? mutationError.message : undefined,
          });
          e.target.value = '';
        },
      });
    })();
  };

  const removeStagedFile = (id: string) => {
    const fileName = files.find((item) => item.id === id)?.name ?? id;
    trackSupportRemoveDocument(segmentBase, fileName);
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className={cn(
          'rounded-[10px] border-0 bg-white p-6 !shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)]',
          supportTicketSuccess ? 'max-w-[512px]' : 'max-w-[645px]',
        )}
      >
        {supportTicketSuccess ? (
          <>
            <div className="flex min-h-[180px] w-full flex-col items-center justify-center gap-2 text-center">
              <div className="flex size-10 items-center justify-center rounded-md border border-green-700 bg-white p-2 shadow-xs">
                <CircleCheckBig className="size-6 text-green-700" aria-hidden />
              </div>
              <DialogTitle className="text-center text-lg font-semibold leading-7">
                Ticket created successfully
              </DialogTitle>
              <p className="max-w-[430px] text-center text-sm leading-5 text-muted-foreground">
                Your ticket ID is{' '}
                <span className="font-semibold text-muted-foreground">
                  {supportTicketSuccess.ticketId || '-'}
                </span>
                . We have sent a confirmation email to{' '}
                {supportTicketSuccess.userEmail || 'your registered email'}. Expect a resolution
                within {supportTicketSuccess.resolutionBy || '24 hours'}.
              </p>
            </div>
            <DialogFooter className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-md border-border bg-white shadow-xs hover:bg-white"
                onClick={() => handleDialogOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create support ticket</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 pt-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-none text-foreground">
                  Select issue category <span className="text-destructive">*</span>
                </label>
                <SimpleSelect
                  value={issueCategory}
                  options={SUPPORT_TICKET_CATEGORY_OPTIONS}
                  onValueChange={(value) => {
                    setIssueCategory(value);
                    trackSupportSelectCategory(segmentBase, value);
                  }}
                  className="h-9 w-[295px] rounded-md border-border bg-white px-4 text-sm font-normal text-muted-foreground shadow-xs hover:bg-white focus-visible:bg-white"
                  contentClassName="min-w-[295px]"
                  disabled={isPending || isUploadingDocument}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="dispute-description"
                  className="text-sm font-medium leading-none text-foreground"
                >
                  Issue description <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="dispute-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the issue you are facing"
                  className={cn(
                    'min-h-[60px] rounded-md border-border bg-white px-3 py-2 text-sm text-foreground shadow-xs hover:bg-white focus-visible:bg-white',
                    descriptionWordCount > MAX_DESCRIPTION_WORDS &&
                      'border-destructive focus-visible:ring-destructive/30',
                  )}
                  required
                  aria-invalid={descriptionWordCount > MAX_DESCRIPTION_WORDS}
                  aria-describedby="dispute-description-helper"
                />
                <p
                  id="dispute-description-helper"
                  className={cn(
                    'text-xs text-muted-foreground',
                    descriptionWordCount > MAX_DESCRIPTION_WORDS && 'text-destructive',
                  )}
                >
                  {descriptionWordCount > MAX_DESCRIPTION_WORDS
                    ? `Please shorten your description to ${MAX_DESCRIPTION_WORDS} words or fewer (currently ${descriptionWordCount}).`
                    : `${Math.max(0, MAX_DESCRIPTION_WORDS - descriptionWordCount)}/${MAX_DESCRIPTION_WORDS} words remaining`}
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4">
                <span className="text-sm font-medium leading-none text-foreground">
                  Supporting documents (Optional)
                </span>

                <button
                  type="button"
                  className="flex flex-col items-center gap-6 rounded-[10px] border border-dashed border-border p-6 transition-colors cursor-pointer hover:bg-accent/30 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingDocument || isPending}
                >
                  <div className="rounded-md border border-border bg-white p-2 shadow-xs">
                    <Upload className="size-6 text-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium leading-none text-foreground">
                      Click to upload or drag a file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isUploadingDocument
                        ? 'Uploading…'
                        : files.length > 0
                          ? `${files.length} file(s) chosen`
                          : 'No file chosen'}
                    </p>
                  </div>
                </button>

                {files.length > 0 && (
                  <ul className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-md border border-border bg-background p-2 text-left text-sm">
                    {files.map(({ id, name }) => (
                      <li
                        key={id}
                        className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-muted/50"
                      >
                        <span className="min-w-0 truncate text-foreground" title={name}>
                          {name}
                        </span>
                        <button
                          type="button"
                          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={() => removeStagedFile(id)}
                          disabled={isUploadingDocument || isPending}
                          aria-label={`Remove ${name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept={DOCUMENT_UPLOAD_ACCEPT}
                />
              </div>
            </div>

            <DialogFooter className="pt-3.5">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!categoryValid || !descriptionValid || isPending || isUploadingDocument}
                className="rounded-md border-transparent bg-[#8B5CF6] text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-[#7c3aed] hover:text-white"
              >
                {isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
