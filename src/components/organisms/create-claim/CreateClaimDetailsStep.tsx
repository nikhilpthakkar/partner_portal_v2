'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  CREATE_CLAIM_CLAIM_DETAILS_FOOTER,
  CREATE_CLAIM_DETAILS_ACCORDION,
  CREATE_CLAIM_DETAILS_ACCORDION_COMPLETED_LABEL,
  CREATE_CLAIM_DETAILS_SECTION,
  CREATE_CLAIM_FOOTER,
} from '@/lib/constants/createClaim.constants';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import {
  formatCreateClaimDetailsRemainingLabel,
  getCreateClaimDetailsSectionProgress,
  type CreateClaimPolicySummaryRow,
} from '@/lib/utils/createClaim';
import { Check, Loader2 } from 'lucide-react';
import { ClaimDetailsIncidentSection } from '@/components/molecules/create-claim/ClaimDetailsIncidentSection';
import { ClaimDetailsInsuredInformantSection } from '@/components/molecules/create-claim/ClaimDetailsInsuredInformantSection';
import { ClaimDetailsNomineeSection } from '@/components/molecules/create-claim/ClaimDetailsNomineeSection';
import { CreateClaimPolicySidebar } from '@/components/molecules/create-claim/CreateClaimPolicySidebar';
import { CreateClaimSelectionSummary } from '@/components/molecules/create-claim/CreateClaimSelectionSummary';

export type CreateClaimDetailsStepProps = {
  selectedPolicy: RecentSearchPolicy;
  insuredSummaryName: string;
  sidebarRows: CreateClaimPolicySummaryRow[];
  insuredNameField: string;
  informantName: string;
  informantPhone: string;
  informantEmail: string;
  nomineeName: string;
  nomineePhone: string;
  nomineeEmail: string;
  nomineeDateOfBirth: string;
  dateOfIncident: string;
  dateOfIntimation: string;
  descriptionOfIncident: string;
  incidentWordsRemaining: number;
  onInsuredNameChange: (value: string) => void;
  onInformantNameChange: (value: string) => void;
  onInformantPhoneChange: (value: string) => void;
  onInformantEmailChange: (value: string) => void;
  onNomineeNameChange: (value: string) => void;
  onNomineePhoneChange: (value: string) => void;
  onNomineeEmailChange: (value: string) => void;
  onNomineeDobChange: (value: string) => void;
  onDateIncidentChange: (value: string) => void;
  onDateIntimationChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onBack?: () => void;
  onContinue: () => void;
  /** When true, disables the Continue CTA and shows a spinner (e.g. death-claim submission). */
  continuePending?: boolean;
};

