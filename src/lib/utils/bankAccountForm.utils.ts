import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';
import { getIfscCodeFormatValidationError } from '@/lib/utils/ifscCode.utils';

export type ConfirmAccountNumberFeedback = {
  type: 'error' | 'success';
  message: string;
};

const confirmAccountNumberMessages =
  POLICY_INITIATE_REFUND_DIALOG.reinitiateBankFields.confirmAccountNumber;

export const CONFIRM_ACCOUNT_NUMBER_MISMATCH_MESSAGE =
  confirmAccountNumberMessages.mismatchMessage;

export const CONFIRM_ACCOUNT_NUMBER_MATCH_MESSAGE = confirmAccountNumberMessages.matchMessage;

export const normalizeBankDetailText = (value?: string | null): string => value?.trim() ?? '';

export function getConfirmAccountNumberFeedback(
  accountNumber: string,
  confirmAccountNumber: string,
): ConfirmAccountNumberFeedback | null {
  const trimmedConfirmAccountNumber = confirmAccountNumber.trim();

  if (!trimmedConfirmAccountNumber) {
    return null;
  }

  if (accountNumber.trim() !== trimmedConfirmAccountNumber) {
    return {
      type: 'error',
      message: CONFIRM_ACCOUNT_NUMBER_MISMATCH_MESSAGE,
    };
  }

  return {
    type: 'success',
    message: CONFIRM_ACCOUNT_NUMBER_MATCH_MESSAGE,
  };
}

export function getConfirmAccountNumberFieldClassName({
  feedback,
  hasFormError,
  defaultClassName = 'border-input shadow-xs',
}: {
  feedback: ConfirmAccountNumberFeedback | null;
  hasFormError: boolean;
  defaultClassName?: string;
}): string {
  if (hasFormError || feedback?.type === 'error') {
    return 'border-destructive shadow-xs ring-[3px] ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/20';
  }

  if (feedback?.type === 'success') {
    return 'border-green-600 shadow-xs ring-[3px] ring-green-600/20 focus-visible:border-green-600 focus-visible:ring-green-600/20';
  }

  return defaultClassName;
}

export function hasBlockingBankAccountValidationErrors({
  accountNumber,
  confirmAccountNumber,
  confirmAccountNumberFeedback,
  ifscCode,
  ifscCodeFormatError,
}: {
  accountNumber: string;
  confirmAccountNumber: string;
  confirmAccountNumberFeedback: ConfirmAccountNumberFeedback | null;
  ifscCode: string;
  ifscCodeFormatError: string | null;
}): boolean {
  if (confirmAccountNumberFeedback?.type === 'error') {
    return true;
  }

  const trimmedConfirmAccountNumber = confirmAccountNumber.trim();
  const trimmedAccountNumber = accountNumber.trim();

  if (
    trimmedConfirmAccountNumber &&
    trimmedAccountNumber !== trimmedConfirmAccountNumber
  ) {
    return true;
  }

  if (ifscCodeFormatError) {
    return true;
  }

  return Boolean(getIfscCodeFormatValidationError(ifscCode));
}
