import { Currency } from '@/lib/types/overview';

export const ROWS_PER_PAGE_OPTIONS = [10, 15, 20, 50];

export const CURRENCY_UNIT_MAP: Record<string | Currency, string> = {
  percentage: '%',
  INR: '₹',
  USD: '$',
};

export const DETAILS_ROUTES = ['policy-details', 'claim-details'] as const;

export const SOURCE_QUERY_PARAM = 'source';

export type DataSource = 'FINACKO' | 'LEDGER';

export const DEFAULT_DATA_SOURCE: DataSource = 'LEDGER';
