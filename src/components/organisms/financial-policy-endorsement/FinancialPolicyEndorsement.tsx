import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { FinancialPolicyEndorsementDateStep } from './FinancialPolicyEndorsementDateStep';
import { FinancialPolicyEndorsementHeader } from './FinancialPolicyEndorsementHeader';
import { FinancialPolicyEndorsementRefundBreakdownStep } from './FinancialPolicyEndorsementRefundBreakdownStep';
import { FinancialPolicyEndorsementRefundDestinationStep } from './FinancialPolicyEndorsementRefundDestinationStep';
import {
  ADD_NEW_BANK_ACCOUNT_VALUE,
  BANK_OPTIONS,
} from '@/lib/constants/policyEndorsement.constants';
import {
  usePolicyEndorsePolicyMutation,
  usePolicyDetailsQuery,
  usePolicyEndorsementTypeApplicableQuery,
  usePolicyRefundBankDetailsQuery,
  usePolicyRefundCalculationQuery,
  usePolicyValidateBankAccountMutation,
} from '@/lib/query/policyDetails.queries';
import { FinancialPolicyEndorsementStep, RefundDestination } from '@/lib/types/policy-endorsement';
import type {
  PolicyEndorseBankAccount,
  PolicyEndorsePolicyPayload,
  PolicyEndorsementType,
} from '@/lib/types/policy-management/policyRefundApi';
import {
  formatPolicyEndorsementDateTime,
  getEarlierPolicyDate,
  getEndorsementDateRange,
  getPolicyDateOnlyTime,
  getPolicyEndDate,
  getPolicyStartDate,
} from '@/lib/utils/policyDate.utils';
import type {
  BankAccountOption,
  BankValidationConfirmation,
  NewBankAccountFormValues,
} from '@/types/financialPolicyEndorsement';
import { DEFAULT_NEW_BANK_ACCOUNT_FORM } from '@/types/financialPolicyEndorsement';
import {
  getValidateBankAccountErrorMessage,
  getValidateBankAccountSuccessFeedback,
} from '@/lib/utils/validateBankAccount.utils';
import {
  CONFIRM_ACCOUNT_NUMBER_MISMATCH_MESSAGE,
  hasBlockingBankAccountValidationErrors,
  normalizeBankDetailText,
} from '@/lib/utils/bankAccountForm.utils';
import { useConfirmAccountNumberFeedback } from '@/lib/hooks/useConfirmAccountNumberFeedback';
import { useIfscCodeFormatFeedback } from '@/lib/hooks/useIfscCodeFormatFeedback';
import { getIfscCodeFieldError, normalizeIfscCode } from '@/lib/utils/ifscCode.utils';

