import { format, parseISO } from 'date-fns';

type PolicyDateRange = {
  startDate?: string;
  endDate?: string;
};

type EndorsementDateRange = {
  fromDate?: string;
  toDate?: string;
};

const ISO_TIMEZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i;

export const parsePolicyDateTime = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return undefined;
  }

  const normalizedValue =
    trimmedValue.includes('T') && !ISO_TIMEZONE_PATTERN.test(trimmedValue)
      ? `${trimmedValue}Z`
      : trimmedValue;
  const parsedDate = parseISO(normalizedValue);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

export const getPolicyStartDate = (policy?: PolicyDateRange) =>
  parsePolicyDateTime(policy?.startDate);

export const getPolicyEndDate = (policy?: PolicyDateRange) => parsePolicyDateTime(policy?.endDate);

export const getEndorsementDateRange = (dateRange?: EndorsementDateRange) => ({
  fromDate: parsePolicyDateTime(dateRange?.fromDate),
  toDate: parsePolicyDateTime(dateRange?.toDate),
});

export const getPolicyDateOnlyTime = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const getEarlierPolicyDate = (left?: Date, right?: Date) => {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return left < right ? left : right;
};

export const formatPolicyDateRange = (fromDate?: string, toDate?: string) => {
  const { fromDate: parsedFromDate, toDate: parsedToDate } = getEndorsementDateRange({
    fromDate,
    toDate,
  });
  if (!parsedFromDate || !parsedToDate) {
    return '';
  }

  return `${format(parsedFromDate, 'yyyy-MM-dd')} to ${format(parsedToDate, 'yyyy-MM-dd')}`;
};

export const formatPolicyDisplayDate = (value?: string) => {
  const parsedDate = parsePolicyDateTime(value);
  if (!parsedDate) {
    return '-';
  }

  return format(parsedDate, 'yyyy-MM-dd');
};

export const formatPolicyEndorsementDateTime = (date: Date, minimumDate?: Date) => {
  const dateWithTime = applyCurrentSubmitTimeToDate(date);
  const endorsementDateTime =
    minimumDate && dateWithTime < minimumDate ? minimumDate : dateWithTime;

  return format(endorsementDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
};

const applyCurrentSubmitTimeToDate = (date: Date) => {
  const now = new Date();
  const dateWithTime = new Date(date);
  dateWithTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return dateWithTime;
};
