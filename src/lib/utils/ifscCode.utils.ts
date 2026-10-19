import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';

/** IFSC format: XXXX0YYYYYY — 4 letters, 0, then 6 alphanumeric characters. */
export const IFSC_CODE_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const IFSC_CODE_INVALID_FORMAT_MESSAGE =
  POLICY_INITIATE_REFUND_DIALOG.reinitiateBankFields.ifscCode.invalidFormatMessage;

export const normalizeIfscCode = (value: string): string => value.trim().toUpperCase();

export const isValidIfscCodeFormat = (value: string): boolean => {
  const normalizedIfscCode = normalizeIfscCode(value);

  if (!normalizedIfscCode) {
    return false;
  }

  return IFSC_CODE_REGEX.test(normalizedIfscCode);
};

export const getIfscCodeFormatValidationError = (value: string): string | null => {
  const normalizedIfscCode = normalizeIfscCode(value);

  if (!normalizedIfscCode) {
    return null;
  }

  if (!isValidIfscCodeFormat(normalizedIfscCode)) {
    return IFSC_CODE_INVALID_FORMAT_MESSAGE;
  }

  return null;
};

export const getIfscCodeFieldError = (value: string, requiredMessage: string): string => {
  const normalizedIfscCode = normalizeIfscCode(value);

  if (!normalizedIfscCode) {
    return requiredMessage;
  }

  return getIfscCodeFormatValidationError(normalizedIfscCode) ?? '';
};

export const getIfscCodeFieldClassName = ({
  hasFormError,
  hasFormatError,
  defaultClassName = 'border-input shadow-xs',
}: {
  hasFormError: boolean;
  hasFormatError: boolean;
  defaultClassName?: string;
}): string => {
  if (hasFormError || hasFormatError) {
    return 'border-destructive shadow-xs ring-[3px] ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/20';
  }

  return defaultClassName;
};
