'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mapRecentSearchPoliciesToRows } from '@/lib/adapter/policy-management/recentSearch.adapter';
import { CreateClaimFlowStepId } from '@/lib/constants/createClaim.constants';
import {
  CREATE_CLAIM_POLICY_SEARCH_PAGE_SIZE,
  POLICY_FILTER_OPTIONS_FALLBACK,
} from '@/lib/constants/policy.constants';
import { usePolicyFilterOptions } from '@/lib/hooks/usePolicyFilterOptions';
import { useRunPolicySearch } from '@/lib/hooks/useRunPolicySearch';
import type { CreateClaimFilterOption } from '@/lib/types/claims-management/createClaim';
import type { PolicyTableRow, RecentSearchPolicy } from '@/lib/types/policy-management';
import type { CreateClaimUrlState } from './useCreateClaimUrlState';

export type UseCreateClaimPolicySearchOptions = {
  setSelectedPolicy: (policy: RecentSearchPolicy) => void;
  setWizardStep: (step: CreateClaimFlowStepId) => void;
  url: CreateClaimUrlState;
};

export function useCreateClaimPolicySearch({
  setSelectedPolicy,
  setWizardStep,
  url,
}: UseCreateClaimPolicySearchOptions) {
  const { filterOptions } = usePolicyFilterOptions();
  const [searchFilter, setSearchFilter] = useState(POLICY_FILTER_OPTIONS_FALLBACK[0].value);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecentSearchPolicy[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  useEffect(() => {
    const validValues = filterOptions.map((option) => option.value);
    if (validValues.length === 0) {
      return;
    }
    setSearchFilter((current) => (validValues.includes(current) ? current : validValues[0]));
  }, [filterOptions]);

  const { runPolicySearch, lastSearchQueryRef, isSearchLoading, isSearchError } =
    useRunPolicySearch({
      pageSize: CREATE_CLAIM_POLICY_SEARCH_PAGE_SIZE,
      onValidSearchSubmit: () => {
        setSelectedRowId(null);
      },
      onSearchSuccess: (policies) => {
        setSearchAttempted(true);
        setSearchResults(policies);
      },
      onEmptyQuery: () => {
        setSearchResults([]);
        setSearchAttempted(false);
        setSelectedRowId(null);
      },
    });

  const tableRows = mapRecentSearchPoliciesToRows(searchResults);

  const handleSearch = () => {
    runPolicySearch(searchFilter, searchQuery);
  };

  const handleSearchFilterChange = (value: string) => {
    setSearchFilter(value);
    if (!searchQuery.trim()) {
      return;
    }
    runPolicySearch(value, searchQuery);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim() !== '') {
      return;
    }
    lastSearchQueryRef.current = '';
    setSearchResults([]);
    setSearchAttempted(false);
    setSelectedRowId(null);
  };

  const handleContinueToClaimType = () => {
    if (!selectedRowId) return;
    const policy = searchResults.find((result) => result.policyId === selectedRowId);
    if (!policy) {
      toast.error('Unable to load selected policy');
      return;
    }
    setSelectedPolicy(policy);
    setWizardStep(CreateClaimFlowStepId.SelectClaimType);
    url.replaceWithPolicyOnly(policy.policyNumber);
  };

  const toggleRowSelection = (row: PolicyTableRow) => {
    setSelectedRowId((prev) => (prev === row.id ? null : row.id));
  };

  return {
    handleSearch,
    handleSearchFilterChange,
    handleSearchQueryChange,
    handleContinueToClaimType,
    isSearchError,
    isSearchLoading,
    policyFilterOptions: filterOptions as CreateClaimFilterOption[],
    searchAttempted,
    searchFilter,
    searchQuery,
    selectedRowId,
    tableRows,
    toggleRowSelection,
  };
}

export type CreateClaimPolicySearchState = ReturnType<typeof useCreateClaimPolicySearch>;
