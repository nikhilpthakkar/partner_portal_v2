'use client';

import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Inbox, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import PolicyBulkActionTypeSelect from '@/components/molecules/PolicyBulkActionTypeSelect';
import PolicyBulkUploadStatePanel from '@/components/organisms/PolicyBulkUploadStatePanel';
import { Card } from '@/components/ui/card';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { usePartnerStore } from '@/lib/store/partner.store';
import {
  POLICY_BULK_UPLOAD_CARD_COPY,
  POLICY_BULK_UPLOAD_MAX_FILE_BYTES,
} from '@/lib/constants/policy.constants';
import {
  BULK_ACTION_LIST_QUERY_KEY,
  BULK_ACTION_STATUS_SUMMARY_QUERY_KEY,
} from '@/lib/query/policyBulkOperations.queries';
import { useBulkUploadEndorsementTypeApplicableQuery } from '@/lib/query/policyManagement.queries';
import type { PolicyBulkUploadPanelPhase, UploadState } from '@/lib/types/policy-management';
import type { PolicyBulkUploadEndorsementTypeApplicableResponse } from '@/lib/types/policy-management/policyBulkUploadEndorsementApi';
import {
  confirmBulkUpload,
  fetchBulkUploadPresignedUrl,
  fetchBulkUploadTemplate,
  uploadBulkFileToPresignedUrl,
} from '@/lib/services/policy-management/api';
import type { SelectOptionGroup } from '@/lib/types/Global';
import { cn, getPolicyBulkUploadCommitResult } from '@/lib/utils';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackBulkUploadActionTypeSelect,
  trackBulkUploadCloseDialog,
  trackBulkUploadDialogView,
  trackBulkUploadDownloadTemplate,
  trackBulkUploadStageFile,
  trackBulkUploadSubmit,
  trackBulkUploadSubmitError,
} from '@/lib/segment/track/policy';

const DEFAULT_FILE_ACCEPT = ['.csv'];

const INITIAL_PANEL_PHASE: PolicyBulkUploadPanelPhase = { type: 'idle' };

const CSV_FILE_CONTENT_TYPE = 'text/csv';
const XLSX_FILE_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const resolveFileContentType = (file: File): string => {
  if (file.type) {
    return file.type;
  }
  if (file.name.toLowerCase().endsWith('.csv')) {
    return CSV_FILE_CONTENT_TYPE;
  }
  if (file.name.toLowerCase().endsWith('.xlsx')) {
    return XLSX_FILE_CONTENT_TYPE;
  }
  return 'application/octet-stream';
};

const toPascalCase = (value: string): string => {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

const getBulkActionRequestValue = (actionTypeValue: string): string => {
  if (actionTypeValue.startsWith('endorsement-')) {
    return toPascalCase(actionTypeValue.replace('endorsement-', ''));
  }
  return toPascalCase(actionTypeValue);
};

const mapEndorsementsToOptions = (
  endorsements:
    | PolicyBulkUploadEndorsementTypeApplicableResponse['data']['endorsements']
    | undefined,
) => {
  if (!endorsements) {
    return [];
  }
  const financialEndorsements = endorsements.FINANCIAL || [];
  const nonFinancialEndorsements = endorsements.NON_FINANCIAL || [];
  const merged = [...financialEndorsements, ...nonFinancialEndorsements];

  return merged
    .filter((item) => item.applicable)
    .map((item) => {
      const value = item.endorsementType;
      const label = value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (str) => str.toUpperCase());

      return { value, label };
    })
    .filter((option, index, self) => index === self.findIndex((o) => o.value === option.value));
};

type PolicyBulkUploadCardProps = {
  fileInputAccept?: string[];
  dialogOpen?: boolean;
  onClose?: () => void;
  className?: string;
};

