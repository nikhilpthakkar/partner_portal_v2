'use client';

import { type DragEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  getPolicyBulkUploadFileTooLargeDescription,
  POLICY_BULK_UPLOAD_CARD_COPY,
} from '@/lib/constants/policy.constants';
import type { PolicyBulkUploadPanelPhase, UploadState } from '@/lib/types/policy-management';
import { cn, formatFileSizeMb } from '@/lib/utils';
import { PolicyBulkUploadSummary } from '../molecules/PolicyBulkUploadSummary';
import { CircleCheckBig, Inbox, TriangleAlert } from 'lucide-react';

type OptionalFileInputLabelProps = {
  fileInputId?: string;
  children: ReactNode;
};

function OptionalFileInputLabel({ fileInputId, children }: OptionalFileInputLabelProps) {
  const className = cn('flex flex-col items-center gap-6', fileInputId && 'cursor-pointer');
  if (fileInputId) {
    return (
      <label htmlFor={fileInputId} className={className}>
        {children}
      </label>
    );
  }
  return <div className={className}>{children}</div>;
}

export type PolicyBulkUploadStatePanelProps = {
  idlePresentation: UploadState;
  panelPhase: PolicyBulkUploadPanelPhase;
  fileInputId?: string;
  onDropFile?: (file: File) => void;
  onUploadFile?: (file: File) => void;
  onDownloadTemplate?: () => void;
  isBusy?: boolean;
};

export default function PolicyBulkUploadStatePanel({
  idlePresentation,
  panelPhase,
  fileInputId,
  onDropFile,
  onUploadFile,
  onDownloadTemplate,
  isBusy = false,
}: PolicyBulkUploadStatePanelProps) {
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!onDropFile || isBusy) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!onDropFile || isBusy) {
      return;
    }
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onDropFile(file);
    }
  };

  const idleBody = (
    <>
      <div
        className={cn(
          'rounded-policy-bulk-upload-icon border border-policy-bulk-upload-border bg-policy-bulk-upload-icon-bg shadow-policy-bulk-upload-icon flex h-12 w-12 items-center justify-center',
          idlePresentation.iconWrapperClassName,
        )}
      >
        {idlePresentation.icon}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-policy-bulk-upload-title text-xl font-semibold leading-7">
          {idlePresentation.title}
        </p>
        <p className="text-policy-bulk-upload-muted text-sm leading-5">
          {idlePresentation.description}
        </p>
      </div>
    </>
  );

  const renderPanelBody = (): ReactNode => {
    switch (panelPhase.type) {
      case 'staged':
        return (
          <PolicyBulkUploadSummary
            icon={<CircleCheckBig className="size-6 text-policy-bulk-upload-file-success-icon" />}
            title={panelPhase.file.name}
            type="success"
          />
        );
      case 'unsupported_format':
        return (
          <OptionalFileInputLabel fileInputId={fileInputId}>
            <PolicyBulkUploadSummary
              icon={<TriangleAlert className="h-6 w-6 text-policy-bulk-upload-file-error-icon" />}
              title={POLICY_BULK_UPLOAD_CARD_COPY.unsupportedFileFormatTitle}
              description={POLICY_BULK_UPLOAD_CARD_COPY.unsupportedFileFormatDescription}
              type="error"
            />
          </OptionalFileInputLabel>
        );
      case 'oversized':
        return (
          <OptionalFileInputLabel fileInputId={fileInputId}>
            <PolicyBulkUploadSummary
              icon={<Inbox className="h-6 w-6 text-policy-bulk-upload-file-error-icon" />}
              title={POLICY_BULK_UPLOAD_CARD_COPY.fileTooLargeTitle}
              description={getPolicyBulkUploadFileTooLargeDescription(
                formatFileSizeMb(panelPhase.attemptedBytes),
              )}
              type="error"
            />
          </OptionalFileInputLabel>
        );
      case 'empty':
        return (
          <OptionalFileInputLabel fileInputId={fileInputId}>
            <PolicyBulkUploadSummary
              icon={<Inbox className="h-6 w-6 text-policy-bulk-upload-file-error-icon" />}
              title={POLICY_BULK_UPLOAD_CARD_COPY.emptyFileTitle}
              description={POLICY_BULK_UPLOAD_CARD_COPY.emptyFileDescription}
              type="error"
            />
          </OptionalFileInputLabel>
        );
      case 'idle':
        return (
          <OptionalFileInputLabel fileInputId={fileInputId}>{idleBody}</OptionalFileInputLabel>
        );
    }
  };

  const isStaged = panelPhase.type === 'staged';
  const downloadEnabled = Boolean(onDownloadTemplate) && !isBusy;
  const showUploadFile = isStaged && Boolean(onUploadFile);

  return (
    <div
      className={cn(
        'rounded-policy-bulk-upload-state border-policy-bulk-upload-border flex flex-col items-center gap-6 border border-dashed p-6 text-center',
        onDropFile && !isBusy && 'cursor-pointer',
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {renderPanelBody()}
      <div className="flex w-full flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={!downloadEnabled}
          onClick={() => {
            onDownloadTemplate?.();
          }}
          className={cn(
            'text-policy-bulk-upload-text border-policy-bulk-upload-border bg-policy-bulk-upload-panel-bg h-9 text-sm font-medium',
          )}
        >
          {POLICY_BULK_UPLOAD_CARD_COPY.downloadTemplate}
        </Button>
        {idlePresentation.primaryAction ? (
          <Button
            type="button"
            variant={showUploadFile ? 'outline' : 'default'}
            onClick={idlePresentation.primaryAction.onClick}
            disabled={isBusy}
            className={cn(
              'h-9 text-sm font-medium',
              showUploadFile
                ? 'text-policy-bulk-upload-text border-policy-bulk-upload-border bg-policy-bulk-upload-panel-bg'
                : 'bg-policy-bulk-upload-primary text-policy-bulk-upload-primary-text hover:bg-policy-bulk-upload-primary-hover',
            )}
          >
            {isStaged
              ? POLICY_BULK_UPLOAD_CARD_COPY.replaceFile
              : POLICY_BULK_UPLOAD_CARD_COPY.selectFile}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
