'use client';

import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from 'sonner';
import { CreateClaimFlowStepId } from '@/lib/constants/createClaim.constants';
import {
  useDeathClaimRequiredDocumentsQuery,
  useSubmitDeathClaimDocumentsMutation,
} from '@/lib/query/createDeathClaim.queries';
import { usePolicyEndorsementDocumentUploadMutation } from '@/lib/query/policyDetails.queries';
import type { SubmitDeathClaimDocumentItem } from '@/lib/types/claims-management/deathClaimApi';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import {
  mapDeathClaimRequiredDocumentsToUploadSlots,
  mapLegacyCreateClaimUploadSlotsToUploadSlots,
} from '@/lib/utils/createClaimDocumentUploadSlots';
import { readPartnerPortalApiErrorMessage } from '@/lib/utils/createClaim';
import { isDocumentUploadAllowed } from '@/lib/utils/documentUpload';
import type { CreateClaimUrlState } from './useCreateClaimUrlState';

export type UseDeathClaimDocumentsOptions = {
  isAccidentalDeathClaim: boolean;
  selectedClaimTypeId: string | null;
  selectedPolicy: RecentSearchPolicy | null;
  setWizardStep: (step: CreateClaimFlowStepId) => void;
  url: CreateClaimUrlState;
  wizardStep: CreateClaimFlowStepId;
};

