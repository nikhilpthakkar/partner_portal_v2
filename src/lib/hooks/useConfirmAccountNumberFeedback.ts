'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getConfirmAccountNumberFeedback,
  type ConfirmAccountNumberFeedback,
} from '@/lib/utils/bankAccountForm.utils';

const DEFAULT_DEBOUNCE_MS = 400;

export type UseConfirmAccountNumberFeedbackResult = {
  feedback: ConfirmAccountNumberFeedback | null;
  markDirty: () => void;
  reset: () => void;
};

export function useConfirmAccountNumberFeedback(
  accountNumber: string,
  confirmAccountNumber: string,
  debounceMs = DEFAULT_DEBOUNCE_MS,
): UseConfirmAccountNumberFeedbackResult {
  const [feedback, setFeedback] = useState<ConfirmAccountNumberFeedback | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const reset = useCallback(() => {
    setIsDirty(false);
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (!isDirty || !confirmAccountNumber.trim()) {
      setFeedback(null);
      return;
    }

    setFeedback(null);

    const timeoutId = window.setTimeout(() => {
      setFeedback(getConfirmAccountNumberFeedback(accountNumber, confirmAccountNumber));
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [accountNumber, confirmAccountNumber, debounceMs, isDirty]);

  return {
    feedback: isDirty ? feedback : null,
    markDirty,
    reset,
  };
}
