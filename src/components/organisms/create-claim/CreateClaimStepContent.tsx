import { CreateClaimBankVerificationStep } from '@/components/organisms/create-claim/CreateClaimBankVerificationStep';
import { CreateClaimDetailsStep } from '@/components/organisms/create-claim/CreateClaimDetailsStep';
import { CreateClaimSearchPolicyStep } from '@/components/organisms/create-claim/CreateClaimSearchPolicyStep';
import { CreateClaimSelectClaimTypeStep } from '@/components/organisms/create-claim/CreateClaimSelectClaimTypeStep';
import { CreateClaimUploadDocumentsStep } from '@/components/organisms/create-claim/CreateClaimUploadDocumentsStep';
import { CreateClaimFlowStepId } from '@/lib/constants/createClaim.constants';
import type { CreateClaimFlowState } from '@/lib/hooks/useCreateClaimFlow';

export type CreateClaimStepContentProps = {
  flow: CreateClaimFlowState;
  onSeePolicyDetails?: () => void;
  onContinueToClaimType?: () => void;
};

export function CreateClaimStepContent({
  flow,
  onSeePolicyDetails,
  onContinueToClaimType,
}: CreateClaimStepContentProps) {
  if (flow.wizardStep === CreateClaimFlowStepId.SearchPolicy) {
    return (
      <CreateClaimSearchPolicyStep
        filterValue={flow.searchFilter}
        filterOptions={flow.policyFilterOptions}
        onFilterChange={flow.handleSearchFilterChange}
        searchQuery={flow.searchQuery}
        onSearchQueryChange={flow.handleSearchQueryChange}
        onSearch={flow.handleSearch}
        isSearchLoading={flow.isSearchLoading}
        isSearchError={flow.isSearchError}
        tableRows={flow.tableRows}
        searchAttempted={flow.searchAttempted}
        selectedRowId={flow.selectedRowId}
        onToggleRow={flow.toggleRowSelection}
        onSeePolicyDetails={onSeePolicyDetails ?? (() => {})}
        onContinue={onContinueToClaimType ?? flow.handleContinueToClaimType}
        onBack={flow.handleBackToClaimsManagement}
      />
    );
  }

  if (!flow.selectedPolicy) {
    return null;
  }

  if (flow.wizardStep === CreateClaimFlowStepId.SelectClaimType) {
    return (
      <CreateClaimSelectClaimTypeStep
        selectedPolicy={flow.selectedPolicy}
        insuredSummaryName={flow.insuredSummaryName}
        policySummaryStatus={flow.policySummaryStatus}
        selectedClaimTypeId={flow.selectedClaimTypeId}
        onSelectClaimTypeId={flow.setSelectedClaimTypeId}
        onBack={flow.handleBackToSearchPolicy}
        onContinue={flow.handleGoToClaimDetails}
      />
    );
  }

  if (flow.wizardStep === CreateClaimFlowStepId.AddClaimDetails) {
    return (
      <CreateClaimDetailsStep
        selectedPolicy={flow.selectedPolicy}
        insuredSummaryName={flow.insuredSummaryName}
        sidebarRows={flow.sidebarRowsSelectedPolicy}
        insuredNameField={flow.insuredNameField}
        informantName={flow.informantName}
        informantPhone={flow.informantPhone}
        informantEmail={flow.informantEmail}
        nomineeName={flow.nomineeName}
        nomineePhone={flow.nomineePhone}
        nomineeEmail={flow.nomineeEmail}
        nomineeDateOfBirth={flow.nomineeDateOfBirth}
        dateOfIncident={flow.dateOfIncident}
        dateOfIntimation={flow.dateOfIntimation}
        descriptionOfIncident={flow.descriptionOfIncident}
        incidentWordsRemaining={flow.incidentWordsRemaining}
        onInsuredNameChange={flow.setInsuredNameField}
        onInformantNameChange={flow.setInformantName}
        onInformantPhoneChange={flow.setInformantPhone}
        onInformantEmailChange={flow.setInformantEmail}
        onNomineeNameChange={flow.setNomineeName}
        onNomineePhoneChange={flow.setNomineePhone}
        onNomineeEmailChange={flow.setNomineeEmail}
        onNomineeDobChange={flow.setNomineeDateOfBirth}
        onDateIncidentChange={flow.setDateOfIncident}
        onDateIntimationChange={flow.setDateOfIntimation}
        onDescriptionChange={flow.handleIncidentDescriptionChange}
        onBack={flow.handleBackToClaimType}
        onContinue={flow.handleContinueToUploadDocuments}
        continuePending={flow.createDeathClaimPending}
      />
    );
  }

  if (flow.wizardStep === CreateClaimFlowStepId.UploadRequiredDocuments) {
    return (
      <CreateClaimUploadDocumentsStep
        selectedPolicy={flow.selectedPolicy}
        insuredSummaryName={flow.insuredSummaryName}
        sidebarRows={flow.sidebarRowsSelectedPolicy}
        uploadSlots={flow.uploadDocumentSlots}
        documentsLoadError={flow.documentsLoadError}
        documentsLoading={flow.documentsLoading}
        uploadSlotFiles={flow.uploadSlotFiles}
        uploadedDocuments={flow.deathClaimUploadedDocuments}
        documentsReadOnly={flow.deathClaimDocumentsReadOnly}
        uploadInputsRef={flow.uploadInputsRef}
        onUploadSlotChange={flow.handleUploadSlotFile}
        onRetryLoadDocuments={() => {
          void flow.deathClaimRequiredDocsQuery.refetch();
        }}
        onBack={flow.handleBackToClaimDetails}
        onContinue={flow.handleContinueToVerification}
        continueDisabled={flow.uploadDocumentsContinueDisabled}
        uploadingSlotId={flow.uploadingSlotId}
      />
    );
  }

  if (flow.wizardStep === CreateClaimFlowStepId.BankVerification) {
    return (
      <CreateClaimBankVerificationStep
        selectedPolicy={flow.selectedPolicy}
        insuredSummaryName={flow.insuredSummaryName}
        sidebarRows={flow.sidebarRowsSelectedPolicy}
        bankAccountNumber={flow.bankAccountNumber}
        bankIfscCode={flow.bankIfscCode}
        onBankAccountChange={flow.setBankAccountNumber}
        onBankIfscChange={flow.setBankIfscCode}
        onBack={flow.handleBackToUploadDocuments}
        onSubmit={flow.handleSubmitClaim}
        submitDisabled={flow.bankStepMutationPending}
      />
    );
  }

  return null;
}