export function useDeathClaimDocuments({
  isAccidentalDeathClaim,
  selectedClaimTypeId,
  selectedPolicy,
  setWizardStep,
  url,
  wizardStep,
}: UseDeathClaimDocumentsOptions) {
  const [uploadSlotFiles, setUploadSlotFiles] = useState<Partial<Record<string, File[]>>>({});
  const uploadSlotFilesRef = useRef(uploadSlotFiles);
  const [deathClaimDocUploadMeta, setDeathClaimDocUploadMeta] = useState<
    Partial<Record<string, SubmitDeathClaimDocumentItem[]>>
  >({});
  const [deathClaimDocUploadClaimRequestNumbers, setDeathClaimDocUploadClaimRequestNumbers] =
    useState<Partial<Record<string, string[]>>>({});
  const [deathClaimUploadingSlotId, setDeathClaimUploadingSlotId] = useState<string | null>(null);
  const [deathClaimDocumentsSubmitted, setDeathClaimDocumentsSubmitted] = useState(false);
  const [
    deathClaimDocumentsSubmittedClaimRequestNumber,
    setDeathClaimDocumentsSubmittedClaimRequestNumber,
  ] = useState('');

  const uploadInputsRef = useRef<Partial<Record<string, HTMLInputElement | null>>>({});
  const slotTaskChainRef = useRef<Partial<Record<string, Promise<void>>>>({});
  const uploadPartnerDocumentMutation = usePolicyEndorsementDocumentUploadMutation();
  const submitDeathClaimDocumentsMutation = useSubmitDeathClaimDocumentsMutation();
  const isUploadDocumentsStep = wizardStep === CreateClaimFlowStepId.UploadRequiredDocuments;

  const deathClaimRequiredDocsQuery = useDeathClaimRequiredDocumentsQuery({
    coverId: selectedClaimTypeId ?? '',
    enabled: isUploadDocumentsStep && isAccidentalDeathClaim,
  });

  const uploadDocumentSlots = useMemo(() => {
    if (!isUploadDocumentsStep) return [];
    if (!isAccidentalDeathClaim) {
      return mapLegacyCreateClaimUploadSlotsToUploadSlots();
    }
    if (!deathClaimRequiredDocsQuery.isSuccess) return [];
    const docs = deathClaimRequiredDocsQuery.data.data.documentTypes;
    if (!docs?.length) return [];
    return mapDeathClaimRequiredDocumentsToUploadSlots(docs);
  }, [
    isUploadDocumentsStep,
    isAccidentalDeathClaim,
    deathClaimRequiredDocsQuery.isSuccess,
    deathClaimRequiredDocsQuery.data,
  ]);

  const commitSlotFiles = (next: Partial<Record<string, File[]>>) => {
    uploadSlotFilesRef.current = next;
    setUploadSlotFiles(next);
  };

  const resetDocuments = () => {
    uploadSlotFilesRef.current = {};
    slotTaskChainRef.current = {};
    setUploadSlotFiles({});
    setDeathClaimDocUploadMeta({});
    setDeathClaimDocUploadClaimRequestNumbers({});
    setDeathClaimUploadingSlotId(null);
    setDeathClaimDocumentsSubmitted(false);
    setDeathClaimDocumentsSubmittedClaimRequestNumber('');
  };

  const buildUploadedDocumentMeta = (
    slotId: string,
    file: File,
    response: { id: string; name: string; url: string; page_id: string },
  ): SubmitDeathClaimDocumentItem => {
    const docTypes = deathClaimRequiredDocsQuery.data?.data.documentTypes;
    const docRow = docTypes?.find((document) => document.type === slotId);
    return {
      document_id: response.id,
      type: slotId,
      name: docRow?.name ?? response.name ?? slotId,
      url: response.url,
      filename: file.name,
      page_id: response.page_id,
    };
  };

  const uploadDeathClaimDocument = async (
    slotId: string,
    file: File,
    claimRef: string,
    fileIndex: number,
  ): Promise<SubmitDeathClaimDocumentItem> => {
    setDeathClaimUploadingSlotId(slotId);
    const response = await uploadPartnerDocumentMutation.mutateAsync({
      payload: {
        requestContext: 'CLAIM',
        documentType: slotId,
        referenceId: claimRef,
        document: file,
      },
    });
    const uploadedMeta = buildUploadedDocumentMeta(slotId, file, response);
    setDeathClaimDocUploadMeta((prev) => ({
      ...prev,
      [slotId]: Object.assign([...(prev[slotId] ?? [])], { [fileIndex]: uploadedMeta }),
    }));
    setDeathClaimDocUploadClaimRequestNumbers((prev) => ({
      ...prev,
      [slotId]: Object.assign([...(prev[slotId] ?? [])], { [fileIndex]: claimRef }),
    }));
    setDeathClaimUploadingSlotId((current) => (current === slotId ? null : current));
    return uploadedMeta;
  };

  const handleUploadSlotFile = (slotId: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const input = event.target;
    if (!file) return;

    const previous = slotTaskChainRef.current[slotId] ?? Promise.resolve();
    slotTaskChainRef.current[slotId] = previous
      .catch(() => undefined)
      .then(async () => {
        setDeathClaimUploadingSlotId(slotId);
        try {
          if (!(await isDocumentUploadAllowed(file, input))) return;
          input.value = '';

          const current = uploadSlotFilesRef.current[slotId] ?? [];
          const fileIndex = current.length;
          commitSlotFiles({ ...uploadSlotFilesRef.current, [slotId]: [...current, file] });

          const shouldUploadViaDocumentApi =
            wizardStep === CreateClaimFlowStepId.UploadRequiredDocuments &&
            isAccidentalDeathClaim &&
            url.urlClaimRequestNumber.trim() !== '';

          if (!shouldUploadViaDocumentApi) {
            return;
          }

          const claimRef = url.urlClaimRequestNumber.trim();
          setDeathClaimDocumentsSubmitted(false);
          setDeathClaimDocumentsSubmittedClaimRequestNumber('');
          try {
            await uploadDeathClaimDocument(slotId, file, claimRef, fileIndex);
          } catch (error) {
            const nextFiles = [...(uploadSlotFilesRef.current[slotId] ?? [])];
            nextFiles.splice(fileIndex, 1);
            commitSlotFiles({ ...uploadSlotFilesRef.current, [slotId]: nextFiles });
            toast.error(readPartnerPortalApiErrorMessage(error, 'Unable to upload document'));
          }
        } finally {
          setDeathClaimUploadingSlotId((current) => (current === slotId ? null : current));
        }
      });
  };

  const handleContinueToVerification = async () => {
    if (!selectedPolicy || !selectedClaimTypeId) return;
    const claimRequestNumber = url.urlClaimRequestNumber.trim();
    const documentsSubmittedForCurrentClaim =
      deathClaimDocumentsSubmitted &&
      deathClaimDocumentsSubmittedClaimRequestNumber === claimRequestNumber;

    if (isAccidentalDeathClaim && documentsSubmittedForCurrentClaim) {
      url.replacePostClaimTypeStep(
        selectedPolicy.policyNumber,
        selectedClaimTypeId,
        CreateClaimFlowStepId.BankVerification,
      );
      setWizardStep(CreateClaimFlowStepId.BankVerification);
      return;
    }

    if (
      isAccidentalDeathClaim &&
      (deathClaimRequiredDocsQuery.isPending || deathClaimRequiredDocsQuery.isError)
    ) {
      return;
    }
    if (isAccidentalDeathClaim && deathClaimRequiredDocsQuery.isSuccess) {
      const docs = deathClaimRequiredDocsQuery.data.data.documentTypes;
      if (docs?.length) {
        let nextDocUploadMeta = deathClaimDocUploadMeta;

        if (!claimRequestNumber) {
          toast.error('Missing claim request number. Please continue from claim details again.');
          return;
        }

        try {
          const uploadedMetaForCurrentClaim: Partial<
            Record<string, SubmitDeathClaimDocumentItem[]>
          > = {
            ...Object.fromEntries(
              Object.entries(nextDocUploadMeta).map(([slotId, items]) => [
                slotId,
                [...(items ?? [])],
              ]),
            ),
          };
          let uploadedAnyDocument = false;

          for (const [slotId, files] of Object.entries(uploadSlotFiles)) {
            if (!files?.length) continue;

            for (const [fileIndex, file] of files.entries()) {
              const slotUploadedForCurrentClaim =
                deathClaimDocUploadClaimRequestNumbers[slotId]?.[fileIndex] ===
                  claimRequestNumber && uploadedMetaForCurrentClaim[slotId]?.[fileIndex];
              if (slotUploadedForCurrentClaim) {
                continue;
              }

              const uploadedMeta = await uploadDeathClaimDocument(
                slotId,
                file,
                claimRequestNumber,
                fileIndex,
              );
              uploadedMetaForCurrentClaim[slotId] = Object.assign(
                [...(uploadedMetaForCurrentClaim[slotId] ?? [])],
                { [fileIndex]: uploadedMeta },
              );
              uploadedAnyDocument = true;
            }
          }

          if (uploadedAnyDocument) {
            nextDocUploadMeta = uploadedMetaForCurrentClaim;
            setDeathClaimDocUploadMeta(nextDocUploadMeta);
          }
        } catch (error) {
          setDeathClaimUploadingSlotId(null);
          toast.error(readPartnerPortalApiErrorMessage(error, 'Unable to upload documents'));
          return;
        }

        const missingRequired = docs.filter(
          (document) => document.required && !nextDocUploadMeta[document.type]?.length,
        );
        if (missingRequired.length > 0) {
          toast.error('Please upload all required documents');
          return;
        }
        const machineInstanceId = url.urlMachineInstanceId.trim();
        if (!machineInstanceId) {
          toast.error('Missing claim session. Please continue from claim details again.');
          return;
        }
        const payload: SubmitDeathClaimDocumentItem[] = Object.values(nextDocUploadMeta)
          .flat()
          .filter((item): item is SubmitDeathClaimDocumentItem => Boolean(item));
        if (payload.length === 0) {
          toast.error('Please upload the required documents');
          return;
        }
        try {
          const response = await submitDeathClaimDocumentsMutation.mutateAsync({
            machineInstanceId,
            payload,
          });
          if (!response.success) {
            toast.error(response.message || 'Unable to submit documents');
            return;
          }
          setDeathClaimDocumentsSubmitted(true);
          setDeathClaimDocumentsSubmittedClaimRequestNumber(claimRequestNumber);
        } catch (error) {
          toast.error(readPartnerPortalApiErrorMessage(error, 'Unable to submit documents'));
          return;
        }
      }
    }
    url.replacePostClaimTypeStep(
      selectedPolicy.policyNumber,
      selectedClaimTypeId,
      CreateClaimFlowStepId.BankVerification,
    );
    setWizardStep(CreateClaimFlowStepId.BankVerification);
  };

  const hasMissingRequiredDocuments = () => {
    if (!deathClaimRequiredDocsQuery.isSuccess) return false;

    const docs = deathClaimRequiredDocsQuery.data.data.documentTypes;
    if (!docs?.length) {
      return uploadDocumentSlots.some(
        (slot) => slot.isRequired && !uploadSlotFiles[slot.id]?.length,
      );
    }
    return docs.some(
      (document) => document.required && !deathClaimDocUploadMeta[document.type]?.length,
    );
  };

  const uploadInProgress =
    deathClaimUploadingSlotId !== null || uploadPartnerDocumentMutation.isPending;
  const currentClaimRequestNumber = url.urlClaimRequestNumber.trim();
  const documentsSubmittedForCurrentClaim =
    deathClaimDocumentsSubmitted &&
    deathClaimDocumentsSubmittedClaimRequestNumber === currentClaimRequestNumber;
  const shouldBlockForDocumentSubmission =
    !documentsSubmittedForCurrentClaim &&
    (deathClaimRequiredDocsQuery.isPending ||
      deathClaimRequiredDocsQuery.isError ||
      submitDeathClaimDocumentsMutation.isPending ||
      hasMissingRequiredDocuments());
  const uploadDocumentsContinueDisabled =
    isAccidentalDeathClaim && (uploadInProgress || shouldBlockForDocumentSubmission);

  return {
    deathClaimRequiredDocsQuery,
    deathClaimDocumentsSubmitted,
    deathClaimDocumentsReadOnly: documentsSubmittedForCurrentClaim,
    deathClaimUploadedDocuments: deathClaimDocUploadMeta,
    documentsLoadError:
      isAccidentalDeathClaim &&
      !documentsSubmittedForCurrentClaim &&
      deathClaimRequiredDocsQuery.isError,
    documentsLoading:
      isAccidentalDeathClaim &&
      !documentsSubmittedForCurrentClaim &&
      deathClaimRequiredDocsQuery.isPending,
    handleContinueToVerification,
    handleUploadSlotFile,
    resetDocuments,
    uploadDocumentSlots,
    uploadDocumentsContinueDisabled,
    uploadInputsRef,
    uploadSlotFiles,
    uploadingSlotId: isAccidentalDeathClaim ? deathClaimUploadingSlotId : null,
  };
}

export type DeathClaimDocumentsState = ReturnType<typeof useDeathClaimDocuments>;
