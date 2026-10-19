'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PolicySearchBar from '../molecules/PolicySearchBar';
import ClaimsManagementTable from '../molecules/ClaimsManagementTable';
import ShareDetailsDialog from '@/components/organisms/ShareDetailsDialog';
import { useClaimsDetailStore } from '@/lib/store/claimsDetail.store';
import type { ClaimsManagementData } from '@/lib/types/claims-management';
import {
  CLAIMS_DETAIL_FILTER_OPTIONS,
  CLAIMS_DETAIL_TABS,
} from '@/lib/constants/claimsDetail.constants';
import { SHARE_CLAIM_STATUS_CONFIG } from '@/lib/constants/policyShare.constants';
import { OTHERS_RECIPIENT_ID } from '@/lib/adapter/policy-share/policyShare.adapter';
import { useClaimShareDialog } from '@/lib/hooks/useClaimShareDialog';
import { toast } from 'sonner';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackClaimStatusShareDialogView,
  trackClaimStatusShareSubmit,
  trackClaimsOverviewChangeSearchFilter,
  trackClaimsOverviewOpenClaimDetails,
  trackClaimsOverviewSearch,
  trackClaimsOverviewShareClaimAction,
} from '@/lib/segment/track/claims';

type ClaimsOverviewProps = {
  data: ClaimsManagementData;
};

const SEARCH_RESULTS_TAB = { value: 'search-results', label: 'Search results' };

const getStoredClaimsSearchQuery = (storageKey: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.sessionStorage.getItem(storageKey) ?? '';
};

const getStoredClaimsSearchFilter = (storageKey: string): string => {
  const defaultFilter = CLAIMS_DETAIL_FILTER_OPTIONS[0]?.value || '';
  if (typeof window === 'undefined') {
    return defaultFilter;
  }
  const storedFilter = window.sessionStorage.getItem(storageKey);
  return storedFilter && CLAIMS_DETAIL_FILTER_OPTIONS.some((option) => option.value === storedFilter)
    ? storedFilter
    : defaultFilter;
};

