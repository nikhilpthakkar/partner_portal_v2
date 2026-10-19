import { format } from 'date-fns';
import type { AddLedgerTransactionPayload, LedgerTransactionCategory } from '@/lib/types/financials';

export type AddLedgerTransactionFormValues = {
  resolvedProductId: string;
  category: LedgerTransactionCategory;
  amount: string;
  notes: string;
  utrNumber: string;
  bankAccountNumber: string;
  selectedDate?: Date;
};

export type AddLedgerTransactionPayloadResult =
  | {
      ok: true;
      payload: AddLedgerTransactionPayload;
    }
  | {
      ok: false;
      error: string;
    };

export const buildAddLedgerTransactionPayload = ({
  resolvedProductId,
  category,
  amount,
  notes,
  utrNumber,
  bankAccountNumber,
  selectedDate,
}: AddLedgerTransactionFormValues): AddLedgerTransactionPayloadResult => {
  if (!resolvedProductId) {
    return { ok: false, error: 'Select a product' };
  }

  if (!amount.trim()) {
    return { ok: false, error: 'Enter an amount' };
  }

  if (!utrNumber.trim()) {
    return { ok: false, error: 'Enter a UTR number' };
  }

  if (!selectedDate) {
    return { ok: false, error: 'Select a date' };
  }

  if (category === 'REFUND_DEPOSIT' && !bankAccountNumber.trim()) {
    return { ok: false, error: 'Enter partner bank account' };
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return { ok: false, error: 'Enter a valid amount' };
  }

  return {
    ok: true,
    payload: {
      category,
      amount: parsedAmount,
      notes: notes.trim(),
      utrNumber: utrNumber.trim(),
      transactionDate: format(selectedDate, 'yyyy-MM-dd'),
      productIds: [resolvedProductId],
      planId: resolvedProductId,
      ...(category === 'REFUND_DEPOSIT' ? { bankAccountNumber: bankAccountNumber.trim() } : {}),
    },
  };
};
