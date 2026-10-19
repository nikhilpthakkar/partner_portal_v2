import { useMemo, useState } from 'react';
import ErrorCard from '@/components/molecules/ErrorCard';
import PolicyClaimsHistoryTable from '@/components/organisms/PolicyClaimsHistoryTable';
import PolicyClaimsHistoryTabSkelton from '@/components/molecules/skeltons/PolicyClaimsHistoryTabSkelton';
import { mapPolicyClaimsToTable } from '@/lib/adapter/policy-details/policyClaims.adapter';
import {
  POLICY_DETAILS_QUERY_KEY,
  usePolicyClaimsQuery,
  usePolicyDetailsQuery,
} from '@/lib/query/policyDetails.queries';
import type {
  PolicyClaimsHistoryRow,
  PolicyClaimsHistoryTable as PolicyClaimsHistoryTableType,
} from '@/lib/types/policy-management/policyDetails';
import { useInsuredSelect } from '@/lib/hooks/useInsuredSelect';
import { useQueryClient } from '@tanstack/react-query';
import { usePartnerStore } from '@/lib/store/partner.store';
import type { ApiResponse } from '@/lib/types/Global';
import type {
  PolicyDetailsFilters,
  PolicyDetailsResponse,
} from '@/lib/types/policy-management/policyDetailsApi';
import { ROWS_PER_PAGE_OPTIONS } from '@/lib/constants/global.constants';
import { useParams, useRouter } from 'next/navigation';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackPolicyClaimsHistoryShare,
  trackPolicyClaimsHistoryView,
} from '@/lib/segment/track/policy';

type PolicyClaimsHistoryTabProps = {
  policyNumber: string;
  onShareClick: (row: PolicyClaimsHistoryRow) => void;
};

const DEFAULT_CLAIMS_HISTORY_TABLE: PolicyClaimsHistoryTableType = {
  labels: {
    claimId: 'Claim ID',
    date: 'Date',
    amount: 'Paid Amount',
    type: 'Type',
    status: 'Status',
    actions: 'Actions',
  },
  rows: [],
  pagination: {
    page: 1,
    rowsPerPage: 15,
    rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
  },
};

export default function PolicyClaimsHistoryTab({
  policyNumber,
  onShareClick,
}: PolicyClaimsHistoryTabProps) {
  const segmentBase = useSegmentPartnerBase();
  const baseTable = DEFAULT_CLAIMS_HISTORY_TABLE;
  const router = useRouter();
  const { partner } = useParams<{ partner: string }>();
  const queryClient = useQueryClient();
  const { partnerId, lob, productIds } = usePartnerStore();

  const cachedPolicyDetailsResponse = useMemo(
    () =>
      queryClient.getQueryData<ApiResponse<PolicyDetailsResponse, PolicyDetailsFilters>>([
        ...POLICY_DETAILS_QUERY_KEY,
        partnerId,
        lob,
        productIds,
        policyNumber,
        1,
        10,
      ]),
    [queryClient, partnerId, lob, productIds, policyNumber],
  );
  const shouldFetchPolicyDetails = !cachedPolicyDetailsResponse;
  const { data: policyDetailsResponse, isLoading: isInsuredLoading } = usePolicyDetailsQuery({
    policyNumber,
    enabled: shouldFetchPolicyDetails,
  });
  const resolvedPolicyDetailsResponse = cachedPolicyDetailsResponse ?? policyDetailsResponse;
  const { insuredOptions, selectedInsured, setSelectedInsured, isDisabled, placeholder } =
    useInsuredSelect({
      policyDetailsResponse: resolvedPolicyDetailsResponse,
      isLoading: isInsuredLoading,
    });
  const selectedInsuredName = useMemo(
    () => insuredOptions.find((option) => option.value === selectedInsured)?.label,
    [insuredOptions, selectedInsured],
  );
  const shouldFetchClaims =
    Boolean(policyNumber) && (!!selectedInsuredName || !insuredOptions.length);
  const [page, setPage] = useState(baseTable.pagination.page);
  const [rowsPerPage, setRowsPerPage] = useState(baseTable.pagination.rowsPerPage);

  const {
    data: policyClaimsResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = usePolicyClaimsQuery({
    policyNumber,
    page,
    size: rowsPerPage,
    enabled: shouldFetchClaims,
  });

  const resolvedTable = useMemo(
    () => mapPolicyClaimsToTable(baseTable, policyClaimsResponse),
    [baseTable, policyClaimsResponse],
  );

  if (isError) {
    return (
      <>
        <ErrorCard
          title="Unable to load claims history"
          description={error?.response?.data?.message ?? 'Please try again.'}
          className="mt-4 h-[66vh]"
        />
      </>
    );
  }

  const totalPages =
    policyClaimsResponse?.data?.pagination?.totalPages ??
    Math.max(1, Math.ceil(resolvedTable.rows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const endIndex = safePage * rowsPerPage;
  const visibleRows = policyClaimsResponse?.data
    ? resolvedTable.rows
    : resolvedTable.rows.slice(startIndex, endIndex);
  const isClaimsLoading = isLoading || isFetching;

  return (
    <div className="flex flex-col gap-4">
      <PolicyClaimsHistoryTable
        data={{ ...resolvedTable, rows: isClaimsLoading ? [] : visibleRows }}
        page={safePage}
        rowsPerPage={rowsPerPage}
        totalPages={totalPages}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onShareClick={(row) => {
          trackPolicyClaimsHistoryShare(segmentBase, {
            policy_number: policyNumber,
            claim_number: row.claimId,
          });
          onShareClick(row);
        }}
        onViewClick={(row) => {
          trackPolicyClaimsHistoryView(segmentBase, {
            policy_number: policyNumber,
            claim_number: row.claimId,
          });
          router.push(
            `/${partner}/dashboard/claims-management/claim-details?claimNumber=${encodeURIComponent(row.claimId)}`,
          );
        }}
        emptyState={
          isClaimsLoading ? (
            <PolicyClaimsHistoryTabSkelton />
          ) : (
            <ErrorCard
              title="No claims found"
              description="There are no claims for this policy yet."
              className="border-none shadow-none h-[64vh]"
            />
          )
        }
      />
    </div>
  );
}
