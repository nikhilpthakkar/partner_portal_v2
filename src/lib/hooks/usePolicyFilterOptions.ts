'use client';

import { useMemo } from 'react';
import { POLICY_FILTER_OPTIONS_FALLBACK } from '@/lib/constants/policy.constants';
import { usePolicySearchCapabilitiesQuery } from '@/lib/query/policyManagement.queries';
import type { SelectOption } from '@/lib/types/Global';

export function usePolicyFilterOptions(): {
  filterOptions: SelectOption<string>[];
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = usePolicySearchCapabilitiesQuery();

  const filterOptions = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((capability) => ({
        value: capability.field,
        label: capability.displayName || capability.field,
      }));
    }
    return POLICY_FILTER_OPTIONS_FALLBACK;
  }, [data]);

  return { filterOptions, isLoading, isError };
}
