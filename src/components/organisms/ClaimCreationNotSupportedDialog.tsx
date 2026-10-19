'use client';

import { TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CLAIM_CREATION_NOT_SUPPORTED_DIALOG } from '@/lib/constants/claimCreationNotSupported.constants';

export type ClaimCreationNotSupportedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactSupport: () => void;
};

export default function ClaimCreationNotSupportedDialog({
  open,
  onOpenChange,
  onContactSupport,
}: ClaimCreationNotSupportedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-md gap-6 border-border p-6 shadow-lg sm:max-w-lg sm:rounded-xl"
      >
        <div className="flex flex-col items-center gap-2 text-center sm:pr-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-red-700 bg-card shadow-xs">
            <TriangleAlert className="size-6 text-red-700" aria-hidden />
          </div>
          <DialogTitle className="text-lg font-semibold leading-7 text-foreground">
            {CLAIM_CREATION_NOT_SUPPORTED_DIALOG.title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm leading-5 text-muted-foreground">
            {CLAIM_CREATION_NOT_SUPPORTED_DIALOG.descriptionLine1}
            <br />
            {CLAIM_CREATION_NOT_SUPPORTED_DIALOG.descriptionLine2Prefix}{' '}
            <span className="font-medium text-foreground">
              {CLAIM_CREATION_NOT_SUPPORTED_DIALOG.claimApiSuiteLabel}
            </span>{' '}
            {CLAIM_CREATION_NOT_SUPPORTED_DIALOG.descriptionLine2Middle}{' '}
            <span className="font-medium text-foreground">
              {CLAIM_CREATION_NOT_SUPPORTED_DIALOG.kamLabel}
            </span>{' '}
            {CLAIM_CREATION_NOT_SUPPORTED_DIALOG.descriptionLine2Suffix}
          </DialogDescription>
        </div>
        <div className="flex w-full gap-2 pt-3.5">
          <Button
            type="button"
            variant="outline"
            className="h-9 flex-1 rounded-md px-4 text-sm font-medium shadow-xs"
            onClick={() => onOpenChange(false)}
          >
            {CLAIM_CREATION_NOT_SUPPORTED_DIALOG.closeLabel}
          </Button>
          <Button
            type="button"
            className="h-9 flex-1 rounded-md bg-create-claim-button px-4 text-sm font-medium text-create-claim-button-text shadow-xs hover:bg-create-claim-button-hover"
            onClick={onContactSupport}
          >
            {CLAIM_CREATION_NOT_SUPPORTED_DIALOG.contactSupportLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