export default function PolicyBulkUploadCard({
  fileInputAccept = DEFAULT_FILE_ACCEPT,
  dialogOpen = true,
  onClose,
  className,
}: PolicyBulkUploadCardProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const [panelPhase, setPanelPhase] = useState<PolicyBulkUploadPanelPhase>(INITIAL_PANEL_PHASE);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const [bulkActionTypeError, setBulkActionTypeError] = useState('');
  const [bulkActionTypeOptions, setBulkActionTypeOptions] = useState<SelectOptionGroup[]>([]);
  const [isTemplateDownloading, setIsTemplateDownloading] = useState(false);
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();
  const segmentBase = useSegmentPartnerBase();
  const segmentBaseRef = useRef(segmentBase);
  segmentBaseRef.current = segmentBase;

  useEffect(() => {
    if (dialogOpen) {
      trackBulkUploadDialogView(segmentBaseRef.current);
    }
  }, [dialogOpen]);

  const { data: endorsementTypeApplicableData } = useBulkUploadEndorsementTypeApplicableQuery();
  const policyCategory = endorsementTypeApplicableData?.data?.category ?? '';

  useEffect(() => {
    if (endorsementTypeApplicableData?.data?.endorsements) {
      const endorsementOptions = mapEndorsementsToOptions(
        endorsementTypeApplicableData.data.endorsements,
      );
      setBulkActionTypeOptions([
        {
          groupLabel: 'Endorsements',
          options: endorsementOptions,
        },
        {
          groupLabel: 'Issuance',
          options: [{ value: 'issuance', label: 'Issuance' }],
        },
      ]);
    }
  }, [endorsementTypeApplicableData]);

  const bulkUploadIdleState: UploadState = useMemo(
    () => ({
      id: 'bulk-upload-idle',
      title: POLICY_BULK_UPLOAD_CARD_COPY.idleTitle,
      description: POLICY_BULK_UPLOAD_CARD_COPY.idleDescription,
      icon: <Inbox className="h-6 w-6" aria-hidden />,
    }),
    [],
  );

  const handleActionTypeChange = (value: string) => {
    setBulkActionType(value);
    if (value) {
      trackBulkUploadActionTypeSelect(segmentBaseRef.current, value);
    }
    if (bulkActionTypeError) {
      setBulkActionTypeError('');
    }
  };

  const handleBulkFileSelected = (file: File) => {
    toast.warning(`Your file ${file.name} is being processed. This may take some time.`);
    void queryClient.invalidateQueries({ queryKey: BULK_ACTION_LIST_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: BULK_ACTION_STATUS_SUMMARY_QUERY_KEY });
    setBulkActionType('');
    setBulkActionTypeError('');
    onClose?.();
  };

  const handleDownloadTemplate = async () => {
    if (!bulkActionType) {
      setBulkActionTypeError('Please select an action type.');
      return;
    }

    if (!isReady || productIds.length === 0 || !policyCategory) {
      toast.error('Invalid partner configuration. Please try again.');
      return;
    }

    setIsTemplateDownloading(true);
    try {
      const { data, fileName } = await fetchBulkUploadTemplate({
        partnerId,
        lob,
        productIds,
        type: bulkActionType,
        category: policyCategory,
      });
      const templateUrl = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = templateUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(templateUrl);
      trackBulkUploadDownloadTemplate(segmentBaseRef.current, { action_type: bulkActionType });
    } catch {
      toast.error('Unable to download template. Please try again.');
    } finally {
      setIsTemplateDownloading(false);
    }
  };

  const handleDialogClose = () => {
    trackBulkUploadCloseDialog(segmentBaseRef.current);
    setBulkActionType('');
    setBulkActionTypeError('');
    onClose?.();
  };

  useEffect(() => {
    if (!dialogOpen) {
      setPanelPhase(INITIAL_PANEL_PHASE);
    }
  }, [dialogOpen]);

  const commitFile = (file: File) => {
    const result = getPolicyBulkUploadCommitResult(
      file,
      fileInputAccept,
      POLICY_BULK_UPLOAD_MAX_FILE_BYTES,
    );
    switch (result.kind) {
      case 'unsupported_format':
        setPanelPhase({ type: 'unsupported_format' });
        return;
      case 'empty_file':
        setPanelPhase({ type: 'empty' });
        return;
      case 'oversized':
        setPanelPhase({ type: 'oversized', attemptedBytes: result.bytes });
        return;
      case 'ready':
        trackBulkUploadStageFile(segmentBaseRef.current, { file_name: result.file.name });
        setPanelPhase({ type: 'staged', file: result.file });
        return;
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      commitFile(file);
    }
    event.target.value = '';
  };

  const idlePresentation: UploadState = useMemo(() => {
    const triggerPick = () => fileInputRef.current?.click();
    const primaryAction = bulkUploadIdleState.primaryAction
      ? { ...bulkUploadIdleState.primaryAction, onClick: triggerPick }
      : { label: POLICY_BULK_UPLOAD_CARD_COPY.selectFile, onClick: triggerPick };
    return { ...bulkUploadIdleState, primaryAction };
  }, [bulkUploadIdleState]);

  const handleDropFile = (file: File) => {
    commitFile(file);
  };

  const showFilePickerTarget = Boolean(panelPhase.type !== 'staged' && !isUploading);
  const acceptAttr = fileInputAccept.join(',');
  const isStaged = panelPhase.type === 'staged';
  const showUploadFile = isStaged;

  const handleConfirmUpload = async () => {
    if (panelPhase.type !== 'staged') {
      return;
    }
    if (!isReady || productIds.length === 0) {
      toast.error('Invalid partner configuration. Please try again.');
      return;
    }
    if (!bulkActionType) {
      setBulkActionTypeError('Please select an action type.');
      return;
    }

    const file = panelPhase.file;
    const contentType = resolveFileContentType(file);
    const requestAction = getBulkActionRequestValue(bulkActionType);
    const planId = productIds[0];

    setIsUploading(true);
    try {
      const presignedUrlResponse = await fetchBulkUploadPresignedUrl({
        partnerId,
        lob,
        productIds,
        planId,
        action: requestAction,
        contentType,
        filename: file.name,
        contentLength: String(file.size),
      });

      await uploadBulkFileToPresignedUrl({
        url: presignedUrlResponse.url,
        file,
        contentType,
      });

      await confirmBulkUpload({
        partnerId,
        lob,
        productIds,
        planId,
        fileId: String(presignedUrlResponse.file_id),
        action: requestAction,
        status: 'upload_successful',
      });

      trackBulkUploadSubmit(segmentBaseRef.current, {
        action_type: bulkActionType,
        file_name: file.name,
      });

      handleBulkFileSelected(file);
    } catch {
      trackBulkUploadSubmitError(segmentBaseRef.current, {
        exception_type: 'upload_bulk_file',
        exception_message: 'Unable to upload file. Please try again.',
        action_type: bulkActionType,
        file_name: file.name,
        entity_name: bulkActionType,
        value: file.name,
      });
      toast.error('Unable to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card
      className={cn(
        'border-policy-bulk-upload-border rounded-policy-bulk-upload-card bg-policy-bulk-upload-card-bg relative flex flex-col gap-6 border shadow-policy-bulk-upload-card',
        className,
      )}
    >
      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        className="sr-only"
        accept={acceptAttr}
        tabIndex={-1}
        onChange={handleFileInputChange}
      />
      <div className="px-6">
        <p className="text-policy-bulk-upload-title text-xl font-semibold leading-7">
          {POLICY_BULK_UPLOAD_CARD_COPY.title}
        </p>
      </div>
      <div className="relative flex flex-col gap-4 px-6 items-end">
        <div className="flex w-full items-start justify-between gap-6">
          <div className="max-w-policy-bulk-upload-max-width flex w-full flex-col gap-2">
            <p className="text-policy-bulk-upload-text text-sm font-medium leading-none">
              {POLICY_BULK_UPLOAD_CARD_COPY.actionTypeLabel}
            </p>
            <PolicyBulkActionTypeSelect
              value={bulkActionType}
              groups={bulkActionTypeOptions}
              variant="cascade"
              onValueChange={handleActionTypeChange}
              placeholder="Select action type"
              disabled={isUploading}
              className={cn(bulkActionTypeError && 'border-destructive')}
            />
            {bulkActionTypeError ? (
              <p className="text-destructive text-xs leading-none">{bulkActionTypeError}</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-policy-bulk-upload-panel border-policy-bulk-upload-border bg-policy-bulk-upload-panel-bg border p-4 w-full">
          <PolicyBulkUploadStatePanel
            idlePresentation={idlePresentation}
            panelPhase={panelPhase}
            fileInputId={showFilePickerTarget ? fileInputId : undefined}
            onDropFile={!isUploading ? handleDropFile : undefined}
            onUploadFile={handleBulkFileSelected}
            onDownloadTemplate={
              isUploading || isTemplateDownloading ? undefined : handleDownloadTemplate
            }
            isBusy={isUploading}
          />
        </div>
        {showUploadFile ? (
          <Button
            type="button"
            variant="default"
            onClick={handleConfirmUpload}
            disabled={isUploading}
            className="bg-policy-bulk-upload-primary text-policy-bulk-upload-primary-text h-9 text-sm font-medium hover:bg-policy-bulk-upload-primary-hover w-policy-bulk-upload-button-width"
          >
            {isUploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              </span>
            ) : (
              POLICY_BULK_UPLOAD_CARD_COPY.uploadFile
            )}
          </Button>
        ) : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={() => {
            if (!isUploading) {
              handleDialogClose();
            }
          }}
          disabled={isUploading}
          className="cursor-pointer rounded-policy-bulk-upload-close text-policy-bulk-upload-close absolute right-6 top-6 flex h-4 w-4 items-center justify-center hover:text-policy-bulk-upload-close-hover"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </Card>
  );
}
