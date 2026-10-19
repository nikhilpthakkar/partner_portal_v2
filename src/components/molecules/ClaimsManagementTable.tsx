'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import MultiSearchSelect from '@/components/molecules/MultiSearchSelect';
import ErrorCard from '@/components/molecules/ErrorCard';
import Pagination from '@/components/atoms/Pagination';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatDate, formatEnum } from '@/lib/utils';
import {
  useClaimStatusCountQuery,
  useClaimsDetailQuery,
  useRecentSearchesQuery,
} from '@/lib/query/claimsDetail.queries';
import { useClaimsDetailStore } from '@/lib/store/claimsDetail.store';
import { useClaimsCoverFilterOptions } from '@/lib/hooks/useClaimsCoverFilterOptions';
import { CLAIMS_COVER_FILTER_ALL_LABEL } from '@/lib/constants/claimsDetail.constants';
import type { SelectOption } from '@/lib/types/Global';
import type { ClaimsTableLabels } from '@/lib/types/claims-management';
import { Button } from '@/components/ui/button';
import { CircleAlert, EyeIcon, Share2 } from 'lucide-react';
import { statusGroups } from '@/lib/constants/claimsDetail.constants';
import { ROWS_PER_PAGE_OPTIONS } from '@/lib/constants/global.constants';
import PolicyManagementTableSkelton from './skeltons/PolicyManagementTableSkelton';
import { ClaimStatusCountItem } from '@/lib/types/claims-management/claimsDetailApi';
import { mapStatusToClaimStatus, statusStyles } from '@/lib/adapter/overview/claimsTable.adapter';
import TruncatedTooltipText from '@/components/molecules/TruncatedTooltipText';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { trackClaimsManagementTableQueryException } from '@/lib/segment/track/claims';

type ClaimsManagementTableProps = {
  tabs: SelectOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  labels: ClaimsTableLabels;
  errorTitle?: string;
  onReferenceClick?: (referenceNumber: string) => void;
  onShareClick?: (
    claimNumber: string,
    claimantName: string,
    policyEkey: string,
    policyNumber: string,
  ) => void;
  hidePaginationTabs?: string[];
  className?: string;
};

