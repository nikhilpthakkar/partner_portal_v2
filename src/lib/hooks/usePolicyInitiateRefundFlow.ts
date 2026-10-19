'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ADD_NEW_BANK_ACCOUNT_VALUE } from '@/lib/constants/policyEndorsement.constants';
import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';
import {
  usePolicyManualRefundMutation,
  usePolicyReinitiateRefundMutation,
  usePolicyRefundBankDetailsQuery,
  usePolicyValidateBankAccountMutation,
} from '@/lib/query/policyDetails.queries';
import type {
  PolicyRefundBankDetail,
  PolicyRefundDetailsData,
} from '@/lib/types/policy-management/policyRefundApi';
import type {
  PolicyManualRefundDestination,
  PolicyManualRefundFormErrors,
  PolicyManualRefundFormValues,
} from '@/lib/types/policy-management/policyManualRefund';
import type {
  PolicyReinitiateRefundContext,
  PolicyReinitiateRefundFormErrors,
  PolicyReinitiateRefundFormValues,
  PolicyRetryRefundOption,
} from '@/lib/types/policy-management/policyReinitiateRefund';
import type { RefundDestination } from '@/lib/types/policy-endorsement';
import { formatCurrency } from '@/lib/utils';
import {
  getLatestPolicyRefundEntry,
  getReinitiateRefundEntry,
  mapRefundUserTypeToEntityType,
} from '@/lib/utils/policyRefundDetails.utils';
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

type UsePolicyInitiateRefundFlowParams = {
  open: boolean;
  policyNumber: string;
  policyId: string;
  plan: string;
  insuredName: string;
  refundDetails?: PolicyRefundDetailsData;
  entryMode?: 'default' | 'manual';
  onSuccess: () => Promise<void>;
  onClose: () => void;
};

const DEFAULT_MANUAL_REFUND_FORM: PolicyManualRefundFormValues = {
  policyNumber: '',
  accountHolderName: '',
  remark: '',
  utr: '',
  bankAccountDetails: '',
  ifsc: '',
  refundAmount: '',
  priority: 'P0',
  refundDestination: '',
};

const DEFAULT_REINITIATE_REFUND_FORM: PolicyReinitiateRefundFormValues = {
  bankName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  accountHolderName: '',
  ifscCode: '',
};

const mapBankDetailsToFormValues = (
  bankDetails: PolicyRefundBankDetail,
): PolicyReinitiateRefundFormValues => {
  const accountNumber = normalizeBankDetailText(bankDetails.accountNumber);

  return {
    bankName: normalizeBankDetailText(bankDetails.bankName),
    accountNumber,
    confirmAccountNumber: accountNumber,
    accountHolderName: normalizeBankDetailText(bankDetails.accountHolder),
    ifscCode: normalizeBankDetailText(bankDetails.ifsc).toUpperCase(),
  };
};

