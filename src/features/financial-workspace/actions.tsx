'use client';

import { useState } from 'react';
import { AlertCircle, FileCheck2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFinancialWorkspace } from './provider';

export type ActionRequest = { type: 'dispute'; vanId: string; reference: string };

/** The only Financials action in this preview is the portal's existing dispute workflow. */
export function ActionDialog({ action, onClose }: { action: ActionRequest; onClose: () => void }) {
  const { view, execute, pending, error, clearError, unknownOutcome, checkOutcome } =
    useFinancialWorkspace();
  const [reference, setReference] = useState(action.reference);
  const [reason, setReason] = useState('');
  const [review, setReview] = useState(false);
  const [validation, setValidation] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setValidation('');
    clearError();
    if (reference.trim().length < 4) {
      setValidation('Enter a UTR or source reference of at least 4 characters.');
      return;
    }
    if (reason.trim().length < 8) {
      setValidation('Describe the issue in at least 8 characters.');
      return;
    }
    if (!review) {
      setReview(true);
      return;
    }
    if (
      await execute({
        type: 'dispute',
        vanId: action.vanId,
        reference: reference.trim(),
        reason: reason.trim(),
      })
    )
      onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          clearError();
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{review ? 'Review and confirm' : 'Raise dispute'}</DialogTitle>
          <DialogDescription>
            Flag this VAN ledger entry for investigation. Submitting a dispute does not change the
            balance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {review ? (
            <div className="space-y-3 rounded-xl border border-border p-4 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <FileCheck2 className="size-5 text-share-policy-primary" /> Financial dispute
              </p>
              <dl className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="text-muted-foreground">VAN</dt>
                <dd>{action.vanId}</dd>
                <dt className="text-muted-foreground">Reference</dt>
                <dd className="break-all">{reference}</dd>
                <dt className="text-muted-foreground">Issue</dt>
                <dd className="break-words">{reason}</dd>
                <dt className="text-muted-foreground">Submitted by</dt>
                <dd>{view.actor.label}</dd>
              </dl>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">{action.vanId}</p>
                <p className="mt-1 text-muted-foreground">
                  The account linked to the selected ledger row
                </p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dispute-reference" className="text-sm">
                  UTR or source reference
                </label>
                <Input
                  id="dispute-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  required
                  minLength={4}
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dispute-reason" className="text-sm">
                  What needs investigation?
                </label>
                <Textarea
                  id="dispute-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain the discrepancy and supporting evidence"
                  minLength={8}
                  maxLength={2000}
                  rows={3}
                  required
                />
              </div>
            </>
          )}
          {(validation || error) && (
            <div
              role="alert"
              className="finance-danger flex items-start gap-2 rounded-lg border p-3 text-sm"
            >
              <AlertCircle className="size-4 shrink-0" />
              {validation || error}
            </div>
          )}
          <div>
            {unknownOutcome && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  checkOutcome();
                  onClose();
                }}
              >
                Check request status
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => (review ? setReview(false) : onClose())}
            >
              {review ? 'Back to details' : 'Cancel'}
            </Button>
            <Button type="submit" className="finance-primary" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Submitting…
                </>
              ) : review ? (
                'Confirm dispute'
              ) : (
                'Review dispute'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
