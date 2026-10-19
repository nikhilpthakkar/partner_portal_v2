import { format, getQuarter, isSameDay, isSameMonth, parseISO } from 'date-fns';
import type { GroupBy } from '@/lib/types/overview';

export const formatDaily = (isoDate: string) => {
  return format(parseISO(isoDate.slice(0, 10)), 'dd MMM');
};

export const formatWeekly = (startISO: string, endISO: string) => {
  const start = parseISO(startISO.slice(0, 10));
  const end = parseISO(endISO.slice(0, 10));

  if (isSameDay(start, end)) {
    return formatDaily(startISO);
  }

  if (isSameMonth(start, end)) {
    return `${format(start, 'dd')} - ${format(end, 'dd MMM')}`;
  }

  return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM')}`;
};

export const formatMonthly = (isoDate: string) => {
  return format(parseISO(isoDate), 'MMM');
};

const QUARTER_LABELS: Record<number, string> = {
  1: 'JFM',
  2: 'AMJ',
  3: 'JAS',
  4: 'OND',
};

export const formatQuarterly = (isoDate: string) => {
  const date = parseISO(isoDate.slice(0, 10));
  const quarter = getQuarter(date);
  const year = format(date, 'yy');

  return `Q${quarter} ${QUARTER_LABELS[quarter]} ${year}`;
};

type DateViewType = 'daily' | 'weekly' | 'monthly' | 'quarterly';

const GROUP_BY_TO_DATE_VIEW: Record<GroupBy, DateViewType> = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
};

export const formatByView = (view: DateViewType, startISO: string, endISO?: string) => {
  switch (view) {
    case 'daily':
      return formatDaily(startISO);

    case 'weekly':
      if (!endISO) throw new Error('Weekly requires end date');
      return formatWeekly(startISO, endISO);

    case 'monthly':
      return formatMonthly(startISO);

    case 'quarterly':
      return formatQuarterly(startISO);

    default:
      return '';
  }
};

export const formatGraphPeriodLabel = (
  periodType: GroupBy,
  periodStart: string,
  periodEnd: string,
): string => {
  return formatByView(GROUP_BY_TO_DATE_VIEW[periodType], periodStart, periodEnd);
};

export const formatGraphPeriodRangeLabel = (
  startISO: string | undefined,
  endISO: string | undefined,
): string => {
  if (!startISO || !endISO) return '';

  const start = parseISO(startISO.slice(0, 10));
  const end = parseISO(endISO.slice(0, 10));

  return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM')}`;
};
