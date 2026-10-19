'use client';

import { useCallback, useEffect, useState } from 'react';
import { getIfscCodeFormatValidationError } from '@/lib/utils/ifscCode.utils';

const DEFAULT_DEBOUNCE_MS = 400;

export type UseIfscCodeFormatFeedbackResult = {
  error: string | null;
  markDirty: () => void;
  reset: () => void;
};

export function useIfscCodeFormatFeedback(
  ifscCode: string,
  debounceMs = DEFAULT_DEBOUNCE_MS,
): UseIfscCodeFormatFeedbackResult {
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const reset = useCallback(() => {
    setIsDirty(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!isDirty || !ifscCode.trim()) {
      setError(null);
      return;
    }

    setError(null);

    const timeoutId = window.setTimeout(() => {
      setError(getIfscCodeFormatValidationError(ifscCode));
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [ifscCode, debounceMs, isDirty]);

  return {
    error: isDirty ? error : null,
    markDirty,
    reset,
  };
}