export default function ClaimsOverview({ data }: ClaimsOverviewProps) {
  const router = useRouter();
  const { partner } = useParams<{ partner: string }>();
  const segmentBase = useSegmentPartnerBase();
  const [activeTab, setActiveTab] = useState(data.defaults.activeTab);
  const searchQueryStorageKey = `claims-overview-search-query:${partner}`;
  const searchFilterStorageKey = `claims-overview-search-filter:${partner}`;
  const [searchFilter, setSearchFilter] = useState(() =>
    getStoredClaimsSearchFilter(searchFilterStorageKey),
  );
  const [searchQuery, setSearchQuery] = useState(() =>
    getStoredClaimsSearchQuery(searchQueryStorageKey),
  );
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [lastSearchedFilter, setLastSearchedFilter] = useState(
    CLAIMS_DETAIL_FILTER_OPTIONS[0]?.value || '',
  );
  const [shareClaimNumber, setShareClaimNumber] = useState('');
  const [shareClaimantName, setShareClaimantName] = useState('-');
  const { setPolicyNumber, setPhoneNumber, setClaimNumber, setPage } = useClaimsDetailStore();
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
    openDialogForClaim,
    onSelectRecipient: handleSelectRecipient,
    onDependentChannelsChange: handleDependentChannelsChange,
    onDependentActiveMemberChange: handleDependentActiveMemberChange,
    onChannelValueChange: handleChannelValueChange,
    canShare,
    submitShare: handleShareSubmit,
  } = useClaimShareDialog();

  const claimSummaryBanner = useMemo(() => {
    const referenceNumber = shareClaimNumber || '-';
    return `Claim ID ${referenceNumber} | ${shareClaimantName}`;
  }, [shareClaimNumber, shareClaimantName]);

  const visibleTabs = useMemo(
    () => (isSearchActive ? [SEARCH_RESULTS_TAB, ...CLAIMS_DETAIL_TABS] : CLAIMS_DETAIL_TABS),
    [isSearchActive],
  );

  const clearSearchFilters = () => {
    setPolicyNumber('');
    setPhoneNumber('');
    setClaimNumber('');
    setPage(1);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    window.sessionStorage.setItem(searchQueryStorageKey, value);
    if (value.trim() !== '') {
      return;
    }

    setIsSearchActive(false);
    setLastSearchedQuery('');
    clearSearchFilters();
    if (activeTab === SEARCH_RESULTS_TAB.value) {
      setActiveTab(data.defaults.activeTab);
    }
  };

  const runClaimSearch = (selectedFilter: string, query: string) => {
    const trimmedQuery = query.trim();
    const isPhoneNumberFilter = selectedFilter === 'phoneNumbers';
    const normalizedPhoneNumber = trimmedQuery.replace(/\D/g, '');
    clearSearchFilters();

    if (!trimmedQuery) {
      setIsSearchActive(false);
      setLastSearchedQuery('');
      if (activeTab === SEARCH_RESULTS_TAB.value) {
        setActiveTab(data.defaults.activeTab);
      }
      return;
    }

    if (isPhoneNumberFilter && normalizedPhoneNumber.length < 10) {
      toast.error('Invalid phone number');
      return;
    }

    setLastSearchedQuery(trimmedQuery);
    setLastSearchedFilter(selectedFilter);
    setIsSearchActive(true);
    setActiveTab(SEARCH_RESULTS_TAB.value);
    if (selectedFilter === 'policyNumbers') {
      setPolicyNumber(trimmedQuery);
      return;
    }
    if (selectedFilter === 'phoneNumbers') {
      setPhoneNumber(trimmedQuery);
      return;
    }
    setClaimNumber(trimmedQuery);
  };

  const handleSearch = () => {
    trackClaimsOverviewSearch(segmentBase, searchFilter, searchQuery.trim() || 'empty_query');
    runClaimSearch(searchFilter, searchQuery);
  };

  const handleSearchFilterChange = (value: string) => {
    trackClaimsOverviewChangeSearchFilter(segmentBase, value, searchQuery.trim() || 'empty_query');
    setSearchFilter(value);
    window.sessionStorage.setItem(searchFilterStorageKey, value);
    if (!searchQuery.trim()) {
      return;
    }
    runClaimSearch(value, searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    window.sessionStorage.setItem(searchQueryStorageKey, '');
    setIsSearchActive(false);
    setLastSearchedQuery('');
    if (activeTab === SEARCH_RESULTS_TAB.value) {
      setActiveTab(data.defaults.activeTab);
    }
    clearSearchFilters();
  };

  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
  };

  const resolvedActiveTab = visibleTabs.some((tab) => tab.value === activeTab)
    ? activeTab
    : data.defaults.activeTab;

  const searchLabel = CLAIMS_DETAIL_FILTER_OPTIONS.find(
    (option) => option.value === lastSearchedFilter,
  )?.label;
  const errorMessage = lastSearchedQuery
    ? `No results found for ${searchLabel?.toLowerCase()} '${lastSearchedQuery}'`
    : 'No data found.';

  return (
    <div className="flex flex-col gap-4">
      <PolicySearchBar
        filterValue={searchFilter}
        filterOptions={CLAIMS_DETAIL_FILTER_OPTIONS}
        onFilterChange={handleSearchFilterChange}
        query={searchQuery}
        onQueryChange={handleSearchQueryChange}
        onSearch={handleSearch}
        onClear={handleClear}
      />
      <ClaimsManagementTable
        tabs={visibleTabs}
        activeTab={resolvedActiveTab}
        onTabChange={handleTabChange}
        labels={data.table.labels}
        errorTitle={errorMessage}
        onReferenceClick={(referenceNumber) => {
          trackClaimsOverviewOpenClaimDetails(segmentBase, referenceNumber);
          router.push(
            `/${partner}/dashboard/claims-management/claim-details?claimNumber=${encodeURIComponent(referenceNumber)}`,
          );
        }}
        onShareClick={(claimNumber, claimantName, policyEkey, policyNumber) => {
          trackClaimsOverviewShareClaimAction(segmentBase, { claim_number: claimNumber });
          setShareClaimNumber(claimNumber);
          setShareClaimantName(claimantName || '-');
          openDialogForClaim(claimNumber, policyEkey, policyNumber);
        }}
        hidePaginationTabs={['recent-searches']}
      />
      <ShareDetailsDialog
        open={shareDialogOpen}
        onOpenChange={handleShareDialogOpen}
        title={SHARE_CLAIM_STATUS_CONFIG.title}
        description={SHARE_CLAIM_STATUS_CONFIG.description}
        descriptionHighlight={shareClaimNumber}
        claimBannerText={claimSummaryBanner}
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
        cancelLabel={SHARE_CLAIM_STATUS_CONFIG.cancelLabel}
        shareLabel={SHARE_CLAIM_STATUS_CONFIG.shareLabel}
        onCancel={() => handleShareDialogOpen(false)}
        onShare={() => {
          handleShareSubmit();
          trackClaimStatusShareSubmit(segmentBase, shareClaimNumber);
        }}
        canShare={canShare}
        showCloseButton
        sendSegmentEvent={() => {
          trackClaimStatusShareDialogView(segmentBase, shareClaimNumber || '');
        }}
      />
    </div>
  );
}
