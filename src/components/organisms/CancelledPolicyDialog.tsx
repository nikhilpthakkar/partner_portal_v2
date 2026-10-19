'use client';

import { TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CANCELLED_POLICY_DIALOG } from '@/lib/constants/cancelledPolicy.constants';

export type CancelledPolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSharePolicy: () => void;
  onSeePolicyDetails: () => void;
};

export default function CancelledPolicyDialog({
  open,
  onOpenChange,
  onSharePolicy,
  onSeePolicyDetails,
}: CancelledPolicyDialogProps) {
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
            {CANCELLED_POLICY_DIALOG.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-5 text-muted-foreground">
            {CANCELLED_POLICY_DIALOG.descriptionLine1}
            <br />
            {CANCELLED_POLICY_DIALOG.descriptionLine2}
          </DialogDescription>
        </div>
        <div className="flex w-full gap-2 pt-3.5">
          <Button
            type="button"
            variant="outline"
            className="h-9 flex-1 rounded-md px-4 text-sm font-medium shadow-xs"
            onClick={onSharePolicy}
          >
            {CANCELLED_POLICY_DIALOG.sharePolicyLabel}
          </Button>
          <Button
            type="button"
            className="h-9 flex-1 rounded-md bg-create-claim-button px-4 text-sm font-medium text-create-claim-button-text shadow-xs hover:bg-create-claim-button-hover"
            onClick={onSeePolicyDetails}
          >
            {CANCELLED_POLICY_DIALOG.seePolicyDetailsLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
