import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, isValid, parse, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { NonFinancialInsuredUpdationStep } from './NonFinancialInsuredUpdationStep';
import { NonFinancialNomineeFormStep } from './NonFinancialNomineeFormStep';
import {
  NonFinancialNomineeUpdateStep,
  type UpdatableMemberOption,
} from './NonFinancialNomineeUpdateStep';
import { NonFinancialPolicyEndorsementHeader } from './NonFinancialPolicyEndorsementHeader';
import { NonFinancialSelectInsuredStep } from './NonFinancialSelectInsuredStep';
import {
  usePolicyDetailsQuery,
  usePolicyEndorsementTypeApplicableQuery,
  usePolicyEndorsementDocumentUploadMutation,
  usePolicyEndorsePolicyMutation,
} from '@/lib/query/policyDetails.queries';
import { NOMINEE_RELATIONSHIP_OPTIONS } from '@/lib/constants/policyEndorsement.constants';
import type {
  NonFinancialPolicyEndorsementProps,
  NonFinancialEndorsementStep,
  InsuredOption,
} from '@/lib/types/policy-endorsement';
import type {
  PolicyEndorseInsuredUpdatePerson,
  PolicyEndorsePolicyPayload,
} from '@/lib/types/policy-management/policyRefundApi';
import type { SelectOption } from '@/lib/types/Global';
import { isValidEmail, isValidIndianMobile, VALIDATION_MESSAGES } from '@/lib/utils/validation';
import { isDocumentUploadAllowed } from '@/lib/utils/documentUpload';
import { calculateAge } from '@/lib/utils/helpers';

const ACTION_BUTTON_CLASS =
  'bg-claims-details-action-button-bg text-claims-details-action-button-text hover:bg-claims-details-action-button-hover-bg hover:text-claims-details-action-button-hover-text shadow-claims-details-action-button';