const parseRefundAmount = (value: string): number | null => {
  const normalized = value.replace(/[₹,\s]/g, '').trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const buildManualRefundFormDefaults = ({
  policyNumber,
  insuredName,
  refundDetails,
}: {
  policyNumber: string;
  insuredName: string;
  refundDetails?: PolicyRefundDetailsData;
}): PolicyManualRefundFormValues => {
  const latestRefund = getLatestPolicyRefundEntry(refundDetails);
  const manualRefundAmount =
    refundDetails?.activeManualRefund?.refundAmount ?? latestRefund?.refundAmount;
  const customerAccountDetails = latestRefund?.customerAccountDetails;
  const bankAccountNumber = customerAccountDetails?.number?.trim() ?? '';
  const accountHolderName =
    customerAccountDetails?.name?.trim() || insuredName.trim();
  const ifsc = customerAccountDetails?.ifsc?.trim().toUpperCase() ?? '';

  return {
    ...DEFAULT_MANUAL_REFUND_FORM,
    policyNumber: policyNumber.trim(),
    accountHolderName,
    bankAccountDetails: bankAccountNumber,
    ifsc,
    refundAmount:
      typeof manualRefundAmount === 'number' && manualRefundAmount > 0
        ? formatCurrency(manualRefundAmount)
        : '',
  };
};

const EMPTY_BANK_ACCOUNT_SELECTION = '';

const buildReinitiateRefundFormFromPrimaryRefund = (
  refundDetails?: PolicyRefundDetailsData,
): {
  formValues: PolicyReinitiateRefundFormValues;
  context: PolicyReinitiateRefundContext;
} => {
  const customerRefundEntry = refundDetails?.refunds?.[0];
  const reinitiateRefundEntry = getReinitiateRefundEntry(refundDetails);
  const customerAccountDetails = customerRefundEntry?.customerAccountDetails;
  const accountNumber = customerAccountDetails?.number?.trim() ?? '';
  const ifscCode = customerAccountDetails?.ifsc?.trim().toUpperCase() ?? '';
  const accountHolderName = customerAccountDetails?.name?.trim() ?? '';
  const bankName = customerAccountDetails?.bankName?.trim() ?? '';

  return {
    formValues: {
      bankName,
      accountNumber,
      confirmAccountNumber: accountNumber,
      accountHolderName,
      ifscCode,
    },
    context: {
      paymentId:
        reinitiateRefundEntry?.paymentId?.trim() ||
        reinitiateRefundEntry?.cashfreeTransferId?.trim() ||
        '',
      entityType: mapRefundUserTypeToEntityType(reinitiateRefundEntry?.userType),
      bankName,
    },
  };
};

const EMPTY_REINITIATE_REFUND_FORM: PolicyReinitiateRefundFormValues = {
  bankName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  accountHolderName: '',
  ifscCode: '',
};

type CashfreeModalBaseline = {
  retryRefundOption: PolicyRetryRefundOption;
  formValues: PolicyReinitiateRefundFormValues;
  selectedBankAccount: string;
};

const normalizeReinitiateRefundFormValues = (
  values: PolicyReinitiateRefundFormValues,
): PolicyReinitiateRefundFormValues => ({
  bankName: values.bankName.trim(),
  accountNumber: values.accountNumber.trim(),
  confirmAccountNumber: values.confirmAccountNumber.trim(),
  accountHolderName: values.accountHolderName.trim(),
  ifscCode: values.ifscCode.trim().toUpperCase(),
});

const areReinitiateRefundFormValuesEqual = (
  left: PolicyReinitiateRefundFormValues,
  right: PolicyReinitiateRefundFormValues,
): boolean => {
  const normalizedLeft = normalizeReinitiateRefundFormValues(left);
  const normalizedRight = normalizeReinitiateRefundFormValues(right);

  return (
    normalizedLeft.bankName === normalizedRight.bankName &&
    normalizedLeft.accountNumber === normalizedRight.accountNumber &&
    normalizedLeft.confirmAccountNumber === normalizedRight.confirmAccountNumber &&
    normalizedLeft.accountHolderName === normalizedRight.accountHolderName &&
    normalizedLeft.ifscCode === normalizedRight.ifscCode
  );
};

const applyRetryRefundOptionToForm = ({
  option,
  refundDetails,
}: {
  option: PolicyRetryRefundOption;
  refundDetails?: PolicyRefundDetailsData;
}): {
  formValues: PolicyReinitiateRefundFormValues;
  context: PolicyReinitiateRefundContext;
  selectedBankAccount: string;
} => {
  const reinitiateDefaults = buildReinitiateRefundFormFromPrimaryRefund(refundDetails);

  if (option === 'add_bank_account') {
    return {
      formValues: EMPTY_REINITIATE_REFUND_FORM,
      context: reinitiateDefaults.context,
      selectedBankAccount: ADD_NEW_BANK_ACCOUNT_VALUE,
    };
  }

  if (option === 'partner_bank_account') {
    return {
      formValues: EMPTY_REINITIATE_REFUND_FORM,
      context: reinitiateDefaults.context,
      selectedBankAccount: EMPTY_BANK_ACCOUNT_SELECTION,
    };
  }

  return {
    formValues: reinitiateDefaults.formValues,
    context: reinitiateDefaults.context,
    selectedBankAccount: EMPTY_BANK_ACCOUNT_SELECTION,
  };
};

export const usePolicyInitiateRefundFlow = ({
  open,
  policyNumber,
  policyId,
  plan,
  insuredName,
  refundDetails,
  entryMode = 'default',
  onSuccess,
  onClose,
}: UsePolicyInitiateRefundFlowParams) => {
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [refundDestination, setRefundDestination] = useState<RefundDestination>('bank');
  const [retryRefundOption, setRetryRefundOption] =
    useState<PolicyRetryRefundOption>('correct_bank_details');
  const [manualRefundForm, setManualRefundForm] = useState<PolicyManualRefundFormValues>(
    DEFAULT_MANUAL_REFUND_FORM,
  );
  const [manualRefundFormErrors, setManualRefundFormErrors] =
    useState<PolicyManualRefundFormErrors>({});
  const [reinitiateRefundForm, setReinitiateRefundForm] =
    useState<PolicyReinitiateRefundFormValues>(DEFAULT_REINITIATE_REFUND_FORM);
  const {
    feedback: confirmAccountNumberFeedback,
    markDirty: markConfirmAccountNumberValidationDirty,
    reset: resetConfirmAccountNumberValidation,
  } = useConfirmAccountNumberFeedback(
    reinitiateRefundForm.accountNumber,
    reinitiateRefundForm.confirmAccountNumber,
  );
  const {
    error: ifscCodeFormatError,
    markDirty: markIfscCodeValidationDirty,
    reset: resetIfscCodeValidation,
  } = useIfscCodeFormatFeedback(reinitiateRefundForm.ifscCode);
  const [reinitiateRefundFormErrors, setReinitiateRefundFormErrors] =
    useState<PolicyReinitiateRefundFormErrors>({});
  const [reinitiateRefundContext, setReinitiateRefundContext] =
    useState<PolicyReinitiateRefundContext>({
      paymentId: '',
      entityType: 'user',
      bankName: '',
    });
  const [selectedBankAccount, setSelectedBankAccount] = useState(EMPTY_BANK_ACCOUNT_SELECTION);
  const [selectedBankAccountError, setSelectedBankAccountError] = useState('');
  const [isCashfreeModalOpen, setIsCashfreeModalOpen] = useState(false);
  const [cashfreeModalBaseline, setCashfreeModalBaseline] = useState<CashfreeModalBaseline | null>(
    null,
  );

  const {
    data: refundBankDetailsResponse,
    isLoading: isRefundBankDetailsLoading,
    isError: hasPartnerBankDetailsError,
  } = usePolicyRefundBankDetailsQuery({
    policyId,
    plan,
    enabled: open && isCashfreeModalOpen && retryRefundOption === 'partner_bank_account',
  });

  const { mutateAsync: submitManualRefund, isPending: isManualRefundPending } =
    usePolicyManualRefundMutation();
  const { mutateAsync: submitReinitiateRefund, isPending: isReinitiateRefundPending } =
    usePolicyReinitiateRefundMutation();
  const { mutateAsync: validateBankAccount, isPending: isValidateBankAccountPending } =
    usePolicyValidateBankAccountMutation();

  const bankAccountOptions = useMemo(
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

  const bankAccountSelectOptions = useMemo(() => {
    const partnerOptions = bankAccountOptions.map((account) => ({
      value: account.value,
      label: account.label,
    }));

    if (retryRefundOption === 'partner_bank_account') {
      return partnerOptions;
    }

    return [
      ...partnerOptions,
      { value: ADD_NEW_BANK_ACCOUNT_VALUE, label: 'Add new account' },
    ];
  }, [bankAccountOptions, retryRefundOption]);

  const selectedAccountDetails =
    selectedBankAccount &&
    selectedBankAccount !== ADD_NEW_BANK_ACCOUNT_VALUE &&
    selectedBankAccount !== EMPTY_BANK_ACCOUNT_SELECTION
      ? bankAccountOptions.find((account) => account.value === selectedBankAccount)?.details
      : undefined;
  const isAddingNewBankAccount =
    retryRefundOption === 'add_bank_account' ||
    selectedBankAccount === ADD_NEW_BANK_ACCOUNT_VALUE;

  useEffect(() => {
    if (!open) {
      setActiveStep(1);
      setRefundDestination('bank');
      setRetryRefundOption('correct_bank_details');
      setManualRefundForm(DEFAULT_MANUAL_REFUND_FORM);
      setManualRefundFormErrors({});
      setReinitiateRefundForm(DEFAULT_REINITIATE_REFUND_FORM);
      setReinitiateRefundFormErrors({});
      resetConfirmAccountNumberValidation();
      resetIfscCodeValidation();
      setReinitiateRefundContext({ paymentId: '', entityType: 'user', bankName: '' });
      setSelectedBankAccount(EMPTY_BANK_ACCOUNT_SELECTION);
      setSelectedBankAccountError('');
      setIsCashfreeModalOpen(false);
      setCashfreeModalBaseline(null);
      return;
    }

    setManualRefundForm(
      buildManualRefundFormDefaults({
        policyNumber,
        insuredName,
        refundDetails,
      }),
    );

    const reinitiateDefaults = buildReinitiateRefundFormFromPrimaryRefund(refundDetails);
    setReinitiateRefundForm(reinitiateDefaults.formValues);
    resetConfirmAccountNumberValidation();
    resetIfscCodeValidation();
    setReinitiateRefundContext(reinitiateDefaults.context);
    setSelectedBankAccount(EMPTY_BANK_ACCOUNT_SELECTION);

    if (entryMode === 'manual') {
      setRefundDestination('float');
      setActiveStep(2);
      return;
    }

    setRefundDestination('bank');
    setRetryRefundOption('correct_bank_details');
    setActiveStep(1);
    setIsCashfreeModalOpen(false);
  }, [entryMode, insuredName, open, policyNumber, refundDetails, resetConfirmAccountNumberValidation, resetIfscCodeValidation]);

  useEffect(() => {
    if (
      !open ||
      !isCashfreeModalOpen ||
      retryRefundOption !== 'partner_bank_account' ||
      isRefundBankDetailsLoading ||
      bankAccountOptions.length === 0 ||
      selectedBankAccount !== EMPTY_BANK_ACCOUNT_SELECTION
    ) {
      return;
    }

    const defaultPartnerAccount = bankAccountOptions[0];
    const partnerFormValues = mapBankDetailsToFormValues(defaultPartnerAccount.details);

    setSelectedBankAccount(defaultPartnerAccount.value);
    setReinitiateRefundForm(partnerFormValues);
    resetConfirmAccountNumberValidation();
    resetIfscCodeValidation();
    setReinitiateRefundContext((previousState) => ({
      ...previousState,
      bankName: partnerFormValues.bankName,
    }));
  }, [
    bankAccountOptions,
    isCashfreeModalOpen,
    isRefundBankDetailsLoading,
    open,
    resetConfirmAccountNumberValidation,
    resetIfscCodeValidation,
    retryRefundOption,
    selectedBankAccount,
  ]);

  const handleRetryRefundOptionChange = (option: PolicyRetryRefundOption) => {
    setRetryRefundOption(option);
    setReinitiateRefundFormErrors({});
    setSelectedBankAccountError('');

    const nextFormState = applyRetryRefundOptionToForm({ option, refundDetails });
    setReinitiateRefundForm(nextFormState.formValues);
    resetConfirmAccountNumberValidation();
    resetIfscCodeValidation();
    setReinitiateRefundContext(nextFormState.context);
    setSelectedBankAccount(nextFormState.selectedBankAccount);
  };

  const handleRefundDestinationChange = (destination: RefundDestination) => {
    setRefundDestination(destination);
    setManualRefundFormErrors({});
    setIsCashfreeModalOpen(false);
  };

  const openCashfreeModal = () => {
    setRetryRefundOption('correct_bank_details');
    const nextFormState = applyRetryRefundOptionToForm({
      option: 'correct_bank_details',
      refundDetails,
    });
    setRefundDestination('bank');
    setReinitiateRefundForm(nextFormState.formValues);
    resetConfirmAccountNumberValidation();
    resetIfscCodeValidation();
    setReinitiateRefundContext(nextFormState.context);
    setReinitiateRefundFormErrors({});
    setSelectedBankAccount(nextFormState.selectedBankAccount);
    setSelectedBankAccountError('');
    setCashfreeModalBaseline({
      retryRefundOption: 'correct_bank_details',
      formValues: nextFormState.formValues,
      selectedBankAccount: nextFormState.selectedBankAccount,
    });
    setIsCashfreeModalOpen(true);
  };

  const closeCashfreeModal = () => {
    setIsCashfreeModalOpen(false);
  };

  const handleBack = () => {
    if (activeStep === 2) {
      setActiveStep(1);
      return;
    }

    onClose();
  };

  const handleManualRefundFieldChange = (
    field: keyof PolicyManualRefundFormValues,
    value: string,
  ) => {
    setManualRefundForm((previousState) => ({
      ...previousState,
      [field]: value,
    }));
    setManualRefundFormErrors((previousErrors) => ({
      ...previousErrors,
      [field]: '',
    }));
  };

  const handleReinitiateRefundFieldChange = (
    field: keyof PolicyReinitiateRefundFormValues,
    value: string,
  ) => {
    setReinitiateRefundForm((previousState) => ({
      ...previousState,
      [field]: field === 'ifscCode' ? normalizeIfscCode(value) : value,
    }));
    setReinitiateRefundFormErrors((previousErrors) => ({
      ...previousErrors,
      [field]: '',
    }));

    if (field === 'accountNumber' || field === 'confirmAccountNumber') {
      markConfirmAccountNumberValidationDirty();
    }

    if (field === 'ifscCode') {
      markIfscCodeValidationDirty();
    }
  };

  const handleSelectedBankAccountChange = (value: string) => {
    setSelectedBankAccount(value);
    setSelectedBankAccountError('');
    setReinitiateRefundFormErrors({});
    resetConfirmAccountNumberValidation();
    resetIfscCodeValidation();

    if (value === ADD_NEW_BANK_ACCOUNT_VALUE) {
      const reinitiateDefaults = buildReinitiateRefundFormFromPrimaryRefund(refundDetails);
      setReinitiateRefundForm(reinitiateDefaults.formValues);
      setReinitiateRefundContext(reinitiateDefaults.context);
      return;
    }

    const selectedAccount = bankAccountOptions.find((account) => account.value === value);
    if (!selectedAccount) {
      return;
    }

    const partnerFormValues = mapBankDetailsToFormValues(selectedAccount.details);
    setReinitiateRefundForm(partnerFormValues);
    setReinitiateRefundContext((previousState) => ({
      ...previousState,
      bankName: partnerFormValues.bankName,
    }));
  };

  const validateManualRefundForm = (): boolean => {
    const policyNumberValue = manualRefundForm.policyNumber.trim();
    const accountHolderName = manualRefundForm.accountHolderName.trim();
    const bankAccountDetails = manualRefundForm.bankAccountDetails.trim();
    const ifsc = manualRefundForm.ifsc.trim().toUpperCase();
    const refundAmount = parseRefundAmount(manualRefundForm.refundAmount);
    const priority = manualRefundForm.priority.trim();
    const refundDestination = manualRefundForm.refundDestination.trim();

    const nextErrors: PolicyManualRefundFormErrors = {
      policyNumber: policyNumberValue ? '' : 'Please enter policy number',
      accountHolderName: accountHolderName ? '' : 'Please enter account holder name',
      bankAccountDetails: bankAccountDetails ? '' : 'Please enter bank account details',
      ifsc: getIfscCodeFieldError(ifsc, 'IFSC code is required for manual refund'),
      refundAmount: refundAmount ? '' : 'Please enter a valid refund amount',
      priority: priority ? '' : 'Please select priority',
      refundDestination: refundDestination ? '' : 'Please select refund destination',
    };

    const hasFormErrors = Object.values(nextErrors).some(Boolean);
    if (hasFormErrors) {
      setManualRefundFormErrors(nextErrors);
      return false;
    }

    setManualRefundFormErrors({});
    return true;
  };

  const validateReinitiateRefundForm = (): boolean => {
    if (retryRefundOption === 'partner_bank_account' && !selectedBankAccount.trim()) {
      setSelectedBankAccountError('Please select a bank account');
      return false;
    }

    if (retryRefundOption === 'partner_bank_account') {
      if (!reinitiateRefundContext.paymentId.trim()) {
        toast.error('Unable to re-initiate refund: payment details are missing');
        return false;
      }

      setReinitiateRefundFormErrors({});
      setSelectedBankAccountError('');
      return true;
    }

    const accountNumber = reinitiateRefundForm.accountNumber.trim();
    const confirmAccountNumber = reinitiateRefundForm.confirmAccountNumber.trim();
    const accountHolderName = reinitiateRefundForm.accountHolderName.trim();
    const ifscCode = reinitiateRefundForm.ifscCode.trim().toUpperCase();

    const nextErrors: PolicyReinitiateRefundFormErrors = {
      accountNumber: accountNumber ? '' : 'Please enter account number',
      confirmAccountNumber: confirmAccountNumber ? '' : 'Please confirm account number',
      accountHolderName: accountHolderName ? '' : 'Please enter account holder name',
      ifscCode: getIfscCodeFieldError(ifscCode, 'Please enter IFSC code'),
    };

    if (accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber) {
      nextErrors.confirmAccountNumber = CONFIRM_ACCOUNT_NUMBER_MISMATCH_MESSAGE;
    }

    if (!reinitiateRefundContext.paymentId.trim()) {
      toast.error('Unable to re-initiate refund: payment details are missing');
      return false;
    }

    const hasFormErrors = Object.values(nextErrors).some(Boolean);
    if (hasFormErrors) {
      setReinitiateRefundFormErrors(nextErrors);
      return false;
    }

    setReinitiateRefundFormErrors({});
    return true;
  };

  const submitManualRefundRequest = async () => {
    if (!validateManualRefundForm()) {
      return;
    }

    const refundAmount = parseRefundAmount(manualRefundForm.refundAmount);
    if (!refundAmount) {
      return;
    }

    try {
      const response = await submitManualRefund({
        policyId,
        payload: {
          plan,
          accountNumber: manualRefundForm.bankAccountDetails.trim(),
          ifsc: manualRefundForm.ifsc.trim().toUpperCase(),
          accountHolder: manualRefundForm.accountHolderName.trim(),
          refundAmount,
          remark: manualRefundForm.remark.trim(),
          ...(manualRefundForm.utr.trim() ? { utr: manualRefundForm.utr.trim() } : {}),
          priority: manualRefundForm.priority.trim(),
          refundDestination: manualRefundForm.refundDestination as PolicyManualRefundDestination,
        },
      });
      toast.success(response.message ?? 'Manual refund request submitted successfully');
      onClose();
      await onSuccess();
    } catch (error) {
      toast.error('Unable to submit manual refund request');
      console.error('manual-refund failed', error);
    }
  };

  const submitReinitiateRefundRequest = async () => {
    if (!validateReinitiateRefundForm()) {
      return;
    }

    const accountNumber = reinitiateRefundForm.accountNumber.trim();
    const ifsc = reinitiateRefundForm.ifscCode.trim().toUpperCase();
    const accountHolderName = reinitiateRefundForm.accountHolderName.trim();
    const bankName =
      reinitiateRefundForm.bankName.trim() ||
      normalizeBankDetailText(selectedAccountDetails?.bankName) ||
      reinitiateRefundContext.bankName.trim();

    if (retryRefundOption === 'partner_bank_account') {
      try {
        const response = await submitReinitiateRefund({
          policyId,
          payload: {
            plan,
            paymentId: reinitiateRefundContext.paymentId.trim(),
            entityType: reinitiateRefundContext.entityType.trim(),
            accountDetails: {
              accountNumber,
              ifsc,
              accountHolder: accountHolderName,
              bankName,
            },
          },
        });
        toast.success(response.message ?? 'Refund re-initiated successfully');
        onClose();
        await onSuccess();
      } catch (error) {
        toast.error('Unable to re-initiate refund');
        console.error('reinitiate-refund failed', error);
      }
      return;
    }

    try {
      const validationResponse = await validateBankAccount({
        accountNumber,
        ifsc,
        accountHolderName,
      });
      const validationFeedback = getValidateBankAccountSuccessFeedback(
        validationResponse.data,
        validationResponse.message,
      );

      if (validationFeedback) {
        setReinitiateRefundFormErrors((previousErrors) => ({
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
    } catch (error) {
      toast.error(getValidateBankAccountErrorMessage(error));
      console.error('validate-bank-account failed', error);
      return;
    }

    try {
      const response = await submitReinitiateRefund({
        policyId,
        payload: {
          plan,
          paymentId: reinitiateRefundContext.paymentId.trim(),
          entityType: reinitiateRefundContext.entityType.trim(),
          accountDetails: {
            accountNumber,
            ifsc,
            accountHolder: accountHolderName,
            bankName,
          },
        },
      });
      toast.success(response.message ?? 'Refund re-initiated successfully');
      onClose();
      await onSuccess();
    } catch (error) {
      toast.error('Unable to re-initiate refund');
      console.error('reinitiate-refund failed', error);
    }
  };

  const handlePrimaryAction = async () => {
    if (activeStep === 1) {
      if (refundDestination === 'bank') {
        openCashfreeModal();
        return;
      }

      setActiveStep(2);
      return;
    }

    await submitManualRefundRequest();
  };

  const handleCashfreeSubmit = async () => {
    await submitReinitiateRefundRequest();
  };

  const primaryActionLabel =
    activeStep === 1
      ? POLICY_INITIATE_REFUND_DIALOG.nextLabel
      : POLICY_INITIATE_REFUND_DIALOG.submitLabel;

  const isSubmitting =
    isManualRefundPending || isReinitiateRefundPending || isValidateBankAccountPending;

  const isManualRefundSubmitDisabled = useMemo(() => {
    const refundAmount = parseRefundAmount(manualRefundForm.refundAmount);

    return (
      !manualRefundForm.policyNumber.trim() ||
      !manualRefundForm.accountHolderName.trim() ||
      !manualRefundForm.bankAccountDetails.trim() ||
      !refundAmount ||
      !manualRefundForm.priority.trim() ||
      !manualRefundForm.refundDestination.trim()
    );
  }, [manualRefundForm]);

  const hasReinitiateBankValidationErrors = useMemo(() => {
    if (retryRefundOption === 'partner_bank_account') {
      return false;
    }

    return hasBlockingBankAccountValidationErrors({
      accountNumber: reinitiateRefundForm.accountNumber,
      confirmAccountNumber: reinitiateRefundForm.confirmAccountNumber,
      confirmAccountNumberFeedback,
      ifscCode: reinitiateRefundForm.ifscCode,
      ifscCodeFormatError,
    });
  }, [
    confirmAccountNumberFeedback,
    ifscCodeFormatError,
    reinitiateRefundForm.accountNumber,
    reinitiateRefundForm.confirmAccountNumber,
    reinitiateRefundForm.ifscCode,
    retryRefundOption,
  ]);

  const isCashfreeSubmitDisabled = useMemo(() => {
    if (hasReinitiateBankValidationErrors) {
      return true;
    }

    if (!isCashfreeModalOpen || !cashfreeModalBaseline) {
      return true;
    }

    if (retryRefundOption === 'partner_bank_account') {
      if (isRefundBankDetailsLoading || hasPartnerBankDetailsError || !selectedBankAccount.trim()) {
        return true;
      }

      if (retryRefundOption !== cashfreeModalBaseline.retryRefundOption) {
        return false;
      }

      return (
        selectedBankAccount === cashfreeModalBaseline.selectedBankAccount &&
        areReinitiateRefundFormValuesEqual(reinitiateRefundForm, cashfreeModalBaseline.formValues)
      );
    }

    if (retryRefundOption === 'add_bank_account') {
      return areReinitiateRefundFormValuesEqual(
        reinitiateRefundForm,
        EMPTY_REINITIATE_REFUND_FORM,
      );
    }

    return areReinitiateRefundFormValuesEqual(
      reinitiateRefundForm,
      cashfreeModalBaseline.formValues,
    );
  }, [
    cashfreeModalBaseline,
    hasPartnerBankDetailsError,
    hasReinitiateBankValidationErrors,
    isCashfreeModalOpen,
    isRefundBankDetailsLoading,
    reinitiateRefundForm,
    retryRefundOption,
    selectedBankAccount,
  ]);

  return {
    activeStep,
    refundDestination,
    retryRefundOption,
    isCashfreeModalOpen,
    handleRetryRefundOptionChange,
    handleRefundDestinationChange,
    openCashfreeModal,
    closeCashfreeModal,
    handleBack,
    handlePrimaryAction,
    handleCashfreeSubmit,
    primaryActionLabel,
    isSubmitting,
    isCashfreeSubmitDisabled,
    isManualRefundSubmitDisabled,
    manualRefundForm,
    manualRefundFormErrors,
    handleManualRefundFieldChange,
    reinitiateRefundForm,
    reinitiateRefundFormErrors,
    handleReinitiateRefundFieldChange,
    confirmAccountNumberFeedback,
    ifscCodeFormatError,
    selectedBankAccount,
    bankAccountSelectOptions,
    isRefundBankDetailsLoading,
    hasPartnerBankDetailsError,
    isAddingNewBankAccount,
    selectedBankAccountError,
    handleSelectedBankAccountChange,
    selectedAccountDetails,
  };
};
