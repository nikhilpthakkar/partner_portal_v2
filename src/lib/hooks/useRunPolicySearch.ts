'use client';

import { useCallback, useRef } from 'react';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { isPolicyPhoneSearchField } from '@/lib/constants/policy.constants';
import { useSearchPoliciesMutation } from '@/lib/query/policyManagement.queries';
import type { ApiErrorResponse } from '@/lib/types/Global';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';

const UNSUPPORTED_SEARCH_FIELD_CODE = 'UNSUPPORTED_SEARCH_FIELD';
const SEARCH_FIELD_NOT_READY_CODE = 'SEARCH_FIELD_NOT_READY';

export type ValidPolicySearchContext = {
  trimmedQuery: string;
  selectedFilter: string;
};

export type UseRunPolicySearchParams = {
  pageSize: number;
  /** Runs after validation, immediately before the search request. */
  onValidSearchSubmit: (ctx: ValidPolicySearchContext) => void;
  onSearchSuccess: (policies: RecentSearchPolicy[]) => void;
  /** When the trimmed query is empty (e.g. user cleared input and submitted). */
  onEmptyQuery?: () => void;
};

const getPolicySearchErrorMessage = (error: AxiosError<ApiErrorResponse>): string | null => {
  const code = error.response?.data?.code;
  if (code === UNSUPPORTED_SEARCH_FIELD_CODE || code === SEARCH_FIELD_NOT_READY_CODE) {
    return error.response?.data?.message ?? error.response?.data?.detail ?? null;
  }
  return null;
};

/**
 * Shared policy search: trim, optional phone validation, stale-response guard,
 * and `useSearchPoliciesMutation` invocation. Used by policy management and create-claim flows.
 */
export function useRunPolicySearch(params: UseRunPolicySearchParams) {
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const lastSearchQueryRef = useRef('');
  const {
    mutate: searchPolicies,
    isPending: isSearchLoading,
    isError: isSearchError,
  } = useSearchPoliciesMutation();

  const runPolicySearch = useCallback(
    (selectedFilter: string, query: string) => {
      const { pageSize, onValidSearchSubmit, onSearchSuccess, onEmptyQuery } = paramsRef.current;

      const trimmedQuery = query.trim();
      const isPhoneNumberFilter = isPolicyPhoneSearchField(selectedFilter);
      const normalizedPhoneNumber = trimmedQuery.replace(/\D/g, '');

      if (!trimmedQuery) {
        lastSearchQueryRef.current = '';
        onEmptyQuery?.();
        return;
      }

      if (isPhoneNumberFilter && normalizedPhoneNumber.length < 10) {
        toast.error('Invalid phone number');
        return;
      }

      lastSearchQueryRef.current = trimmedQuery;
      onValidSearchSubmit({ trimmedQuery, selectedFilter });

      searchPolicies(
        {
          searchField: selectedFilter,
          searchValue: trimmedQuery,
          page: 1,
          size: pageSize,
        },
        {
          onSuccess: (response) => {
            if (lastSearchQueryRef.current !== trimmedQuery) {
              return;
            }
            onSearchSuccess(response?.data?.policies ?? []);
          },
          onError: (error) => {
            const message = getPolicySearchErrorMessage(error as AxiosError<ApiErrorResponse>);
            if (message) {
              toast.error(message);
            }
          },
        },
      );
    },
    [searchPolicies],
  );

  return { runPolicySearch, lastSearchQueryRef, isSearchLoading, isSearchError };
}