export default function ClaimsManagementTable({
  tabs,
  activeTab,
  onTabChange,
  labels,
  errorTitle = 'Unable to load claims',
  onReferenceClick = () => {},
  onShareClick = () => {},
  hidePaginationTabs = [],
  className,
}: ClaimsManagementTableProps) {
  const isPaginationHidden = hidePaginationTabs.includes(activeTab);
  const isRecentSearchesTab = activeTab === 'recent-searches';
  const segmentBase = useSegmentPartnerBase();
  const [coverFilterSearch, setCoverFilterSearch] = useState('');
  const { page, size, coverIds, setPage, setSize: setPageSize, setStatusGroups, setCoverIds } =
    useClaimsDetailStore();
  const { coverOptions, isLoading: isCoverOptionsLoading } = useClaimsCoverFilterOptions();

  const claimsQuery = useClaimsDetailQuery({
    enabled: !isRecentSearchesTab,
    includeSearchFilters: activeTab === 'search-results',
  });

  const recentSearchesQuery = useRecentSearchesQuery({
    enabled: isRecentSearchesTab,
  });

  const activeQuery = isRecentSearchesTab ? recentSearchesQuery : claimsQuery;
  const tabStatusGroups = useMemo(
    () =>
      Array.from(
        new Set(
          Object.entries(statusGroups)
            .filter(([tabKey]) => tabKey !== 'recent-searches')
            .filter(([tabKey]) => tabKey !== 'rejected-claims')
            .filter(([tabKey]) => tabKey !== 'settled-claims')
            .flatMap(([, groups]) => groups),
        ),
      ),
    [],
  );
  const { data: claimStatusCountResponse } = useClaimStatusCountQuery({
    statusGroups: tabStatusGroups,
  });

  const {
    data: claimsDetailResponse,
    isLoading: isClaimsDetailLoading,
    isError: isClaimsDetailError,
  } = activeQuery;

  const exceptionType = useMemo(() => {
    if (!isClaimsDetailError) return undefined;
    return isRecentSearchesTab ? 'recent_search_claims' : 'fetch_claims';
  }, [isClaimsDetailError, isRecentSearchesTab]);

  useEffect(() => {
    if (!isClaimsDetailError) return;
    trackClaimsManagementTableQueryException(segmentBase, {
      exception_type: exceptionType,
      exception_message: exceptionType
        ? `Unable to load ${exceptionType} data`
        : 'Unable to load claims data',
    });
  }, [exceptionType, isClaimsDetailError, segmentBase]);

  useEffect(() => {
    setStatusGroups(statusGroups[activeTab] ?? []);
  }, [activeTab, setStatusGroups]);

  const statusGroupCountMap = useMemo(() => {
    const countMap: Record<string, number> = {};
    const statusCounts = claimStatusCountResponse?.data?.statusCounts ?? [];

    statusCounts.forEach(({ statusGroup, count }: ClaimStatusCountItem) => {
      countMap[statusGroup] = count;
    });
    return countMap;
  }, [claimStatusCountResponse?.data?.statusCounts]);

  const resolvedTabs = useMemo(
    () =>
      tabs.map((tab) => {
        const tabStatusGroupList = statusGroups[tab.value];

        if (!tabStatusGroupList?.length) {
          return tab;
        }

        const count = tabStatusGroupList.reduce(
          (sum, statusGroup) => sum + (statusGroupCountMap[statusGroup] ?? 0),
          0,
        );

        if (count === 0) return { ...tab, label: tab.label };
        return { ...tab, label: `${tab.label} (${count})` };
      }),
    [tabs, statusGroupCountMap],
  );

  const { resolvedRows, currentPage, pageSize, totalPages } = useMemo(() => {
    if (!claimsDetailResponse?.data) {
      return {
        resolvedRows: [],
        currentPage: page,
        pageSize: size,
        totalPages: 1,
      };
    }

    const { claims, pagination } = claimsDetailResponse.data;
    const safePageSize = Math.max(1, Number(pagination?.pageSize) || size || 1);
    const safeTotalPages = Math.max(1, Number(pagination?.totalPages) || 1);
    const safeCurrentPage = Math.min(
      safeTotalPages,
      Math.max(1, Number(pagination?.currentPage) || page || 1),
    );

    return {
      resolvedRows: claims.map((claim) => ({
        id: claim.claimRequestNumber,
        claimNumber: claim.claimRequestNumber,
        policyEkey: claim.policyEkey || '',
        cover: formatEnum(claim.coverId) || '-',
        claimantName: claim.claimUsers?.claimants?.[0]?.name ?? claim.claimantName ?? '-',
        claimantPhone: claim.claimUsers?.claimants?.[0]?.phone ?? claim.claimantPhone ?? '-',
        createdOn: formatDate(claim.fnolCompletedOn ?? claim.createdOn) || '-',
        status: mapStatusToClaimStatus(claim.statusGroup),
        policyNumber: claim.policyNumber || '',
      })),
      currentPage: safeCurrentPage,
      pageSize: safePageSize,
      totalPages: safeTotalPages,
    };
  }, [claimsDetailResponse, page, size]);

  const hasRows = resolvedRows.length > 0;
  const isTableReady = !isClaimsDetailLoading && !isClaimsDetailError && hasRows;
  const showEmptyState = !isClaimsDetailLoading && !isClaimsDetailError && !hasRows;
  const isSearchResultsTab = activeTab === 'search-results';
  const emptyStateTitle = isSearchResultsTab ? errorTitle : 'No claims found';

  const renderHeader = () => (
    <Table className="table-fixed w-full">
      <TableHeader className="sticky top-0 z-10 bg-claims-management-table-header-bg">
        <TableRow className="border-claims-table-border h-10">
          <TableHead className="w-width-220">{labels.claimNumber}</TableHead>
          <TableHead>
            <TruncatedTooltipText text={labels.cover} />
          </TableHead>
          <TableHead>
            <TruncatedTooltipText text={labels.claimantName} />
          </TableHead>
          <TableHead>
            <TruncatedTooltipText text={labels.claimantPhone} />
          </TableHead>
          <TableHead>
            <TruncatedTooltipText text={labels.createdOn} />
          </TableHead>
          <TableHead className="w-width-180">
            <TruncatedTooltipText text={labels.status} />
          </TableHead>
          <TableHead className="text-right">
            <TruncatedTooltipText text={labels.actions} />
          </TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  );

  const renderSkeletonRows = () => {
    return <PolicyManagementTableSkelton />;
  };

  const renderMessageState = (title: string, icon?: ReactNode) => (
    <div className="flex items-center justify-center px-4 py-25">
      <div className="w-full max-w-md">
        <ErrorCard icon={icon} title={title} className="border-none shadow-none" />
      </div>
    </div>
  );

  const renderRows = () => (
    <div
      className={cn('h-[50vh] overflow-y-auto always-scrollbar', !isPaginationHidden && 'h-[47vh]')}
    >
      <Table className="table-fixed w-full">
        <TableBody>
          {resolvedRows.map((row) => (
            <TableRow key={row.id} className="border-claims-management-table-border h-10">
              <TableCell className="w-width-220">
                <button
                  type="button"
                  onClick={() => onReferenceClick(row.claimNumber)}
                  className="text-claims-management-table-link text-sm cursor-pointer"
                >
                  {row.claimNumber}
                </button>
              </TableCell>
              <TableCell className="text-sm">
                <TruncatedTooltipText text={row.cover} />
              </TableCell>
              <TableCell className="text-sm">
                <TruncatedTooltipText text={row.claimantName} />
              </TableCell>
              <TableCell className="text-sm">
                <TruncatedTooltipText text={row.claimantPhone} />
              </TableCell>
              <TableCell className="text-sm">
                <TruncatedTooltipText text={row.createdOn} />
              </TableCell>
              <TableCell className="w-width-180">
                <Badge
                  className={cn(
                    'border-transparent px-2 py-0.5 text-xs font-medium',
                    statusStyles[row.status],
                  )}
                >
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm flex items-center gap-4 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-recent-searches-action"
                  aria-label="Edit policy"
                  onClick={() => onReferenceClick(row.claimNumber)}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-recent-searches-action"
                  aria-label="Share policy"
                  onClick={() => {
                    onShareClick(
                      row.claimNumber,
                      row.claimantName,
                      row.policyEkey,
                      row.policyNumber,
                    );
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      <div className="border-claims-management-table-border rounded-claims-management-table w-full overflow-hidden border bg-white">
        <div className="border-claims-management-table-border border-b pt-2">
          <UnderlineTabs value={activeTab} onValueChange={onTabChange} tabs={resolvedTabs} />
        </div>
        {coverOptions.length > 0 ? (
          <div className="border-claims-management-table-border flex items-center justify-start border-b px-4 py-2">
            <MultiSearchSelect
              label="Cover"
              values={coverIds}
              options={coverOptions}
              onValuesChange={setCoverIds}
              searchValue={coverFilterSearch}
              onSearchChange={setCoverFilterSearch}
              placeholder={CLAIMS_COVER_FILTER_ALL_LABEL}
              allLabel={CLAIMS_COVER_FILTER_ALL_LABEL}
              emptyLabel="No covers found"
              disabled={isCoverOptionsLoading}
              contentAlign="start"
              summaryStyle="compact"
              deferCommit
              className="min-w-fit max-w-multi-select-trigger-width w-auto cursor-pointer"
            />
          </div>
        ) : null}
        <div className="overflow-x-auto overflow-hidden border border-transparent">
          {renderHeader()}
          {isClaimsDetailLoading && renderSkeletonRows()}
          {isClaimsDetailError && renderMessageState(errorTitle)}
          {isTableReady && renderRows()}
          {showEmptyState &&
            renderMessageState(emptyStateTitle, <CircleAlert className="size-8" />)}

          {!isPaginationHidden && !isClaimsDetailLoading && !isClaimsDetailError && (
            <Pagination
              rowsPerPage={pageSize}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              onRowsPerPageChange={(value) => setPageSize(value)}
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(value) => setPage(value)}
            />
          )}
        </div>
      </div>

      {isPaginationHidden && !isClaimsDetailLoading && !isClaimsDetailError && (
        <div className="mt-4 flex justify-end">
          <p className="text-sm font-light leading-normal text-muted-foreground">
            Showing only the last 15 claims in the order of most recently searched interacted
          </p>
        </div>
      )}
    </div>
  );
}
