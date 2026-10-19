import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PolicySearchBar from '../molecules/PolicySearchBar';
import PolicyManagementTable from '../molecules/PolicyManagementTable';
import EndorsePolicyDialog from '@/components/organisms/EndorsePolicyDialog';
import ShareDetailsDialog from '@/components/organisms/ShareDetailsDialog';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import type { PolicyTableRow } from '@/lib/types/policy-management';
import { useRecentSearchPoliciesQuery } from '@/lib/query/policyManagement.queries';
import { useRunPolicySearch } from '@/lib/hooks/useRunPolicySearch';
import { usePolicyFilterOptions } from '@/lib/hooks/usePolicyFilterOptions';
import { mapRecentSearchPoliciesToRows } from '@/lib/adapter/policy-management/recentSearch.adapter';
import { OTHERS_RECIPIENT_ID } from '@/lib/adapter/policy-share/policyShare.adapter';
import { usePolicyShareDialog } from '@/lib/hooks/usePolicyShareDialog';
import { SHARE_POLICY_CONFIG } from '@/lib/constants/policyShare.constants';
import { usePartnerStore } from '@/lib/store/partner.store';
import {
  POLICY_FILTER_OPTIONS_FALLBACK,
  DEFAULT_POLICY_MANAGEMENT_TAB,
  POLICY_MANAGEMENT_SEARCH_PAGE_SIZE,
  POLICY_MANAGEMENT_TABLE_TABS,
  POLICY_MANAGEMENT_TABLE_LABELS,
  SHARE_POLICY_INFO_TEXT,
} from '@/lib/constants/policy.constants';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackPolicyOverviewChangeSearchFilter,
  trackPolicyOverviewDataException,
  trackPolicyOverviewEndorsePolicy,
  trackPolicyOverviewOpenPolicyDetails,
  trackPolicyOverviewSearch,
  trackPolicyOverviewSharePolicy,
  trackPolicyShareDialogSubmit,
  trackPolicyShareDialogView,
} from '@/lib/segment/track/policy';

type PolicyOverviewProps = {
  showTopTabs: boolean;
};

const getStoredPolicySearchQuery = (storageKey: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.sessionStorage.getItem(storageKey) ?? '';
};

const getStoredPolicySearchFilter = (storageKey: string, validValues: string[]): string => {
  const defaultValue = validValues[0] ?? POLICY_FILTER_OPTIONS_FALLBACK[0].value;
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const storedFilter = window.sessionStorage.getItem(storageKey);
  return storedFilter && validValues.includes(storedFilter) ? storedFilter : defaultValue;
};