export function CreateClaimDetailsStep({
  selectedPolicy,
  insuredSummaryName,
  sidebarRows,
  insuredNameField,
  informantName,
  informantPhone,
  informantEmail,
  nomineeName,
  nomineePhone,
  nomineeEmail,
  nomineeDateOfBirth,
  dateOfIncident,
  dateOfIntimation,
  descriptionOfIncident,
  incidentWordsRemaining,
  onInsuredNameChange,
  onInformantNameChange,
  onInformantPhoneChange,
  onInformantEmailChange,
  onNomineeNameChange,
  onNomineePhoneChange,
  onNomineeEmailChange,
  onNomineeDobChange,
  onDateIncidentChange,
  onDateIntimationChange,
  onDescriptionChange,
  onBack,
  onContinue,
  continuePending = false,
}: CreateClaimDetailsStepProps) {
  const progressValues = {
    insuredNameField,
    informantName,
    informantPhone,
    informantEmail,
    nomineeName,
    nomineePhone,
    nomineeEmail,
    nomineeDateOfBirth,
    dateOfIncident,
    dateOfIntimation,
    descriptionOfIncident,
  };

  const allSectionsComplete = CREATE_CLAIM_DETAILS_ACCORDION.every(
    (section) => getCreateClaimDetailsSectionProgress(section.id, progressValues).isComplete,
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold leading-none text-pagination-text">
          {CREATE_CLAIM_DETAILS_SECTION.title}
        </h2>
        <p className="text-sm leading-5 text-pagination-text-muted">
          {CREATE_CLAIM_DETAILS_SECTION.subtitle}
        </p>
      </div>

      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-6">
          <Accordion
            type="multiple"
            defaultValue={[CREATE_CLAIM_DETAILS_ACCORDION[0].id]}
            className="flex flex-col gap-4"
          >
            {CREATE_CLAIM_DETAILS_ACCORDION.map((section, index) => {
              const progress = getCreateClaimDetailsSectionProgress(section.id, progressValues);
              const incompleteCount = progress.totalMandatory - progress.filledMandatory;
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="rounded-[14px] border border-pagination-border bg-white overflow-hidden"
                >
                  <AccordionTrigger className="cursor-pointer hover:no-underline border-b border-transparent bg-slate-50 px-6 py-4 data-[state=open]:border-slate-100 [&_svg:last-child]:ml-2">
                    <div className="flex w-full flex-1 flex-wrap items-center justify-between gap-3 pr-1 text-left">
                      <span className="font-semibold text-base text-pagination-text">
                        <span aria-hidden>{index + 1}. </span>
                        <span>{section.heading}</span>
                      </span>
                      <div className="flex items-center gap-3" aria-live="polite">
                        {progress.isComplete ? (
                          <>
                            <Check
                              className="size-4 shrink-0 text-green-600"
                              strokeWidth={2.5}
                              aria-hidden
                            />
                            <span className="text-sm font-normal leading-5 text-green-600">
                              {CREATE_CLAIM_DETAILS_ACCORDION_COMPLETED_LABEL}
                            </span>
                          </>
                        ) : (
                          <span className="font-normal text-sm text-pagination-text-muted">
                            {formatCreateClaimDetailsRemainingLabel(incompleteCount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-0 h-fit">
                    {section.id === 'insured-informant' ? (
                      <ClaimDetailsInsuredInformantSection
                        insuredNameField={insuredNameField}
                        informantName={informantName}
                        informantPhone={informantPhone}
                        informantEmail={informantEmail}
                        onInsuredNameChange={onInsuredNameChange}
                        onInformantNameChange={onInformantNameChange}
                        onInformantPhoneChange={onInformantPhoneChange}
                        onInformantEmailChange={onInformantEmailChange}
                      />
                    ) : section.id === 'nominee' ? (
                      <ClaimDetailsNomineeSection
                        nomineeName={nomineeName}
                        nomineePhone={nomineePhone}
                        nomineeEmail={nomineeEmail}
                        nomineeDateOfBirth={nomineeDateOfBirth}
                        onNomineeNameChange={onNomineeNameChange}
                        onNomineePhoneChange={onNomineePhoneChange}
                        onNomineeEmailChange={onNomineeEmailChange}
                        onNomineeDobChange={onNomineeDobChange}
                      />
                    ) : (
                      <ClaimDetailsIncidentSection
                        selectedPolicy={selectedPolicy}
                        dateOfIncident={dateOfIncident}
                        dateOfIntimation={dateOfIntimation}
                        descriptionOfIncident={descriptionOfIncident}
                        incidentWordsRemaining={incidentWordsRemaining}
                        onDateIncidentChange={onDateIncidentChange}
                        onDateIntimationChange={onDateIntimationChange}
                        onDescriptionChange={onDescriptionChange}
                      />
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <CreateClaimPolicySidebar
          rows={sidebarRows}
          rowDensity="compact"
          className="bg-muted border-pagination-border shrink-0 shadow-xs lg:w-width-280 w-full rounded-[10px] border px-4 py-3 lg:sticky lg:top-4 lg:max-h-[min(650px,calc(100vh-140px))] lg:overflow-y-auto"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
        <CreateClaimSelectionSummary
          insuredName={insuredSummaryName}
          policyNumber={selectedPolicy.policyNumber}
        />
        <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-auto">
          {onBack ? (
            <Button
              type="button"
              variant="secondary"
              className="h-9 px-4 text-sm font-medium shadow-xs"
              onClick={onBack}
            >
              {CREATE_CLAIM_FOOTER.backCta}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="default"
            disabled={!allSectionsComplete || continuePending}
            title={
              allSectionsComplete ? undefined : 'Complete all claim detail sections to continue'
            }
            onClick={onContinue}
            className="h-9 bg-create-claim-button px-4 text-sm font-medium text-create-claim-button-text shadow-xs hover:bg-create-claim-button-hover disabled:pointer-events-none disabled:opacity-50"
          >
            {continuePending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {CREATE_CLAIM_CLAIM_DETAILS_FOOTER.continueCta}
              </span>
            ) : (
              CREATE_CLAIM_CLAIM_DETAILS_FOOTER.continueCta
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
