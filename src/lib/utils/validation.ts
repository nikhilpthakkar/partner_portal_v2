/**
 * Email validation (RFC 5322 simplified).
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Indian 10-digit mobile number.
 * First digit 6–9, followed by 9 digits. Accepts digits only (leading +91/0 stripped for validation).
 */
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

function normalizeIndianMobile(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/^91(?=\d{10}$)/, '')
    .replace(/^0+/, '');
}

export function isValidIndianMobile(value: string): boolean {
  const trimmed = value.trim();

  if (!/^[\d+\s-]+$/.test(trimmed)) {
    return false;
  }

  const normalized = normalizeIndianMobile(trimmed);
  return /^[6-9]\d{9}$/.test(normalized);
}

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Please enter a valid email address',
  MOBILE_REQUIRED: 'Please enter a valid mobile number',
  RELATIONSHIP_REQUIRED: 'Please select a relationship',
  GENDER_REQUIRED: 'Please select a gender',
  DATE_OF_BIRTH_REQUIRED: 'Please select a date of birth',
  NAME_REQUIRED: 'Please enter a name',
  REQUIRED: 'This field is required',
} as const;