export default function PolicyOverview({ showTopTabs }: PolicyOverviewProps) {
  const router = useRouter();
  const { partner } = useParams<{ partner: string }>();
  const segmentBase = useSegmentPartnerBase();
  const { partnerId, lob, productIds } = usePartnerStore();
  const { filterOptions } = usePolicyFilterOptions();
  const searchQueryStorageKey = `policy-overview-search-query:${partner}`;
  const searchFilterStorageKey = `policy-overview-search-filter:${partner}`;
  const [searchFilter, setSearchFilter] = useState(() => POLICY_FILTER_OPTIONS_FALLBACK[0].value);
  const [searchQuery, setSearchQuery] = useState(() =>
    getStoredPolicySearchQuery(searchQueryStorageKey),
  );
  const [activeTableTab, setActiveTableTab] = useState(
    DEFAULT_POLICY_MANAGEMENT_TAB.activeTableTab,
  );
  const [searchResults, setSearchResults] = useState<RecentSearchPolicy[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [lastSearchedFilter, setLastSearchedFilter] = useState(
    POLICY_FILTER_OPTIONS_FALLBACK[0].value,
  );
  const [endorseDialogOpen, setEndorseDialogOpen] = useState(false);
  const [selectedEndorseRow, setSelectedEndorseRow] = useState<PolicyTableRow | null>(null);
  const {
    data: recentSearchData,
    isLoading: isRecentSearchLoading,
    isError: isRecentSearchError,
    refetch: refetchRecentSearch,
  } = useRecentSearchPoliciesQuery();

  const { runPolicySearch, lastSearchQueryRef, isSearchLoading, isSearchError } =
    useRunPolicySearch({
      pageSize: POLICY_MANAGEMENT_SEARCH_PAGE_SIZE,
      onValidSearchSubmit: ({ trimmedQuery, selectedFilter }) => {
        setLastSearchedQuery(trimmedQuery);
        setLastSearchedFilter(selectedFilter);
        setIsSearchActive(true);
        setActiveTableTab('search-results');
      },
      onSearchSuccess: (policies) => {
        setSearchResults(policies);
      },
      onEmptyQuery: () => {
        setIsSearchActive(false);
        setSearchResults([]);
        setLastSearchedQuery('');
        setActiveTableTab(DEFAULT_POLICY_MANAGEMENT_TAB.activeTableTab);
        refetchRecentSearch();
      },
    });

  const recentSearchPolicies = recentSearchData?.data?.policies || [];

  const [sharePolicyNumber, setSharePolicyNumber] = useState('');
  const {
    shareDialogOpen,
    isRecipientsLoading,
    recipients,
    effectiveSelectedId,
    channels,
    dependentChannelsByMember,
    activeDependentMemberId,
    othersChannelErrors,
    setShareChannels,
    onOpenChange: handleShareDialogOpen,
    openDialogForPolicy,
    onSelectRecipient: handleSelectRecipient,
    onDependentChannelsChange: handleDependentChannelsChange,
    onDependentActiveMemberChange: handleDependentActiveMemberChange,
    onChannelValueChange: handleChannelValueChange,
    canShare,
    submitShare: handleShareSubmit,
  } = usePolicyShareDialog();

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    window.sessionStorage.setItem(searchQueryStorageKey, value);
    if (value.trim() !== '') {
      return;
    }

    setIsSearchActive(false);
    setSearchResults([]);
    lastSearchQueryRef.current = '';
    setLastSearchedQuery('');
  };

  useEffect(() => {
    const validValues = filterOptions.map((option) => option.value);
    if (validValues.length === 0) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setSearchFilter((current) =>
        validValues.includes(current)
          ? current
          : getStoredPolicySearchFilter(searchFilterStorageKey, validValues),
      );
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [filterOptions, searchFilterStorageKey]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setTimeout(() => {
        setIsSearchActive(false);
        setSearchResults([]);
        lastSearchQueryRef.current = '';
        setLastSearchedQuery('');
        if (activeTableTab === 'search-results') {
          setActiveTableTab(DEFAULT_POLICY_MANAGEMENT_TAB.activeTableTab);
        }
      }, 0);
    }
  }, [activeTableTab, lastSearchQueryRef, searchQuery]);

  const handleSearch = () => {
    trackPolicyOverviewSearch(segmentBase, searchFilter, searchQuery.trim() || 'empty_query');
    runPolicySearch(searchFilter, searchQuery);
  };

  const handleSearchFilterChange = (value: string) => {
    trackPolicyOverviewChangeSearchFilter(segmentBase, value, searchQuery.trim() || 'empty_query');
    setSearchFilter(value);
    window.sessionStorage.setItem(searchFilterStorageKey, value);
    if (!searchQuery.trim()) {
      return;
    }
    runPolicySearch(value, searchQuery);
  };

  const handleTableTabChange = (value: string) => {
    setActiveTableTab(value);
    if (value === 'recent-searches') {
      refetchRecentSearch();
    }
  };

  const tablePolicies = activeTableTab === 'search-results' ? searchResults : recentSearchPolicies;
  const tableRows = mapRecentSearchPoliciesToRows(tablePolicies);
  const isTableLoading =
    activeTableTab === 'search-results' ? isSearchLoading : isRecentSearchLoading;
  const isTableError = activeTableTab === 'search-results' ? isSearchError : isRecentSearchError;

  const exceptionType = useMemo(() => {
    if (isSearchError) return 'search_policies';
    if (isRecentSearchError) return 'recent_search_policies';
  }, [isRecentSearchError, isSearchError]);

  useEffect(() => {
    if (!(isSearchError || isRecentSearchError) || !exceptionType) return;
    trackPolicyOverviewDataException(segmentBase, {
      exception_type: exceptionType,
      entity_name: searchFilter,
      value: searchQuery || 'empty_query',
    });
  }, [exceptionType, isRecentSearchError, isSearchError, searchFilter, searchQuery, segmentBase]);

  const visibleTabs = isSearchActive
    ? POLICY_MANAGEMENT_TABLE_TABS
    : POLICY_MANAGEMENT_TABLE_TABS.filter((tab) => tab.value !== 'search-results');

  const handleShareClick = (row: PolicyTableRow) => {
    trackPolicyOverviewSharePolicy(segmentBase, row.policyNumber);
    openDialogForPolicy(row.id);
    setSharePolicyNumber(row.policyNumber);
  };

  const handleEndorseClick = (row: PolicyTableRow) => {
    trackPolicyOverviewEndorsePolicy(segmentBase, row.policyNumber);
    setSelectedEndorseRow(row);
    setEndorseDialogOpen(true);
  };

  const searchLabel = filterOptions.find((option) => option.value === lastSearchedFilter)?.label;
  const errorMessage = lastSearchedQuery
    ? `No results found for ${searchLabel?.toLowerCase()} '${lastSearchedQuery}'`
    : 'No data found.';

  return (
    <div className="flex flex-col gap-4">
      <PolicySearchBar
        filterValue={searchFilter}
        filterOptions={filterOptions}
        onFilterChange={handleSearchFilterChange}
        query={searchQuery}
        onQueryChange={handleSearchQueryChange}
        onSearch={handleSearch}
        onClear={refetchRecentSearch}
      />
      <PolicyManagementTable
        lob={lob}
        partnerId={partnerId}
        productIds={productIds}
        tabs={visibleTabs}
        activeTableTab={activeTableTab}
        onTableTabChange={handleTableTabChange}
        tableRows={tableRows}
        labels={POLICY_MANAGEMENT_TABLE_LABELS}
        isLoading={isTableLoading}
        isError={isTableError}
        errorTitle={errorMessage}
        showTopTabs={showTopTabs}
        onPolicyClick={(policyNumber) => {
          trackPolicyOverviewOpenPolicyDetails(segmentBase, policyNumber);
          router.push(
            `/${partner}/dashboard/policy-management/policy-details?policyNumber=${encodeURIComponent(policyNumber)}`,
          );
        }}
        onEndorseClick={handleEndorseClick}
        onShareClick={handleShareClick}
      />
      <ShareDetailsDialog
        open={shareDialogOpen}
        onOpenChange={handleShareDialogOpen}
        title={SHARE_POLICY_CONFIG.title}
        description={SHARE_POLICY_CONFIG.description}
        descriptionHighlight={sharePolicyNumber}
        recipients={recipients}
        selectedRecipientId={effectiveSelectedId}
        onSelectRecipient={handleSelectRecipient}
        channels={channels}
        onChannelsChange={setShareChannels}
        dependentChannelsByMember={dependentChannelsByMember}
        onDependentChannelsChange={handleDependentChannelsChange}
        activeDependentMemberId={activeDependentMemberId}
        onDependentActiveMemberChange={handleDependentActiveMemberChange}
        onChannelValueChange={handleChannelValueChange}
        channelErrors={
          effectiveSelectedId === OTHERS_RECIPIENT_ID ? othersChannelErrors : undefined
        }
        loading={isRecipientsLoading}
        cancelLabel={SHARE_POLICY_CONFIG.cancelLabel}
        shareLabel={SHARE_POLICY_CONFIG.shareLabel}
        onCancel={() => handleShareDialogOpen(false)}
        onShare={() => {
          trackPolicyShareDialogSubmit(segmentBase, sharePolicyNumber);
          handleShareSubmit();
        }}
        canShare={canShare}
        showCloseButton
        claimBannerText={SHARE_POLICY_INFO_TEXT}
        sendSegmentEvent={() => {
          trackPolicyShareDialogView(segmentBase, sharePolicyNumber || '');
        }}
      />
      <EndorsePolicyDialog
        open={endorseDialogOpen}
        onOpenChange={setEndorseDialogOpen}
        onClose={() => setEndorseDialogOpen(false)}
        onEndorsementSuccess={async () => {
          setEndorseDialogOpen(false);
        }}
        policyNumber={selectedEndorseRow?.policyNumber ?? ''}
        policyId={selectedEndorseRow?.id ?? ''}
        plan={selectedEndorseRow?.productName ?? ''}
        insuredName={selectedEndorseRow?.insuredName ?? '-'}
      />
    </div>
  );
}