export const FinancialPolicyEndorsement = ({
  policyNumber,
  policyId,
  plan,
  insuredName,
  endorsementType,
  onBackToEndorsementType,
  onEndorsementSuccess,
}: {
  policyNumber: string;
  policyId: string;
  plan: string;
  insuredName: string;
  endorsementType: string;
  onBackToEndorsementType: () => void;
  onEndorsementSuccess: () => Promise<void>;
}) => {
  const [activeStep, setActiveStep] = useState<FinancialPolicyEndorsementStep>(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [refundDestination, setRefundDestination] = useState<RefundDestination>('float');
  const [newBankAccountForm, setNewBankAccountForm] = useState<NewBankAccountFormValues>(
    DEFAULT_NEW_BANK_ACCOUNT_FORM,
  );
  const {
    feedback: confirmAccountNumberFeedback,
    markDirty: markConfirmAccountNumberValidationDirty,
    reset: resetConfirmAccountNumberValidation,
  } = useConfirmAccountNumberFeedback(
    newBankAccountForm.accountNumber,
    newBankAccountForm.confirmAccountNumber,
  );
  const {
    error: ifscCodeFormatError,
    markDirty: markIfscCodeValidationDirty,
    reset: resetIfscCodeValidation,
  } = useIfscCodeFormatFeedback(newBankAccountForm.ifscCode);
  const [dateError, setDateError] = useState('');
  const [selectedBankAccountError, setSelectedBankAccountError] = useState('');
  const [newBankAccountFormErrors, setNewBankAccountFormErrors] = useState<
    Partial<Record<keyof NewBankAccountFormValues, string>>
  >({});
  const [bankValidationConfirmation, setBankValidationConfirmation] =
    useState<BankValidationConfirmation | null>(null);
  const { data: policyDetailsResponse, isLoading: isPolicyDetailsLoading } = usePolicyDetailsQuery({
    policyNumber,
    enabled: Boolean(policyNumber),
  });
  const { data: endorsementTypeApplicableResponse } = usePolicyEndorsementTypeApplicableQuery({
    policyId,
    plan,
    enabled: endorsementType === 'PreClosure' || endorsementType === 'PolicyCancellation',
  });
  const policyDetails = policyDetailsResponse?.data?.policies?.[0];
  const policyStartDate = useMemo(() => {
    return getPolicyStartDate(policyDetails);
  }, [policyDetails]);
  const policyEndDate = useMemo(() => {
    return getPolicyEndDate(policyDetails);
  }, [policyDetails]);
  const endorsementDateRangeInfo = useMemo(
    () =>
      endorsementTypeApplicableResponse?.data?.endorsements?.FINANCIAL?.find(
        (endorsement) => endorsement.endorsementType === endorsementType,
      )?.preClosureDateRangeInfo,
    [endorsementType, endorsementTypeApplicableResponse?.data?.endorsements?.FINANCIAL],
  );
  const endorsementDateRange = useMemo(
    () =>
      getEndorsementDateRange({
        fromDate: endorsementDateRangeInfo?.fromDate,
        toDate: endorsementDateRangeInfo?.toDate,
      }),
    [endorsementDateRangeInfo?.fromDate, endorsementDateRangeInfo?.toDate],
  );
  const minSelectableEndorsementDate = endorsementDateRange.fromDate;
  const maxSelectableEndorsementDate = endorsementDateRange.toDate;
  const effectiveMinSelectableDate = minSelectableEndorsementDate ?? policyStartDate;
  const fallbackMaxSelectableDate = getEarlierPolicyDate(policyEndDate, new Date());
  const effectiveMaxSelectableDate = maxSelectableEndorsementDate ?? fallbackMaxSelectableDate;
  const selectedEndorsementDateTime = useMemo(
    () =>
      selectedDate ? formatPolicyEndorsementDateTime(selectedDate, effectiveMinSelectableDate) : '',
    [effectiveMinSelectableDate, selectedDate],
  );

  const {
    data: refundCalculationResponse,
    isLoading: isRefundCalculationLoading,
    isError: isRefundCalculationError,
  } = usePolicyRefundCalculationQuery({
    policyId,
    plan,
    cancelDate: selectedEndorsementDateTime,
    enabled: activeStep >= 2,
  });

  const {
    data: refundBankDetailsResponse,
    isLoading: isRefundBankDetailsLoading,
    isError: isRefundBankDetailsError,
  } = usePolicyRefundBankDetailsQuery({
    policyId,
    plan,
    enabled: activeStep === 3 && refundDestination === 'bank',
  });
  const { mutateAsync: validateBankAccount, isPending: isValidateBankAccountPending } =
    usePolicyValidateBankAccountMutation();
  const { mutateAsync: endorsePolicy, isPending: isEndorsePolicyPending } =
    usePolicyEndorsePolicyMutation();

  const bankAccountOptions = useMemo<BankAccountOption[]>(
    () =>
      (refundBankDetailsResponse?.data ?? []).map((account) => {
        const accountNumber = normalizeBankDetailText(account.accountNumber);
        const ifsc = normalizeBankDetailText(account.ifsc);
        const bankName = normalizeBankDetailText(account.bankName);
        const accountHolder = normalizeBankDetailText(account.accountHolder);

        return {
          value: `${accountNumber}-${ifsc}`,
          label: [bankName, accountHolder].filter(Boolean).join(' - ') || 'Bank account',
          details: account,
        };
      }),
    [refundBankDetailsResponse?.data],
  );

  const bankNameOptions = useMemo(() => {
    const uniqueBankNames = new Set(
      (refundBankDetailsResponse?.data ?? [])
        .map((bankDetail) => normalizeBankDetailText(bankDetail.bankName))
        .filter(Boolean),
    );

    BANK_OPTIONS.forEach((bankName) => uniqueBankNames.add(bankName));

    return [...uniqueBankNames];
  }, [refundBankDetailsResponse?.data]);

  const bankAccountSelectOptions = useMemo(
    () => [...bankAccountOptions, { value: ADD_NEW_BANK_ACCOUNT_VALUE, label: 'Add new account' }],
    [bankAccountOptions],
  );
  const insuredOptions = useMemo<Array<{ value: string; label: string }>>(() => {
    const persons = policyDetailsResponse?.data?.policies?.[0]?.persons ?? [];
    const insuredSelectOptions = persons
      .map((person, index) => {
        const insured = person.insured;
        const insuredNameValue = insured?.name?.trim();
        if (!insuredNameValue) {
          return null;
        }

        return {
          value: insured?.id ?? `insured-${index + 1}`,
          label: insuredNameValue,
        };
      })
      .filter((option): option is { value: string; label: string } => option !== null);

    if (insuredSelectOptions.length > 0) {
      return insuredSelectOptions;
    }

    const fallbackInsuredName = insuredName.trim();
    if (!fallbackInsuredName) {
      return [];
    }

    return [{ value: 'insured-1', label: fallbackInsuredName }];
  }, [insuredName, policyDetailsResponse?.data?.policies]);

  useEffect(() => {
    if (bankAccountOptions.length === 0) {
      setSelectedBankAccount('');
      return;
    }

    const hasSelectedAccount =
      selectedBankAccount === ADD_NEW_BANK_ACCOUNT_VALUE ||
      bankAccountOptions.some((account) => account.value === selectedBankAccount);
    if (!hasSelectedAccount) {
      setSelectedBankAccount(bankAccountOptions[0].value);
    }
  }, [bankAccountOptions, selectedBankAccount]);
  useEffect(() => {
    setNewBankAccountForm((previousState) => {
      if (!insuredOptions.length) {
        if (!previousState.insuredPersonId && !previousState.accountHolderName) {
          return previousState;
        }

        return {
          ...previousState,
          insuredPersonId: '',
          accountHolderName: '',
        };
      }

      const selectedInsuredOption =
        insuredOptions.find(
          (insuredOption) => insuredOption.value === previousState.insuredPersonId,
        ) ?? insuredOptions[0];

      if (
        previousState.insuredPersonId === selectedInsuredOption.value &&
        previousState.accountHolderName === selectedInsuredOption.label
      ) {
        return previousState;
      }

      return {
        ...previousState,
        insuredPersonId: selectedInsuredOption.value,
        accountHolderName: selectedInsuredOption.label,
      };
    });
  }, [insuredOptions]);

  const selectedAccountDetails =
    selectedBankAccount === ADD_NEW_BANK_ACCOUNT_VALUE
      ? undefined
      : bankAccountOptions.find((account) => account.value === selectedBankAccount)?.details;
  const isAddingNewBankAccount = selectedBankAccount === ADD_NEW_BANK_ACCOUNT_VALUE;
  const isShowingBankValidationConfirmation = bankValidationConfirmation !== null;
  const shouldShowExistingAccountError = isRefundBankDetailsError && !isAddingNewBankAccount;
  const isFirstStep = activeStep === 1;
  const isLastStep = activeStep === 3;
  const isDateWithinSelectionRange = (date: Date | undefined) => {
    if (!date) {
      return false;
    }

    const selectedDateTime = getPolicyDateOnlyTime(date);
    const minDateTime = effectiveMinSelectableDate
      ? getPolicyDateOnlyTime(effectiveMinSelectableDate)
      : undefined;
    const maxDateTime = effectiveMaxSelectableDate
      ? getPolicyDateOnlyTime(effectiveMaxSelectableDate)
      : undefined;

    return (
      (minDateTime === undefined || selectedDateTime >= minDateTime) &&
      (maxDateTime === undefined || selectedDateTime <= maxDateTime)
    );
  };
  const isNextDisabled = isFirstStep && !isDateWithinSelectionRange(selectedDate);
  const refundCalculation = refundCalculationResponse?.data;
  const isAwaitingBankValidation =
    isLastStep &&
    refundDestination === 'bank' &&
    isAddingNewBankAccount &&
    !isShowingBankValidationConfirmation;
  const hasBankAccountValidationErrors = useMemo(() => {
    if (!isAwaitingBankValidation) {
      return false;
    }

    return hasBlockingBankAccountValidationErrors({
      accountNumber: newBankAccountForm.accountNumber,
      confirmAccountNumber: newBankAccountForm.confirmAccountNumber,
      confirmAccountNumberFeedback,
      ifscCode: newBankAccountForm.ifscCode,
      ifscCodeFormatError,
    });
  }, [
    confirmAccountNumberFeedback,
    ifscCodeFormatError,
    isAwaitingBankValidation,
    newBankAccountForm.accountNumber,
    newBankAccountForm.confirmAccountNumber,
    newBankAccountForm.ifscCode,
  ]);

  const mapEndorsementTypeForApi = (): PolicyEndorsementType | null => {
    switch (endorsementType) {
      case 'PreClosure':
        return 'PRE_CLOSURE';
      case 'PolicyCancellation':
        return 'CANCELLATION';
      default:
        return null;
    }
  };

  const getSelectedBankAccountForPayload = (): PolicyEndorseBankAccount | null => {
    if (refundDestination !== 'bank') {
      return null;
    }

    if (isAddingNewBankAccount) {
      const bankName = newBankAccountForm.bankName.trim();
      const accountHolder = newBankAccountForm.accountHolderName.trim();
      const accountNumber = newBankAccountForm.accountNumber.trim();
      const ifsc = newBankAccountForm.ifscCode.trim().toUpperCase();

      if (!bankName || !accountHolder || !accountNumber || !ifsc) {
        return null;
      }

      return {
        bankName,
        accountHolder,
        accountNumber,
        ifsc,
      };
    }

    if (!selectedAccountDetails) {
      return null;
    }

    return {
      bankName: normalizeBankDetailText(selectedAccountDetails.bankName),
      accountHolder: normalizeBankDetailText(selectedAccountDetails.accountHolder),
      accountNumber: normalizeBankDetailText(selectedAccountDetails.accountNumber),
      ifsc: normalizeBankDetailText(selectedAccountDetails.ifsc),
    };
  };

  const handleBack = () => {
    if (isLastStep && isShowingBankValidationConfirmation) {
      setBankValidationConfirmation(null);
      return;
    }

    if (isFirstStep) {
      onBackToEndorsementType();
      return;
    }

    setActiveStep((previousStep) => (previousStep - 1) as FinancialPolicyEndorsementStep);
  };

  const handleNext = () => {
    if (isNextDisabled) {
      if (isFirstStep) {
        setDateError('Please select a date within the allowed range');
      }
      return;
    }
    setDateError('');

    if (isLastStep) {
      return;
    }

    setActiveStep((previousStep) => (previousStep + 1) as FinancialPolicyEndorsementStep);
  };

  const handleSubmitRequest = async () => {
    if (!isLastStep) {
      return;
    }

    if (!isDateWithinSelectionRange(selectedDate)) {
      setDateError('Please select a date within the allowed range');
      return;
    }
    setDateError('');

    const endorsementTypeForApi = mapEndorsementTypeForApi();
    if (!endorsementTypeForApi) {
      toast.error('Unsupported endorsement type selected');
      return;
    }

    if (
      refundDestination === 'bank' &&
      isAddingNewBankAccount &&
      !isShowingBankValidationConfirmation
    ) {
      const accountNumber = newBankAccountForm.accountNumber.trim();
      const confirmAccountNumber = newBankAccountForm.confirmAccountNumber.trim();
      const accountHolderName = newBankAccountForm.accountHolderName.trim();
      const ifsc = newBankAccountForm.ifscCode.trim().toUpperCase();
      const nextFormErrors: Partial<Record<keyof NewBankAccountFormValues, string>> = {
        insuredPersonId: newBankAccountForm.insuredPersonId.trim()
          ? ''
          : 'Please select insured person',
        bankName: newBankAccountForm.bankName.trim() ? '' : 'Please select bank',
        accountNumber: accountNumber ? '' : 'Please enter account number',
        confirmAccountNumber: confirmAccountNumber ? '' : 'Please confirm account number',
        accountHolderName: accountHolderName ? '' : 'Please select insured person',
        ifscCode: getIfscCodeFieldError(ifsc, 'Please enter IFSC code'),
      };

      if (accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber) {
        nextFormErrors.confirmAccountNumber = CONFIRM_ACCOUNT_NUMBER_MISMATCH_MESSAGE;
      }

      const hasFormErrors = Object.values(nextFormErrors).some(Boolean);
      if (hasFormErrors) {
        setNewBankAccountFormErrors(nextFormErrors);
        return;
      }
      setNewBankAccountFormErrors({});

      try {
        const response = await validateBankAccount({
          accountNumber,
          ifsc: normalizeIfscCode(ifsc),
          accountHolderName,
        });
        const validationData = response.data;
        const validationFeedback = getValidateBankAccountSuccessFeedback(
          validationData,
          response.message,
        );

        if (validationFeedback) {
          setBankValidationConfirmation(null);
          setNewBankAccountFormErrors((previousErrors) => ({
            ...previousErrors,
            ...(validationFeedback.accountHolderNameError
              ? { accountHolderName: validationFeedback.accountHolderNameError }
              : {}),
            ...(validationFeedback.accountNumberError
              ? { accountNumber: validationFeedback.accountNumberError }
              : {}),
          }));
          toast.error(validationFeedback.toastMessage);
          return;
        }

        const bankAccountName =
          validationData.verifiedAccountHolderName.trim() || accountHolderName;
        const policyHolderName = accountHolderName;

        setBankValidationConfirmation({
          policyHolderName,
          bankAccountName,
          isNameMatch: areNamesMatching(policyHolderName, bankAccountName),
        });
      } catch (error) {
        toast.error(getValidateBankAccountErrorMessage(error));
        console.error('validate-bank-account failed', error);
      }

      return;
    }

    const bankAccount = getSelectedBankAccountForPayload();
    if (refundDestination === 'bank' && !bankAccount) {
      setSelectedBankAccountError('Please select or add valid bank account details');
      return;
    }
    setSelectedBankAccountError('');

    const updatedOn = selectedEndorsementDateTime;
    const payload: PolicyEndorsePolicyPayload =
      refundDestination === 'float'
        ? {
            plan,
            endorsementType: endorsementTypeForApi,
            updatedOn,
            refundMode: 'FLOAT',
          }
        : {
            plan,
            endorsementType: endorsementTypeForApi,
            updatedOn,
            refundMode: 'ACCOUNT',
            bankAccount: bankAccount as PolicyEndorseBankAccount,
          };

    try {
      const response = await endorsePolicy({
        policyId,
        payload,
      });
      toast.success(response.message ?? 'Endorsement request submitted successfully');
      await onEndorsementSuccess();
    } catch (error) {
      toast.error('Unable to submit endorsement request');
      console.error('endorse-policy failed', error);
    }
  };

  const handleNewBankAccountFormChange = (field: keyof NewBankAccountFormValues, value: string) => {
    if (field === 'insuredPersonId') {
      const selectedInsuredName =
        insuredOptions.find((insuredOption) => insuredOption.value === value)?.label ?? '';

      setNewBankAccountForm((previousState) => ({
        ...previousState,
        insuredPersonId: value,
        accountHolderName: selectedInsuredName,
      }));
      setNewBankAccountFormErrors((previousErrors) => ({
        ...previousErrors,
        insuredPersonId: '',
        accountHolderName: '',
      }));

      if (bankValidationConfirmation) {
        setBankValidationConfirmation(null);
      }
      return;
    }

    setNewBankAccountForm((previousState) => ({
      ...previousState,
      [field]: field === 'ifscCode' ? normalizeIfscCode(value) : value,
    }));
    setNewBankAccountFormErrors((previousErrors) => ({
      ...previousErrors,
      [field]: '',
    }));

    if (field === 'accountNumber' || field === 'confirmAccountNumber') {
      markConfirmAccountNumberValidationDirty();
    }

    if (field === 'ifscCode') {
      markIfscCodeValidationDirty();
    }

    if (bankValidationConfirmation) {
      setBankValidationConfirmation(null);
    }
  };

  const handleSelectedBankAccountChange = (value: string) => {
    setSelectedBankAccount(value);
    setSelectedBankAccountError('');
    resetConfirmAccountNumberValidation();
    resetIfscCodeValidation();
  };

  useEffect(() => {
    if (refundDestination !== 'bank' || !isAddingNewBankAccount) {
      setBankValidationConfirmation(null);
    }
  }, [isAddingNewBankAccount, refundDestination]);

  const finalStepButtonText = useMemo(() => {
    if (
      isLastStep &&
      isShowingBankValidationConfirmation &&
      !bankValidationConfirmation?.isNameMatch
    ) {
      return 'Review details';
    }

    return isLastStep ? 'Submit request' : 'Next';
  }, [isLastStep, isShowingBankValidationConfirmation, bankValidationConfirmation?.isNameMatch]);

  const handlePrimaryAction = () => {
    if (
      isLastStep &&
      isShowingBankValidationConfirmation &&
      bankValidationConfirmation &&
      !bankValidationConfirmation.isNameMatch
    ) {
      setBankValidationConfirmation(null);
      return;
    }

    if (isLastStep) {
      return handleSubmitRequest();
    }

    return handleNext();
  };

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <FinancialPolicyEndorsementDateStep
            endorsementType={endorsementType}
            selectedDate={selectedDate}
            minSelectableDate={effectiveMinSelectableDate}
            maxSelectableDate={effectiveMaxSelectableDate}
            allowedRangeFromDate={endorsementDateRangeInfo?.fromDate}
            allowedRangeToDate={endorsementDateRangeInfo?.toDate}
            dateError={dateError}
            onSelectDate={(date) => {
              if (!date) {
                setSelectedDate(undefined);
                setDateError('');
                return;
              }

              if (!isDateWithinSelectionRange(date)) {
                setSelectedDate(undefined);
                setDateError('Please select a date within the allowed range');
                return;
              }

              setSelectedDate(date);
              setDateError('');
            }}
          />
        );
      case 2:
        return (
          <FinancialPolicyEndorsementRefundBreakdownStep
            refundCalculation={refundCalculation}
            isRefundCalculationLoading={isRefundCalculationLoading}
            isRefundCalculationError={isRefundCalculationError}
          />
        );
      case 3:
        return (
          <FinancialPolicyEndorsementRefundDestinationStep
            refundDestination={refundDestination}
            onRefundDestinationChange={setRefundDestination}
            isShowingBankValidationConfirmation={isShowingBankValidationConfirmation}
            bankValidationConfirmation={bankValidationConfirmation}
            selectedBankAccount={selectedBankAccount}
            onSelectedBankAccountChange={handleSelectedBankAccountChange}
            bankAccountSelectOptions={bankAccountSelectOptions}
            insuredOptions={insuredOptions}
            isInsuredOptionsLoading={isPolicyDetailsLoading}
            isRefundBankDetailsLoading={isRefundBankDetailsLoading}
            isAddingNewBankAccount={isAddingNewBankAccount}
            newBankAccountForm={newBankAccountForm}
            onNewBankAccountFormChange={handleNewBankAccountFormChange}
            confirmAccountNumberFeedback={confirmAccountNumberFeedback}
            ifscCodeFormatError={ifscCodeFormatError}
            bankNameOptions={bankNameOptions}
            shouldShowExistingAccountError={shouldShowExistingAccountError}
            selectedAccountDetails={selectedAccountDetails}
            selectedBankAccountError={selectedBankAccountError}
            newBankAccountFormErrors={newBankAccountFormErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 min-w-endorse-modal-width">
      <FinancialPolicyEndorsementHeader
        endorsementType={endorsementType}
        policyNumber={policyNumber}
      />
      {renderCurrentStep()}
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleBack}>
          {'Back'}
        </Button>
        <Button
          type="button"
          onClick={handlePrimaryAction}
          disabled={
            isNextDisabled ||
            hasBankAccountValidationErrors ||
            isValidateBankAccountPending ||
            isEndorsePolicyPending
          }
          className="bg-claims-details-action-button-bg text-claims-details-action-button-text hover:bg-claims-details-action-button-hover-bg hover:text-claims-details-action-button-hover-text shadow-claims-details-action-button"
        >
          {isEndorsePolicyPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          ) : isAwaitingBankValidation ? (
            'Next'
          ) : (
            finalStepButtonText
          )}
        </Button>
      </div>
    </div>
  );
};

const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
const areNamesMatching = (left: string, right: string) =>
  Boolean(left.trim() && right.trim()) && normalizeName(left) === normalizeName(right);
