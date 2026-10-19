'use client';

import { X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UploadToastStatus = 'PENDING' | 'SUCCESS' | 'ERROR' | 'PARTIAL';

type UploadToastAction = {
  label: string;
  onClick: () => void;
};

type UploadToastOptions = {
  title: string;
  message: string;
  status: UploadToastStatus;
  primaryAction?: UploadToastAction;
  secondaryAction?: UploadToastAction;
};

type UploadToastContentProps = UploadToastOptions & {
  onClose: () => void;
};

const statusStyles: Record<UploadToastStatus, string> = {
  PENDING: 'bg-upload-toast-pending',
  SUCCESS: 'bg-upload-toast-success',
  ERROR: 'bg-upload-toast-error',
  PARTIAL: 'bg-upload-toast-partial',
};

function UploadToastContent({
  title,
  message,
  status,
  primaryAction,
  secondaryAction,
  onClose,
}: UploadToastContentProps) {
  return (
    <div
      className={cn(
        'relative flex w-xl flex-col gap-2 rounded-md border border-upload-toast-border px-4 py-4 pr-10 shadow-upload-toast',
        statusStyles[status],
      )}
    >
      <div className="text-upload-toast-text flex flex-col gap-1 text-sm leading-5">
        <p className="font-semibold">{title}</p>
        <p className="text-upload-toast-text-muted whitespace-pre-line">{message}</p>
      </div>
      {primaryAction || secondaryAction ? (
        <div className="flex items-center gap-2">
          {primaryAction ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={primaryAction.onClick}
              className="border-upload-toast-button-border text-upload-toast-button-text shadow-upload-toast-button h-8 bg-upload-toast-button-bg text-xs font-medium"
            >
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={secondaryAction.onClick}
              className="text-upload-toast-button-text h-8 text-xs font-medium"
            >
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onClose}
        className={cn(
          'rounded-upload-toast-close text-upload-toast-close absolute right-3 top-3 flex h-4 w-4 items-center justify-center hover:text-upload-toast-close-hover',
        )}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function showUploadToast(options: UploadToastOptions) {
  toast.custom((id) => (
    <UploadToastContent
      title={options.title}
      message={options.message}
      status={options.status}
      primaryAction={options.primaryAction}
      secondaryAction={options.secondaryAction}
      onClose={() => toast.dismiss(id)}
    />
  ));
}
