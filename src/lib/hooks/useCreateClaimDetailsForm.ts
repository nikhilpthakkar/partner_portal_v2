'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CREATE_CLAIM_INCIDENT_WORD_LIMIT,
  CreateClaimFlowStepId,
} from '@/lib/constants/createClaim.constants';
import type { ClaimSessionFormSnapshot } from '@/lib/types/claims-management/claimSession';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import { writeClaimSessionForm } from '@/lib/utils/claimSessionStorage';
import { getCreateClaimNomineeDefaultsFromPolicy, limitIncidentDescriptionWords } from '@/lib/utils/createClaim';

export type UseCreateClaimDetailsFormOptions = {
  selectedClaimTypeId: string | null;
  selectedPolicy: RecentSearchPolicy | null;
  urlClaimSession: string;
  wizardStep: CreateClaimFlowStepId;
};

export function useCreateClaimDetailsForm({
  selectedClaimTypeId,
  selectedPolicy,
  urlClaimSession,
  wizardStep,
}: UseCreateClaimDetailsFormOptions) {
  const [insuredNameField, setInsuredNameField] = useState('');
  const [informantName, setInformantName] = useState('');
  const [informantPhone, setInformantPhone] = useState('');
  const [informantEmail, setInformantEmail] = useState('');

  const [nomineeName, setNomineeName] = useState('');
  const [nomineePhone, setNomineePhone] = useState('');
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [nomineeDateOfBirth, setNomineeDateOfBirth] = useState('');

  const [dateOfIncident, setDateOfIncident] = useState('');
  const [dateOfIntimation, setDateOfIntimation] = useState('');
  const [descriptionOfIncident, setDescriptionOfIncident] = useState('');

  const resetClaimDetailsForm = useCallback((policy: RecentSearchPolicy) => {
    const insuredName = policy.persons?.[0]?.insured?.name?.trim() ?? '';
    const nomineeDefaults = getCreateClaimNomineeDefaultsFromPolicy(policy);
    setInsuredNameField(insuredName);
    setInformantName('');
    setInformantPhone('');
    setInformantEmail('');
    setNomineeName(nomineeDefaults.nomineeName);
    setNomineePhone(nomineeDefaults.nomineePhone);
    setNomineeEmail(nomineeDefaults.nomineeEmail);
    setNomineeDateOfBirth(nomineeDefaults.nomineeDateOfBirth);
    setDateOfIncident('');
    setDateOfIntimation('');
    setDescriptionOfIncident('');
  }, []);

  const hydrateClaimDetailsForm = useCallback((storedForm: ClaimSessionFormSnapshot) => {
    setInsuredNameField(storedForm.insuredNameField);
    setInformantName(storedForm.informantName);
    setInformantPhone(storedForm.informantPhone);
    setInformantEmail(storedForm.informantEmail);
    setNomineeName(storedForm.nomineeName);
    setNomineePhone(storedForm.nomineePhone);
    setNomineeEmail(storedForm.nomineeEmail);
    setNomineeDateOfBirth(storedForm.nomineeDateOfBirth);
    setDateOfIncident(storedForm.dateOfIncident);
    setDateOfIntimation(storedForm.dateOfIntimation);
    setDescriptionOfIncident(
      limitIncidentDescriptionWords(
        storedForm.descriptionOfIncident,
        CREATE_CLAIM_INCIDENT_WORD_LIMIT,
      ),
    );
  }, []);

  const handleIncidentDescriptionChange = (next: string) => {
    setDescriptionOfIncident(limitIncidentDescriptionWords(next, CREATE_CLAIM_INCIDENT_WORD_LIMIT));
  };

  useEffect(() => {
    if (!urlClaimSession) return;
    if (wizardStep !== CreateClaimFlowStepId.AddClaimDetails) return;
    if (!selectedPolicy || !selectedClaimTypeId) return;

    const formSnapshot = {
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
    writeClaimSessionForm(urlClaimSession, formSnapshot);
  }, [
    urlClaimSession,
    wizardStep,
    selectedPolicy,
    selectedClaimTypeId,
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
  ]);

  const incidentDescriptionWordCount =
    descriptionOfIncident.trim() === ''
      ? 0
      : descriptionOfIncident.trim().split(/\s+/).filter(Boolean).length;
  const incidentWordsRemaining = Math.max(
    0,
    CREATE_CLAIM_INCIDENT_WORD_LIMIT - incidentDescriptionWordCount,
  );

  return {
    dateOfIncident,
    dateOfIntimation,
    descriptionOfIncident,
    handleIncidentDescriptionChange,
    hydrateClaimDetailsForm,
    incidentWordsRemaining,
    informantEmail,
    informantName,
    informantPhone,
    insuredNameField,
    nomineeDateOfBirth,
    nomineeEmail,
    nomineeName,
    nomineePhone,
    resetClaimDetailsForm,
    setDateOfIncident,
    setDateOfIntimation,
    setInformantEmail,
    setInformantName,
    setInformantPhone,
    setInsuredNameField,
    setNomineeDateOfBirth,
    setNomineeEmail,
    setNomineeName,
    setNomineePhone,
  };
}

export type CreateClaimDetailsFormState = ReturnType<typeof useCreateClaimDetailsForm>;
