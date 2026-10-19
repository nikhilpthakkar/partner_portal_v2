import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type BankDetailsFailureDialogProps = {
  open: boolean;
  message: string;
  skipPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSkip: () => void;
};

export function BankDetailsFailureDialog({
  open,
  message,
  skipPending,
  onOpenChange,
  onSkip,
}: BankDetailsFailureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-md gap-6 border-pagination-border sm:max-w-lg sm:rounded-xl"
      >
        <DialogHeader className="space-y-1.5 text-left sm:pr-10">
          <DialogTitle className="text-lg font-semibold leading-none text-pagination-text">
            Bank details could not be saved
          </DialogTitle>
          <DialogDescription className="text-sm leading-normal text-pagination-text-muted">
            {message ||
              'Something went wrong while saving bank details. You can fix the fields and try again, or skip this step.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="h-10 rounded-lg border-pagination-border bg-white px-5 text-sm font-medium text-pagination-text shadow-xs"
            onClick={() => onOpenChange(false)}
          >
            Update details
          </Button>
          <Button
            type="button"
            disabled={skipPending}
            onClick={onSkip}
            className="h-10 rounded-lg bg-create-claim-button px-5 text-sm font-medium text-create-claim-button-text shadow-xs hover:bg-create-claim-button-hover disabled:opacity-60"
          >
            {skipPending ? 'Skipping…' : 'Skip this step'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
