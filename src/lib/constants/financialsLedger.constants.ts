import type { LedgerTransactionCategory } from '@/lib/types/financials';

export const LEDGER_EDIT_FIELD_OPTIONS: Array<{
  value: LedgerTransactionCategory;
  label: string;
}> = [
  { value: 'TDS', label: 'Add TDS' },
  { value: 'TCS', label: 'Add TCS' },
  { value: 'REFUND_DEPOSIT', label: 'Refund deposit' },
  { value: 'DEPOSIT', label: 'Add deposit' },
];

export const LEDGER_TAX_CATEGORIES = ['TDS', 'TCS'] as const;

export const LEDGER_AMOUNT_LABEL: Record<LedgerTransactionCategory, string> = {
  TDS: 'TDS amount in (₹)',
  TCS: 'TCS amount in (₹)',
  REFUND_DEPOSIT: 'Amount to refund (₹)',
  DEPOSIT: 'Deposit amount (₹)',
};

export const LEDGER_TRANSACTION_MESSAGES: Record<
  LedgerTransactionCategory,
  { failure: string; success: string }
> = {
  TDS: {
    failure: 'Failed to add TDS',
    success: 'TDS transaction added successfully',
  },
  TCS: {
    failure: 'Failed to add TCS',
    success: 'TCS transaction added successfully',
  },
  REFUND_DEPOSIT: {
    failure: 'Failed to refund deposit',
    success: 'Refund deposit submitted successfully',
  },
  DEPOSIT: {
    failure: 'Failed to add deposit',
    success: 'Deposit added successfully',
  },
};

export const LEDGER_ADJUSTMENT_TOOLTIP_LABELS = {
  DEPOSIT: 'Deposit adjustments',
  PREMIUM: 'Premium adjustments',
} as const;
