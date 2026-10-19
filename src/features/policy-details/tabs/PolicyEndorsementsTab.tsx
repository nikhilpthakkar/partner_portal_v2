import { useMemo, useState } from 'react';
import ErrorCard from '@/components/molecules/ErrorCard';
import PolicyEndorsementsTable from '@/components/organisms/PolicyEndorsementsTable';
import PolicyClaimsHistoryTabSkelton from '@/components/molecules/skeltons/PolicyClaimsHistoryTabSkelton';
import { mapPolicyEndorsementsToTable } from '@/lib/adapter/policy-details/policyEndorsements.adapter';
import { usePolicyEndorsementsQuery } from '@/lib/query/policyDetails.queries';
import type { PolicyEndorsementsTableData } from '@/lib/types/policy-management/policyDetails';
import { ROWS_PER_PAGE_OPTIONS } from '@/lib/constants/global.constants';

type PolicyEndorsementsTabProps = {
  policyNumber: string;
};

const DEFAULT_ENDORSEMENTS_TABLE: PolicyEndorsementsTableData = {
  labels: {
    type: 'Type',
    date: 'Date',
    applicableFor: 'Applicable For',
    createdBy: 'Created By',
    description: 'Description',
    status: 'Status',
  },
  rows: [],
  pagination: {
    page: 1,
    rowsPerPage: 10,
    rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
  },
};

export default function PolicyEndorsementsTab({ policyNumber }: PolicyEndorsementsTabProps) {
  const baseTable = DEFAULT_ENDORSEMENTS_TABLE;
  const [page, setPage] = useState(baseTable.pagination.page);
  const [rowsPerPage, setRowsPerPage] = useState(baseTable.pagination.rowsPerPage);

  const {
    data: policyEndorsementsResponse,
    isLoading,
    isError,
    error,
  } = usePolicyEndorsementsQuery({
    policyNumber,
    page: page - 1,
    size: rowsPerPage,
    includeFullData: true,
    enabled: Boolean(policyNumber),
  });

  const resolvedTable = useMemo(
    () => mapPolicyEndorsementsToTable(baseTable, policyEndorsementsResponse),
    [baseTable, policyEndorsementsResponse],
  );

  if (isLoading) {
    return <PolicyClaimsHistoryTabSkelton />;
  }

  if (isError) {
    return (
      <ErrorCard
        title="Unable to load endorsements"
        description={error?.response?.data?.message ?? 'Please try again.'}
        className="mt-4 h-[66vh]"
      />
    );
  }

  if (!resolvedTable.rows.length) {
    return (
      <ErrorCard
        title="No endorsements found"
        description="There are no endorsements for this policy yet."
        className="mt-4 h-[66vh]"
      />
    );
  }

  const totalPages =
    policyEndorsementsResponse?.data?.pagination?.totalPages ??
    Math.max(1, Math.ceil(resolvedTable.rows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const visibleRows = policyEndorsementsResponse?.data
    ? resolvedTable.rows
    : resolvedTable.rows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  return (
    <div>
      <PolicyEndorsementsTable
        data={{ ...resolvedTable, rows: visibleRows }}
        page={safePage}
        rowsPerPage={rowsPerPage}
        totalPages={totalPages}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(1);
        }}
        onPageChange={setPage}
      />
    </div>
  );
}
