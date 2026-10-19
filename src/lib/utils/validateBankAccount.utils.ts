import { isAxiosError } from 'axios';
import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';
import type { PolicyValidateBankAccountData } from '@/lib/types/policy-management/policyRefundApi';

const DEFAULT_VALIDATE_BANK_ACCOUNT_ERROR_MESSAGE = 'Unable to validate bank account details';

type ValidateBankAccountDownstreamError = {
  message?: string;
  category?: string;
};

type ValidateBankAccountApiError = {
  message?: string;
  detail?: string;
  downstreamError?: ValidateBankAccountDownstreamError;
};

const parseValidateBankAccountDetailMessage = (detail: string | undefined): string | null => {
  if (!detail?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(detail) as { message?: string; category?: string };
    if (parsed.message?.trim()) {
      return parsed.message.trim();
    }
    if (parsed.category?.trim()) {
      return parsed.category.trim();
    }
  } catch {
    return detail.trim();
  }

  return null;
};

export const getValidateBankAccountErrorMessage = (
  error: unknown,
  fallback = DEFAULT_VALIDATE_BANK_ACCOUNT_ERROR_MESSAGE,
): string => {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const api = error.response?.data as ValidateBankAccountApiError | undefined;
  const downstreamMessage = api?.downstreamError?.message?.trim();
  if (downstreamMessage) {
    return downstreamMessage;
  }

  const detailMessage = parseValidateBankAccountDetailMessage(api?.detail);
  if (detailMessage) {
    return detailMessage;
  }

  const downstreamCategory = api?.downstreamError?.category?.trim();
  if (downstreamCategory) {
    return downstreamCategory;
  }

  const topLevelMessage = api?.message?.trim();
  if (topLevelMessage) {
    return topLevelMessage;
  }

  return fallback;
};

export const hasValidateBankAccountHolderMismatch = (
  validationData: PolicyValidateBankAccountData,
): boolean => {
  if (typeof validationData.matchRatio === 'number' && validationData.matchRatio < 1) {
    return true;
  }

  return validationData.validationStatus?.trim().toUpperCase() === 'MISMATCH';
};

export type ValidateBankAccountSuccessFeedback = {
  toastMessage: string;
  accountHolderNameError?: string;
  accountNumberError?: string;
};

export const getValidateBankAccountSuccessFeedback = (
  validationData: PolicyValidateBankAccountData,
  responseMessage?: string,
): ValidateBankAccountSuccessFeedback | null => {
  if (hasValidateBankAccountHolderMismatch(validationData)) {
    const mismatchMessage =
      POLICY_INITIATE_REFUND_DIALOG.reinitiateBankFields.accountHolderName.mismatchMessage;

    return {
      toastMessage: mismatchMessage,
      accountHolderNameError: mismatchMessage,
    };
  }

  if (!validationData.isValid) {
    return {
      toastMessage: responseMessage ?? 'Bank account details could not be validated',
      accountNumberError:
        POLICY_INITIATE_REFUND_DIALOG.reinitiateBankFields.accountNumber.invalidMessage,
    };
  }

  return null;
};
