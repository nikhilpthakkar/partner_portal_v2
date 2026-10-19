import type { ReactNode } from 'react';

export function PolicyBulkUploadSummary({
  icon,
  title,
  description,
  type,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  type: 'error' | 'success' | 'warning';
}) {
  const summaryTypeClass = {
    error: 'border-policy-bulk-upload-file-error-icon',
    success: 'border-policy-bulk-upload-file-success-icon',
    warning: 'border-policy-bulk-upload-file-warning-icon',
  };
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div
        className={`${summaryTypeClass[type]} rounded-policy-bulk-upload-icon bg-policy-bulk-upload-file-error-border bg-policy-bulk-upload-icon-bg shadow-policy-bulk-upload-icon flex h-12 w-12 items-center justify-center border`}
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-policy-bulk-upload-title text-xl font-semibold leading-7">{title}</p>
        {description ? (
          <p className="text-policy-bulk-upload-muted text-sm leading-5">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
