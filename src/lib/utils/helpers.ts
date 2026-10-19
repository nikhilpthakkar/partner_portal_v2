const getOrdinalSuffix = (day: number): string => {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return 'th';
  }

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const formatDayWithOrdinal = (date: Date): string => {
  const day = date.getDate();
  return `${day}${getOrdinalSuffix(day)}`;
};

const isSameCalendarDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getKeyMetricsTitle = (startDate: Date, endDate: Date): string => {
  const startMonthLabel = startDate.toLocaleString('en-US', { month: 'long' });
  const endMonthLabel = endDate.toLocaleString('en-US', { month: 'long' });
  const startYearLabel = startDate.getFullYear();
  const endYearLabel = endDate.getFullYear();

  if (isSameCalendarDay(startDate, endDate)) {
    return `Key Metrics | ${startMonthLabel} ${formatDayWithOrdinal(startDate)}, ${startYearLabel}`;
  }

  const isSameMonth =
    startYearLabel === endYearLabel && startDate.getMonth() === endDate.getMonth();
  if (isSameMonth) {
    return `Key Metrics | ${startMonthLabel} ${formatDayWithOrdinal(startDate)}-${formatDayWithOrdinal(endDate)}, ${startYearLabel}`;
  }

  if (startYearLabel === endYearLabel) {
    return `Key Metrics | ${startMonthLabel} ${formatDayWithOrdinal(startDate)} - ${endMonthLabel} ${formatDayWithOrdinal(endDate)}, ${startYearLabel}`;
  }

  return `Key Metrics | ${startMonthLabel} ${formatDayWithOrdinal(startDate)}, ${startYearLabel} - ${endMonthLabel} ${formatDayWithOrdinal(endDate)}, ${endYearLabel}`;
};

export const getLastUpdatedLabel = (): string => {
  const updatedAtDate = new Date();
  const flooredMinutes = updatedAtDate.getMinutes() < 30 ? 0 : 30;
  updatedAtDate.setMinutes(flooredMinutes, 0, 0);
  const timeLabel = updatedAtDate
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toLowerCase();

  return `Last updated at ${timeLabel} today`;
};

export const calculateAge = (dobString?: string): number | null => {
  if (!dobString) {
    return null;
  }

  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for environments without crypto
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