export const NonFinancialPolicyEndorsement = ({
  policyNumber,
  policyId,
  plan,
  insuredName,
  endorsementType,
  onBackToEndorsementType,
  onEndorsementSuccess,
}: NonFinancialPolicyEndorsementProps) => {
  type InsuredFormErrors = {
    name?: string;
    dateOfBirth?: string;
    phone?: string;
    email?: string;
  };

  const [activeStep, setActiveStep] = useState<NonFinancialEndorsementStep>('select-insured');
  const [selectedInsured, setSelectedInsured] = useState('');
  const [insuredNameInput, setInsuredNameInput] = useState('');
  const [insuredPhoneInput, setInsuredPhoneInput] = useState('');
  const [insuredEmailInput, setInsuredEmailInput] = useState('');
  const [selectedDateOfBirth, setSelectedDateOfBirth] = useState<Date>();
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState('');
  const [insuredFormErrors, setInsuredFormErrors] = useState<InsuredFormErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [insuredSupportingDocumentPageId, setInsuredSupportingDocumentPageId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insuredFileSelectGenerationRef = useRef(0);
  const dependentFileSelectGenerationRef = useRef(0);

  const { data: policyDetailsResponse, isLoading: isPolicyDetailsLoading } = usePolicyDetailsQuery({
    policyNumber,
  });
  const { data: endorsementTypeApplicableResponse } = usePolicyEndorsementTypeApplicableQuery({
    policyId,
    plan,
    enabled: endorsementType === 'DependentAddition' || endorsementType === 'DependentUpdation',
  });
  const { mutateAsync: endorsePolicy, isPending: isEndorsePolicyPending } =
    usePolicyEndorsePolicyMutation();
  const { mutateAsync: uploadEndorsementDocument, isPending: isUploadEndorsementDocumentPending } =
    usePolicyEndorsementDocumentUploadMutation();
  const policyPersons = policyDetailsResponse?.data?.policies?.[0]?.persons ?? [];
  const policyCategory = policyDetailsResponse?.data?.policies?.[0]?.category ?? '';
  const insuredOptions = useMemo(() => {
    const persons = policyDetailsResponse?.data?.policies?.[0]?.persons ?? [];

    const fetchedInsuredOptions = persons
      .map((person, index) => {
        const insured = person.insured;
        const name = insured?.name?.trim();
        if (!name) {
          return null;
        }

        return {
          value: insured?.id ?? `insured-${index + 1}`,
          label: name,
          insured,
        } satisfies InsuredOption;
      })
      .filter((option): option is InsuredOption => option !== null);

    if (fetchedInsuredOptions.length > 0) {
      return fetchedInsuredOptions;
    }

    const fallbackInsuredName = insuredName.trim();
    if (!fallbackInsuredName) {
      return [];
    }

    return [{ value: 'insured-1', label: fallbackInsuredName, insured: undefined }];
  }, [insuredName, policyDetailsResponse?.data?.policies]);

  useEffect(() => {
    if (!insuredOptions.length) {
      setSelectedInsured('');
      return;
    }

    const selectedInsuredExists = insuredOptions.some((option) => option.value === selectedInsured);
    if (!selectedInsuredExists) {
      setSelectedInsured(insuredOptions[0].value);
    }
  }, [insuredOptions, selectedInsured]);

  useEffect(() => {
    setActiveStep('select-insured');
  }, [endorsementType]);

  const selectedInsuredOption = useMemo(
    () => insuredOptions.find((option) => option.value === selectedInsured),
    [insuredOptions, selectedInsured],
  );
  const selectedPersonIndex = useMemo(() => {
    if (!selectedInsuredOption) {
      return -1;
    }

    const personIndexByInsuredId = policyPersons.findIndex(
      (person) => person.insured?.id === selectedInsuredOption.value,
    );
    if (personIndexByInsuredId >= 0) {
      return personIndexByInsuredId;
    }

    const syntheticIdMatch = selectedInsuredOption.value.match(/^insured-(\d+)$/);
    if (syntheticIdMatch) {
      const encodedPersonIndex = Number(syntheticIdMatch[1]) - 1;
      if (encodedPersonIndex >= 0 && encodedPersonIndex < policyPersons.length) {
        return encodedPersonIndex;
      }
    }

    return -1;
  }, [policyPersons, selectedInsuredOption]);
  const isInsuredUpdationFlow = endorsementType === 'InsuredUpdation';
  const shouldSkipSelectInsuredStep = insuredOptions.length === 1;
  const isSelectStep = activeStep === 'select-insured';
  const isNomineeSelectionStep = activeStep === 'nominee-update';
  const isDependentSelectionStep = activeStep === 'dependent-update';
  const isMemberSelectionStep = isNomineeSelectionStep || isDependentSelectionStep;
  const isNextDisabled = isPolicyDetailsLoading || !selectedInsured;
  const dependentAdditionConfig = useMemo(
    () =>
      endorsementTypeApplicableResponse?.data?.endorsements?.NON_FINANCIAL?.find(
        (endorsement) => endorsement.endorsementType === 'DependentAddition',
      ),
    [endorsementTypeApplicableResponse?.data?.endorsements?.NON_FINANCIAL],
  );
  const dependentUpdationConfig = useMemo(
    () =>
      endorsementTypeApplicableResponse?.data?.endorsements?.NON_FINANCIAL?.find(
        (endorsement) => endorsement.endorsementType === 'DependentUpdation',
      ),
    [endorsementTypeApplicableResponse?.data?.endorsements?.NON_FINANCIAL],
  );
  const canAddDependent = dependentAdditionConfig?.applicable ?? false;
  const dependentRelationshipOptions = useMemo<SelectOption[] | undefined>(() => {
    const validRelationships =
      dependentAdditionConfig?.dependentAdditionConstraints?.remainingCapacity
        ?.validRelationships ?? [];

    let uniqueRelationships: string[] = [];

    if (validRelationships.length) {
      uniqueRelationships = Array.from(
        new Set(validRelationships.map((relationship) => relationship.trim()).filter(Boolean)),
      );
    } else {
      uniqueRelationships = [];
    }

    return uniqueRelationships.map((relationship) => ({
      value: relationship,
      label: relationship,
    }));
  }, [
    dependentAdditionConfig?.dependentAdditionConstraints?.remainingCapacity?.validRelationships,
  ]);
  const dependentAdditionAgeRange =
    dependentAdditionConfig?.dependentAdditionConstraints?.ageValidationRules?.dependentAgeRange;
  const dependentUpdationAgeRange =
    dependentUpdationConfig?.dependentUpdationConstraints?.ageValidationRules?.dependentAgeRange;
  const selectedInsuredDetails = selectedInsuredOption?.insured;
  const formattedDateOfBirth = selectedDateOfBirth ? format(selectedDateOfBirth, 'dd/MM/yyyy') : '';
  useEffect(() => {
    if (!shouldSkipSelectInsuredStep || activeStep !== 'select-insured') {
      return;
    }

    const nextStep = getEndorsementStepAfterInsuredSelection(endorsementType);
    if (!nextStep) {
      return;
    }

    setActiveStep(nextStep);
  }, [activeStep, endorsementType, shouldSkipSelectInsuredStep]);

  useEffect(() => {
    if (!isInsuredUpdationFlow || !selectedInsuredDetails) {
      setInsuredNameInput('');
      setInsuredPhoneInput('');
      setInsuredEmailInput('');
      setSelectedDateOfBirth(undefined);
      setSelectedGender('');
      setSelectedMaritalStatus('');
      setInsuredFormErrors({});
      setSelectedFile(null);
      setInsuredSupportingDocumentPageId('');
      return;
    }

    setInsuredNameInput(selectedInsuredDetails.name?.trim() ?? selectedInsuredOption?.label ?? '');
    setInsuredPhoneInput(selectedInsuredDetails.phone?.trim() ?? '');
    setInsuredEmailInput(selectedInsuredDetails.email?.trim() ?? '');
    const parsedDate = selectedInsuredDetails.dob
      ? parseISO(selectedInsuredDetails.dob)
      : undefined;
    setSelectedDateOfBirth(
      parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined,
    );
    setSelectedGender(selectedInsuredDetails.gender?.trim() ?? '');
    setSelectedMaritalStatus(
      selectedInsuredDetails.maritalStatus?.trim() ??
        selectedInsuredDetails.marital_status?.trim() ??
        '',
    );
    setInsuredFormErrors({});
    setSelectedFile(null);
    setInsuredSupportingDocumentPageId('');
  }, [isInsuredUpdationFlow, selectedInsuredDetails, selectedInsuredOption?.label]);

  const nomineeOptions = useMemo<UpdatableMemberOption[]>(() => {
    if (selectedPersonIndex < 0) {
      return [];
    }

    const nominee = policyPersons[selectedPersonIndex]?.nominee;
    const nomineeName = nominee?.name?.trim();
    if (!nomineeName) {
      return [];
    }

    const nomineeId =
      nominee?.id?.trim() || nominee?.uhid?.trim() || `${selectedInsured}-nominee-1`;
    const relationship = nominee?.relationship?.trim();

    return [
      {
        id: nomineeId,
        title: 'Nominee 1',
        subtitle: relationship ? `${nomineeName} (${relationship})` : nomineeName,
        name: nomineeName,
        mobileNumber: normalizeNomineePhoneNumber(nominee?.phone),
        email: nominee?.email?.trim() ?? '',
        gender: normalizeGenderValue(nominee?.gender),
        dateOfBirth: nominee?.dob ?? '',
        relationship: normalizeNomineeRelationshipValue(nominee?.relationship),
      },
    ];
  }, [policyPersons, selectedInsured, selectedPersonIndex]);
  const [deletedDependentIds, setDeletedDependentIds] = useState<string[]>([]);

  const dependentOptions = useMemo<UpdatableMemberOption[]>(() => {
    if (selectedPersonIndex < 0) {
      return [];
    }

    const dependents = policyPersons[selectedPersonIndex]?.dependents ?? [];

    return dependents.reduce<UpdatableMemberOption[]>((accumulator, dependent, dependentIndex) => {
      const dependentName = dependent.name?.trim();
      if (!dependentName) {
        return accumulator;
      }

      const dependentId = getDependentIdentifier(dependent.id, dependent.uhid, dependentIndex);
      const relationship = dependent.relationship?.trim();
      if (deletedDependentIds.includes(dependentId)) {
        return accumulator;
      }

      accumulator.push({
        id: dependentId,
        title: `Dependent ${dependentIndex + 1}`,
        subtitle: relationship ? `${dependentName} (${relationship})` : dependentName,
        name: dependentName,
        mobileNumber: dependent.phone?.trim() ?? '',
        email: dependent.email?.trim() ?? '',
        gender: normalizeGenderValue(dependent.gender),
        dateOfBirth: dependent.dob ?? '',
        relationship: relationship ?? '',
      });

      return accumulator;
    }, []);
  }, [deletedDependentIds, policyPersons, selectedPersonIndex]);

  useEffect(() => {
    setDeletedDependentIds([]);
  }, [selectedInsured]);

  const [selectedNomineeId, setSelectedNomineeId] = useState('');
  const [nomineeSelectionError, setNomineeSelectionError] = useState('');
  const [nomineeFormMode, setNomineeFormMode] = useState<'add' | 'edit'>('add');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeMobileNumber, setNomineeMobileNumber] = useState('');
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [nomineeGender, setNomineeGender] = useState('');
  const [nomineeDateOfBirth, setNomineeDateOfBirth] = useState<Date>();
  const [nomineeRelationship, setNomineeRelationship] = useState('');
  const [nomineeFormErrors, setNomineeFormErrors] = useState<{
    name?: string;
    mobileNumber?: string;
    email?: string;
    gender?: string;
    dateOfBirth?: string;
    relationship?: string;
  }>({});
  const [selectedNomineeFile, setSelectedNomineeFile] = useState<File | null>(null);
  const [selectedDependentId, setSelectedDependentId] = useState('');
  const [dependentSelectionError, setDependentSelectionError] = useState('');
  const [activeDependentEndorsementType, setActiveDependentEndorsementType] = useState<string>('');
  const [dependentFormMode, setDependentFormMode] = useState<'add' | 'edit'>('add');
  const [dependentName, setDependentName] = useState('');
  const [dependentMobileNumber, setDependentMobileNumber] = useState('');
  const [dependentEmail, setDependentEmail] = useState('');
  const [dependentGender, setDependentGender] = useState('');
  const [dependentDateOfBirth, setDependentDateOfBirth] = useState<Date>();
  const [dependentRelationship, setDependentRelationship] = useState('');
  const [dependentFormErrors, setDependentFormErrors] = useState<{
    name?: string;
    mobileNumber?: string;
    email?: string;
    gender?: string;
    dateOfBirth?: string;
    relationship?: string;
  }>({});
  const [selectedDependentFile, setSelectedDependentFile] = useState<File | null>(null);
  const [dependentSupportingDocumentPageId, setDependentSupportingDocumentPageId] = useState('');
  const [isDependentDeleteConfirmationVisible, setIsDependentDeleteConfirmationVisible] =
    useState(false);

  useEffect(() => {
    if (!nomineeOptions.length) {
      setSelectedNomineeId('');
      return;
    }

    const hasSelectedNominee = nomineeOptions.some((option) => option.id === selectedNomineeId);
    if (!hasSelectedNominee) {
      setSelectedNomineeId(nomineeOptions[0].id);
    }
  }, [nomineeOptions, selectedNomineeId]);

  useEffect(() => {
    if (!dependentOptions.length) {
      setSelectedDependentId('');
      return;
    }

    const hasSelectedDependent = dependentOptions.some(
      (option) => option.id === selectedDependentId,
    );
    if (!hasSelectedDependent) {
      setSelectedDependentId(dependentOptions[0].id);
    }
  }, [dependentOptions, selectedDependentId]);

  useEffect(() => {
    if (activeStep !== 'dependent-update') {
      setIsDependentDeleteConfirmationVisible(false);
    }
  }, [activeStep]);

  const formattedNomineeDateOfBirth = nomineeDateOfBirth
    ? format(nomineeDateOfBirth, 'dd/MM/yyyy')
    : '';
  const formattedDependentDateOfBirth = dependentDateOfBirth
    ? format(dependentDateOfBirth, 'dd/MM/yyyy')
    : '';
  const getDependentDateOfBirthRangeError = (dateOfBirth: Date | undefined): string => {
    const dependentAgeRange =
      activeDependentEndorsementType === 'DependentAddition'
        ? dependentAdditionAgeRange
        : dependentUpdationAgeRange;

    if (
      !dateOfBirth ||
      dependentAgeRange?.min === undefined ||
      dependentAgeRange?.max === undefined
    ) {
      return '';
    }

    const age = calculateAge(format(dateOfBirth, 'yyyy-MM-dd')) ?? 0;

    if (age < dependentAgeRange.min) {
      return `Age should be greater than ${dependentAgeRange.min} year(s)`;
    }

    if (age > dependentAgeRange.max) {
      return `Age should be less than ${dependentAgeRange.max} years`;
    }

    return '';
  };

  const applyNomineeOptionToForm = useCallback(
    (nomineeOption: UpdatableMemberOption, mode: 'add' | 'edit') => {
      setNomineeFormMode(mode);
      setNomineeFormErrors({});
      setNomineeName(nomineeOption.name);
      setNomineeMobileNumber(nomineeOption.mobileNumber);
      setNomineeEmail(nomineeOption.email);
      setNomineeGender(nomineeOption.gender ?? '');
      setNomineeDateOfBirth(parsePolicyPersonDateOfBirth(nomineeOption.dateOfBirth));
      setNomineeRelationship(nomineeOption.relationship);
      setSelectedNomineeFile(null);
    },
    [],
  );

  useEffect(() => {
    if (activeStep !== 'nominee-update' || endorsementType !== 'NomineeUpdate') {
      return;
    }

    const selectedNomineeOption =
      nomineeOptions.find((option) => option.id === selectedNomineeId) ?? nomineeOptions[0];
    if (!selectedNomineeOption) {
      return;
    }

    applyNomineeOptionToForm(selectedNomineeOption, 'edit');
  }, [activeStep, applyNomineeOptionToForm, endorsementType, nomineeOptions, selectedNomineeId]);

  const handleSelectedNomineeChange = (value: string) => {
    setSelectedNomineeId(value);
    setNomineeSelectionError('');

    const nomineeOption = nomineeOptions.find((option) => option.id === value);
    if (nomineeOption) {
      applyNomineeOptionToForm(nomineeOption, 'edit');
    }
  };

  const handleSelectedDependentChange = (value: string) => {
    setSelectedDependentId(value);
    setDependentSelectionError('');
  };

  const handleBack = () => {
    if (activeStep === 'nominee-form') {
      setActiveStep('nominee-update');
      return;
    }
    if (activeStep === 'dependent-form') {
      setActiveStep('dependent-update');
      return;
    }

    if (!isSelectStep) {
      if (shouldSkipSelectInsuredStep) {
        onBackToEndorsementType();
        return;
      }
      setActiveStep('select-insured');
      return;
    }

    onBackToEndorsementType();
  };

  const handleNext = () => {
    if (isNextDisabled) {
      return;
    }

    switch (endorsementType) {
      case 'InsuredUpdation':
        setActiveStep('insured-updation');
        return;
      case 'NomineeUpdate':
        setActiveStep('nominee-update');
        return;
      case 'DependentUpdation':
      case 'DependentAddition':
        setActiveStep('dependent-update');
        return;
      default:
        toast.info('This endorsement flow will be enabled soon');
    }
  };

  const handleSupportingDocumentSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedSupportingFile = event.target.files?.[0] ?? null;
    const input = event.target;

    if (!selectedSupportingFile) {
      insuredFileSelectGenerationRef.current += 1;
      setSelectedFile(null);
      setInsuredSupportingDocumentPageId('');
      return;
    }

    const generation = ++insuredFileSelectGenerationRef.current;
    input.disabled = true;
    void (async () => {
      try {
        const allowed = await isDocumentUploadAllowed(selectedSupportingFile, input);
        if (generation !== insuredFileSelectGenerationRef.current) return;
        if (!allowed) {
          setSelectedFile(null);
          setInsuredSupportingDocumentPageId('');
          return;
        }

        setSelectedFile(selectedSupportingFile);
        try {
          const response = await uploadEndorsementDocument({
            payload: {
              requestContext: 'POLICY',
              documentType: 'IDENTITY_PROOF',
              referenceId: policyNumber,
              document: selectedSupportingFile,
            },
          });
          if (generation !== insuredFileSelectGenerationRef.current) return;
          setInsuredSupportingDocumentPageId(response.page_id);
        } catch (error) {
          if (generation !== insuredFileSelectGenerationRef.current) return;
          setSelectedFile(null);
          setInsuredSupportingDocumentPageId('');
          input.value = '';
          toast.error('Unable to upload supporting document');
          console.error('upload-insured-supporting-document failed', error);
        }
      } finally {
        if (generation === insuredFileSelectGenerationRef.current) {
          input.disabled = false;
        }
      }
    })();
  };

  const handleSaveInsuredChanges = async () => {
    const trimmedInsuredName = insuredNameInput.trim();
    const trimmedInsuredPhone = insuredPhoneInput.trim();
    const trimmedInsuredEmail = insuredEmailInput.trim();

    const nextInsuredFormErrors: InsuredFormErrors = {
      name: trimmedInsuredName ? undefined : VALIDATION_MESSAGES.NAME_REQUIRED,
      dateOfBirth: selectedDateOfBirth ? undefined : VALIDATION_MESSAGES.REQUIRED,
      phone: isValidIndianMobile(trimmedInsuredPhone)
        ? undefined
        : VALIDATION_MESSAGES.MOBILE_REQUIRED,
      email:
        trimmedInsuredEmail && !isValidEmail(trimmedInsuredEmail)
          ? VALIDATION_MESSAGES.EMAIL_REQUIRED
          : undefined,
    };
    setInsuredFormErrors(nextInsuredFormErrors);

    if (Object.values(nextInsuredFormErrors).some(Boolean)) {
      return;
    }

    if (selectedPersonIndex < 0 || !selectedInsuredDetails) {
      toast.error('Unable to identify insured details');
      return;
    }

    const selectedPerson = policyPersons[selectedPersonIndex];
    const personId = selectedPerson?.id ?? selectedInsuredOption?.value;
    if (!personId) {
      toast.error('Unable to identify insured details');
      return;
    }

    const endorsePersons: PolicyEndorseInsuredUpdatePerson[] = [
      {
        id: personId,
        insured: {
          name: trimmedInsuredName,
          dob: format(selectedDateOfBirth!, 'yyyy-MM-dd'),
          phone: trimmedInsuredPhone,
          email: trimmedInsuredEmail,
          gender: selectedGender ?? undefined,
          maritalStatus: selectedMaritalStatus ?? undefined,
        },
      },
    ];

    const payload: PolicyEndorsePolicyPayload = {
      plan,
      endorsementType: 'UPDATE_INSURED',
      updatedOn: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
      endorsementProofs: insuredSupportingDocumentPageId ? [insuredSupportingDocumentPageId] : [],
      persons: endorsePersons,
    };

    try {
      const response = await endorsePolicy({
        policyId,
        payload,
      });
      toast.success(response.message ?? 'Insured details updated');
      await onEndorsementSuccess();
    } catch (error) {
      toast.error('Unable to save insured details');
      console.error('update-insured failed', error);
    }
  };

  const handleAddNominee = () => {
    setNomineeFormMode('add');
    setNomineeFormErrors({});
    setNomineeName('');
    setNomineeMobileNumber('');
    setNomineeEmail('');
    setNomineeGender('');
    setNomineeDateOfBirth(undefined);
    setNomineeRelationship('');
    setSelectedNomineeFile(null);
    setActiveStep('nominee-form');
  };

  const openNomineeInEditForm = (nomineeId: string) => {
    const nomineeOption = nomineeOptions.find((option) => option.id === nomineeId);
    if (!nomineeOption) {
      setNomineeSelectionError('Please select a nominee');
      return;
    }

    setSelectedNomineeId(nomineeId);
    setNomineeSelectionError('');
    applyNomineeOptionToForm(nomineeOption, 'edit');
    setActiveStep('nominee-form');
  };
  const handleNomineeNext = () => {
    if (!selectedNomineeId) {
      setNomineeSelectionError('Please select a nominee');
      return;
    }
    openNomineeInEditForm(selectedNomineeId);
  };

  const handleAddDependent = () => {
    setActiveDependentEndorsementType('DependentAddition');
    setDependentFormMode('add');
    setDependentFormErrors({});
    setDependentName('');
    setDependentMobileNumber('');
    setDependentEmail('');
    setDependentGender('');
    setDependentDateOfBirth(undefined);
    setDependentRelationship('');
    setSelectedDependentFile(null);
    setDependentSupportingDocumentPageId('');
    setActiveStep('dependent-form');
  };

  const openDependentInEditForm = (dependentId: string) => {
    setActiveDependentEndorsementType('DependentUpdation');
    const dependentOption = dependentOptions.find((option) => option.id === dependentId);
    if (!dependentOption) {
      setDependentSelectionError('Please select a dependent');
      return;
    }
    setSelectedDependentId(dependentId);
    setDependentSelectionError('');

    const parsedDependentDate = dependentOption.dateOfBirth
      ? parseISO(dependentOption.dateOfBirth)
      : undefined;
    setDependentFormMode('edit');
    setDependentFormErrors({});
    setDependentName(dependentOption.name);
    setDependentMobileNumber(dependentOption.mobileNumber);
    setDependentEmail(dependentOption.email);
    setDependentGender(dependentOption.gender ?? '');
    setDependentDateOfBirth(
      parsedDependentDate && !Number.isNaN(parsedDependentDate.getTime())
        ? parsedDependentDate
        : undefined,
    );
    setDependentRelationship(dependentOption.relationship);
    setSelectedDependentFile(null);
    setDependentSupportingDocumentPageId('');
    setActiveStep('dependent-form');
  };
  const handleDependentNext = () => {
    if (!selectedDependentId) {
      setDependentSelectionError('Please select a dependent');
      return;
    }
    openDependentInEditForm(selectedDependentId);
  };

  const handleDependentSupportingDocumentSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedSupportingFile = event.target.files?.[0] ?? null;
    const input = event.target;

    if (!selectedSupportingFile) {
      dependentFileSelectGenerationRef.current += 1;
      setSelectedDependentFile(null);
      setDependentSupportingDocumentPageId('');
      return;
    }

    const generation = ++dependentFileSelectGenerationRef.current;
    input.disabled = true;
    void (async () => {
      try {
        const allowed = await isDocumentUploadAllowed(selectedSupportingFile, input);
        if (generation !== dependentFileSelectGenerationRef.current) return;
        if (!allowed) {
          setSelectedDependentFile(null);
          setDependentSupportingDocumentPageId('');
          return;
        }

        setSelectedDependentFile(selectedSupportingFile);
        try {
          const response = await uploadEndorsementDocument({
            payload: {
              requestContext: 'POLICY',
              documentType: 'IDENTITY_PROOF',
              referenceId: policyNumber,
              document: selectedSupportingFile,
            },
          });
          if (generation !== dependentFileSelectGenerationRef.current) return;
          setDependentSupportingDocumentPageId(response.page_id);
        } catch (error) {
          if (generation !== dependentFileSelectGenerationRef.current) return;
          setSelectedDependentFile(null);
          setDependentSupportingDocumentPageId('');
          input.value = '';
          toast.error('Unable to upload supporting document');
          console.error('upload-dependent-supporting-document failed', error);
        }
      } finally {
        if (generation === dependentFileSelectGenerationRef.current) {
          input.disabled = false;
        }
      }
    })();
  };

  const handleDeleteDependent = async (dependentId: string) => {
    if (isEndorsePolicyPending) {
      return;
    }

    if (deletedDependentIds.includes(dependentId)) {
      return;
    }

    if (selectedPersonIndex < 0 || !policyPersons[selectedPersonIndex]?.insured) {
      toast.error('Unable to identify insured details');
      return;
    }

    const selectedPerson = policyPersons[selectedPersonIndex];
    const personId = selectedPerson?.id ?? selectedInsuredOption?.value;
    if (!personId) {
      toast.error('Unable to identify insured details');
      return;
    }

    const payload: PolicyEndorsePolicyPayload = {
      plan,
      endorsementType: 'UPDATE_DEPENDENT',
      updateType: 'DELETE',
      updatedOn: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
      endorsementProofs: dependentSupportingDocumentPageId
        ? [dependentSupportingDocumentPageId]
        : [],
      personId,
      dependentId,
    };

    try {
      const response = await endorsePolicy({
        policyId,
        payload,
      });
      setDeletedDependentIds((previousDependentIds) => {
        if (previousDependentIds.includes(dependentId)) {
          return previousDependentIds;
        }
        return [...previousDependentIds, dependentId];
      });
      toast.success(response.message ?? 'Dependent removed');
    } catch (error) {
      toast.error('Unable to delete dependent');
      console.error('delete-dependent failed', error);
    }
  };

  const handleSaveNomineeChanges = async () => {
    const trimmedNomineeMobileNumber = nomineeMobileNumber.trim();
    const trimmedNomineeEmail = nomineeEmail.trim();

    const nextNomineeFormErrors = {
      name: nomineeName.trim() ? undefined : VALIDATION_MESSAGES.NAME_REQUIRED,
      mobileNumber: isValidIndianMobile(trimmedNomineeMobileNumber)
        ? undefined
        : VALIDATION_MESSAGES.MOBILE_REQUIRED,
      email:
        trimmedNomineeEmail && !isValidEmail(trimmedNomineeEmail)
          ? VALIDATION_MESSAGES.EMAIL_REQUIRED
          : undefined,
      gender: nomineeGender.trim() ? undefined : VALIDATION_MESSAGES.GENDER_REQUIRED,
      relationship: nomineeRelationship.trim()
        ? undefined
        : VALIDATION_MESSAGES.RELATIONSHIP_REQUIRED,
      dateOfBirth: nomineeDateOfBirth ? undefined : VALIDATION_MESSAGES.DATE_OF_BIRTH_REQUIRED,
    };
    if (Object.values(nextNomineeFormErrors).some(Boolean)) {
      setNomineeFormErrors(nextNomineeFormErrors);
      return;
    }
    setNomineeFormErrors({});

    const payload: PolicyEndorsePolicyPayload = {
      plan,
      endorsementType: 'UPDATE_NOMINEE',
      updatedOn: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
      refundMode: 'ACCOUNT',
      category: policyCategory,
      insuredPhone: selectedInsuredDetails?.phone?.trim() ?? '',
      nominee: {
        name: nomineeName.trim(),
        phone: trimmedNomineeMobileNumber,
        email: trimmedNomineeEmail,
        dob: format(nomineeDateOfBirth!, 'yyyy-MM-dd'),
        gender: nomineeGender.trim(),
        relationship: nomineeRelationship,
        plan,
      },
    };

    try {
      const response = await endorsePolicy({
        policyId,
        payload,
      });
      toast.success(
        response.message ??
          (nomineeFormMode === 'add' ? 'Nominee details saved' : 'Nominee details updated'),
      );
      await onEndorsementSuccess();
    } catch (error) {
      toast.error('Unable to save nominee details');
      console.error('update-nominee failed', error);
    }
  };

  const handleSaveDependentChanges = async () => {
    const trimmedDependentMobileNumber = dependentMobileNumber.trim();
    const trimmedDependentEmail = dependentEmail.trim();

    const nextDependentFormErrors = {
      name: dependentName.trim() ? undefined : VALIDATION_MESSAGES.NAME_REQUIRED,
      mobileNumber: isValidIndianMobile(trimmedDependentMobileNumber)
        ? undefined
        : VALIDATION_MESSAGES.MOBILE_REQUIRED,
      email:
        trimmedDependentEmail && !isValidEmail(trimmedDependentEmail)
          ? VALIDATION_MESSAGES.EMAIL_REQUIRED
          : undefined,
      gender: dependentGender.trim() ? undefined : VALIDATION_MESSAGES.GENDER_REQUIRED,
      relationship: dependentRelationship.trim()
        ? undefined
        : VALIDATION_MESSAGES.RELATIONSHIP_REQUIRED,
      dateOfBirth: dependentDateOfBirth
        ? getDependentDateOfBirthRangeError(dependentDateOfBirth)
        : VALIDATION_MESSAGES.DATE_OF_BIRTH_REQUIRED,
    };
    if (Object.values(nextDependentFormErrors).some(Boolean)) {
      setDependentFormErrors(nextDependentFormErrors);
      return;
    }
    setDependentFormErrors({});

    if (selectedPersonIndex < 0 || !policyPersons[selectedPersonIndex]?.insured) {
      toast.error('Unable to identify insured details');
      return;
    }

    const selectedPerson = policyPersons[selectedPersonIndex];
    const personId = selectedPerson?.id ?? selectedInsuredOption?.value;
    if (!personId) {
      toast.error('Unable to identify insured details');
      return;
    }

    const payload: PolicyEndorsePolicyPayload = {
      plan,
      endorsementType: 'UPDATE_DEPENDENT',
      updateType: dependentFormMode === 'add' ? 'CREATE' : 'UPDATE',
      updatedOn: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
      endorsementProofs: dependentSupportingDocumentPageId
        ? [dependentSupportingDocumentPageId]
        : [],
      personId,
      dependentId: dependentFormMode === 'edit' ? selectedDependentId : undefined,
      category: policyCategory,
      insuredPhone: selectedInsuredDetails?.phone?.trim() ?? '',
      dependent: {
        name: dependentName.trim(),
        dob: format(dependentDateOfBirth!, 'yyyy-MM-dd'),
        user_id: 0,
        phone: trimmedDependentMobileNumber,
        email: trimmedDependentEmail,
        gender: dependentGender.trim(),
        relationship: dependentRelationship.trim(),
      },
    };

    try {
      const response = await endorsePolicy({
        policyId,
        payload,
      });
      toast.success(
        response.message ??
          (dependentFormMode === 'add' ? 'Dependent details saved' : 'Dependent details updated'),
      );
      await onEndorsementSuccess();
    } catch (error) {
      toast.error('Unable to save dependent details');
      console.error('update-dependent failed', error);
    }
  };

  const renderActiveStep = () => {
    switch (activeStep) {
      case 'select-insured':
        return (
          <NonFinancialSelectInsuredStep
            isLoading={isPolicyDetailsLoading}
            selectedInsured={selectedInsured}
            insuredOptions={insuredOptions}
            onSelectInsured={setSelectedInsured}
          />
        );
      case 'insured-updation':
        return (
          <NonFinancialInsuredUpdationStep
            insuredNameValue={insuredNameInput}
            insuredPhoneValue={insuredPhoneInput}
            insuredEmailValue={insuredEmailInput}
            selectedDateOfBirth={selectedDateOfBirth}
            formattedDateOfBirth={formattedDateOfBirth}
            selectedGender={selectedGender}
            selectedMaritalStatus={selectedMaritalStatus}
            selectedFile={selectedFile}
            formErrors={insuredFormErrors}
            fileInputRef={fileInputRef}
            onInsuredNameChange={(value) => {
              setInsuredNameInput(value);
              setInsuredFormErrors((previousErrors) => ({ ...previousErrors, name: undefined }));
            }}
            onInsuredPhoneChange={(value) => {
              setInsuredPhoneInput(value);
              setInsuredFormErrors((previousErrors) => ({ ...previousErrors, phone: undefined }));
            }}
            onInsuredEmailChange={(value) => {
              setInsuredEmailInput(value);
              setInsuredFormErrors((previousErrors) => ({ ...previousErrors, email: undefined }));
            }}
            onSelectDateOfBirth={(value) => {
              setSelectedDateOfBirth(value);
              setInsuredFormErrors((previousErrors) => ({
                ...previousErrors,
                dateOfBirth: undefined,
              }));
            }}
            onSelectGender={setSelectedGender}
            onSelectMaritalStatus={setSelectedMaritalStatus}
            onSupportingDocumentSelect={handleSupportingDocumentSelect}
          />
        );
      case 'nominee-form':
        return (
          <NonFinancialNomineeFormStep
            memberType="nominee"
            memberName={nomineeName}
            memberMobileNumber={nomineeMobileNumber}
            memberEmail={nomineeEmail}
            memberGender={nomineeGender}
            selectedDateOfBirth={nomineeDateOfBirth}
            formattedDateOfBirth={formattedNomineeDateOfBirth}
            memberRelationship={nomineeRelationship}
            formErrors={nomineeFormErrors}
            selectedFile={selectedNomineeFile}
            fileInputRef={fileInputRef}
            onMemberNameChange={(value) => {
              setNomineeName(value);
              setNomineeFormErrors((previousErrors) => ({ ...previousErrors, name: '' }));
            }}
            onMemberMobileNumberChange={(value) => {
              setNomineeMobileNumber(value);
              setNomineeFormErrors((previousErrors) => ({ ...previousErrors, mobileNumber: '' }));
            }}
            onMemberEmailChange={(value) => {
              setNomineeEmail(value);
              setNomineeFormErrors((previousErrors) => ({ ...previousErrors, email: '' }));
            }}
            onMemberGenderChange={(value) => {
              setNomineeGender(value);
              setNomineeFormErrors((previousErrors) => ({ ...previousErrors, gender: '' }));
            }}
            onSelectDateOfBirth={(value) => {
              setNomineeDateOfBirth(value);
              setNomineeFormErrors((previousErrors) => ({ ...previousErrors, dateOfBirth: '' }));
            }}
            onMemberRelationshipChange={(value) => {
              setNomineeRelationship(value);
              setNomineeFormErrors((previousErrors) => ({ ...previousErrors, relationship: '' }));
            }}
          />
        );
      case 'nominee-update':
        return (
          <NonFinancialNomineeUpdateStep
            memberType="nominee"
            options={nomineeOptions}
            selectedOptionId={selectedNomineeId}
            errorMessage={nomineeSelectionError}
            onSelectOption={handleSelectedNomineeChange}
            onEditOption={openNomineeInEditForm}
            onAddMember={handleAddNominee}
          />
        );
      case 'dependent-form':
        return (
          <NonFinancialNomineeFormStep
            memberType="dependent"
            memberName={dependentName}
            memberMobileNumber={dependentMobileNumber}
            memberEmail={dependentEmail}
            memberGender={dependentGender}
            selectedDateOfBirth={dependentDateOfBirth}
            formattedDateOfBirth={formattedDependentDateOfBirth}
            memberRelationship={dependentRelationship}
            formErrors={dependentFormErrors}
            selectedFile={selectedDependentFile}
            fileInputRef={fileInputRef}
            onMemberNameChange={(value) => {
              setDependentName(value);
              setDependentFormErrors((previousErrors) => ({ ...previousErrors, name: '' }));
            }}
            onMemberMobileNumberChange={(value) => {
              setDependentMobileNumber(value);
              setDependentFormErrors((previousErrors) => ({ ...previousErrors, mobileNumber: '' }));
            }}
            onMemberEmailChange={(value) => {
              setDependentEmail(value);
              setDependentFormErrors((previousErrors) => ({ ...previousErrors, email: '' }));
            }}
            onMemberGenderChange={(value) => {
              setDependentGender(value);
              setDependentFormErrors((previousErrors) => ({ ...previousErrors, gender: '' }));
            }}
            onSelectDateOfBirth={(value) => {
              setDependentDateOfBirth(value);
              const dateOfBirthError = getDependentDateOfBirthRangeError(value);
              setDependentFormErrors((previousErrors) => ({
                ...previousErrors,
                dateOfBirth: dateOfBirthError,
              }));
            }}
            onMemberRelationshipChange={(value) => {
              setDependentRelationship(value);
              setDependentFormErrors((previousErrors) => ({ ...previousErrors, relationship: '' }));
            }}
            memberRelationshipOptions={dependentRelationshipOptions}
            onSupportingDocumentSelect={handleDependentSupportingDocumentSelect}
          />
        );
      case 'dependent-update':
        return (
          <NonFinancialNomineeUpdateStep
            memberType="dependent"
            options={dependentOptions}
            selectedOptionId={selectedDependentId}
            errorMessage={dependentSelectionError}
            onSelectOption={handleSelectedDependentChange}
            onEditOption={openDependentInEditForm}
            onAddMember={canAddDependent ? handleAddDependent : undefined}
            onDeleteOption={handleDeleteDependent}
            onDeleteConfirmationVisibilityChange={setIsDependentDeleteConfirmationVisible}
          />
        );
      default:
        return null;
    }
  };

  const renderFooterActions = () => {
    if (isMemberSelectionStep) {
      if (isDependentDeleteConfirmationVisible) {
        return null;
      }
      return (
        <div className="flex items-center justify-end gap-2 pt-3.5">
          <Button type="button" variant="outline" onClick={handleBack}>
            {'Back'}
          </Button>
          {isNomineeSelectionStep ? (
            <Button
              type="button"
              onClick={handleNomineeNext}
              disabled={!selectedNomineeId || nomineeOptions.length === 0}
              className={ACTION_BUTTON_CLASS}
            >
              {'Next'}
            </Button>
          ) : null}
          {isDependentSelectionStep ? (
            <Button
              type="button"
              onClick={handleDependentNext}
              disabled={!selectedDependentId || dependentOptions.length === 0}
              className={ACTION_BUTTON_CLASS}
            >
              {'Next'}
            </Button>
          ) : null}
        </div>
      );
    }

    const primaryActionHandler =
      activeStep === 'select-insured'
        ? handleNext
        : activeStep === 'insured-updation'
          ? handleSaveInsuredChanges
          : activeStep === 'nominee-form'
            ? handleSaveNomineeChanges
            : handleSaveDependentChanges;
    const primaryActionLabel = activeStep === 'select-insured' ? 'Next' : 'Save changes';
    const isPrimaryActionDisabled =
      (activeStep === 'select-insured' && isNextDisabled) ||
      isEndorsePolicyPending ||
      isUploadEndorsementDocumentPending;

    return (
      <div className="flex items-center justify-end gap-2 pt-3.5">
        <Button type="button" variant="outline" onClick={handleBack}>
          {'Back'}
        </Button>
        <Button
          type="button"
          onClick={primaryActionHandler}
          disabled={isPrimaryActionDisabled}
          className={ACTION_BUTTON_CLASS}
        >
          {isEndorsePolicyPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          ) : (
            primaryActionLabel
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="flex min-w-endorse-modal-width flex-col gap-4">
      {!isMemberSelectionStep ? (
        <NonFinancialPolicyEndorsementHeader policyNumber={policyNumber} />
      ) : null}
      {renderActiveStep()}
      {renderFooterActions()}
    </div>
  );
};

const getDependentIdentifier = (id: string | undefined, uhid: string | undefined, index: number) =>
  id?.trim() || uhid?.trim() || `dependent-${index + 1}`;

const normalizeGenderValue = (value: string | undefined): string => {
  const normalizedValue = value?.trim().toUpperCase() ?? '';
  if (normalizedValue === 'MALE' || normalizedValue === 'FEMALE' || normalizedValue === 'OTHER') {
    return normalizedValue;
  }
  return '';
};

const normalizeNomineePhoneNumber = (phone: string | undefined): string => {
  const digits = phone?.replace(/\D/g, '') ?? '';
  if (!digits) {
    return '';
  }
  return digits.slice(-10);
};

const normalizeNomineeRelationshipValue = (value: string | undefined): string => {
  const trimmedValue = value?.trim() ?? '';
  if (!trimmedValue) {
    return '';
  }

  const matchedRelationship = NOMINEE_RELATIONSHIP_OPTIONS.find(
    (option) => option.value.toLowerCase() === trimmedValue.toLowerCase(),
  );

  return matchedRelationship?.value ?? trimmedValue;
};

const parsePolicyPersonDateOfBirth = (value: string | undefined): Date | undefined => {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmedValue)) {
    const parsedIsoDate = parseISO(trimmedValue.slice(0, 10));
    if (!Number.isNaN(parsedIsoDate.getTime())) {
      return parsedIsoDate;
    }
  }

  const parsedDdMmYyyyDate = parse(trimmedValue, 'dd/MM/yyyy', new Date());
  if (isValid(parsedDdMmYyyyDate)) {
    return parsedDdMmYyyyDate;
  }

  const parsedDate = new Date(
    trimmedValue.includes('T') ? trimmedValue : `${trimmedValue}T00:00:00`,
  );
  if (isValid(parsedDate)) {
    return parsedDate;
  }

  return undefined;
};

const getEndorsementStepAfterInsuredSelection = (
  endorsementType: NonFinancialPolicyEndorsementProps['endorsementType'],
): NonFinancialEndorsementStep | null => {
  switch (endorsementType) {
    case 'InsuredUpdation':
      return 'insured-updation';
    case 'NomineeUpdate':
      return 'nominee-update';
    case 'DependentUpdation':
    case 'DependentAddition':
      return 'dependent-update';
    default:
      return null;
  }
};
