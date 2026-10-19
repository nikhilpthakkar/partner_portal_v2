import type { ApiResponse } from '@/lib/types/Global';
import type {
  PolicyEndorsementsFilters,
  PolicyEndorsementsResponse,
  PolicyEndorsement,
} from '@/lib/types/policy-management/policyEndorsementsApi';
import type {
  PolicyEndorsementsTableData,
  PolicyEndorsementsTableRow,
  PolicyEndorsementStatus,
} from '@/lib/types/policy-management/policyDetails';

const resolveDateLabel = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return value;
  }

  return dateValue.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const resolveStatusLabel = (status?: string): PolicyEndorsementStatus => {
  const normalized = status?.toLowerCase();

  switch (normalized) {
    case 'successful':
    case 'success':
      return 'Successful';
    case 'pending':
    case 'in_progress':
    case 'processing':
      return 'Pending';
    case 'failed':
    case 'failure':
    case 'rejected':
      return 'Failed';
    default:
      return 'Pending';
  }
};

const mapEndorsementRow = (
  endorsement: PolicyEndorsement,
  index: number,
): PolicyEndorsementsTableRow => ({
  id: endorsement.date ? `${endorsement.date}-${index}` : `endorsement-${index}`,
  type: endorsement.type || '-',
  date: resolveDateLabel(endorsement.date),
  applicableFor: endorsement.applicable_for || '-',
  createdBy: endorsement?.created_by?.email || '-',
  description: endorsement.description || '-',
  status: resolveStatusLabel(endorsement.status),
});

const mapEndorsementsTable = (
  baseTable: PolicyEndorsementsTableData,
  response?: ApiResponse<PolicyEndorsementsResponse, PolicyEndorsementsFilters>,
): PolicyEndorsementsTableData => ({
  ...baseTable,
  rows:
    response?.data?.endorsements?.map((endorsement, index) =>
      mapEndorsementRow(endorsement, index),
    ) ?? [],
  pagination: {
    ...baseTable.pagination,
    page:
      response?.data?.pagination?.currentPage !== undefined
        ? response.data.pagination.currentPage + 1
        : baseTable.pagination.page,
    rowsPerPage: response?.data?.pagination?.pageSize ?? baseTable.pagination.rowsPerPage,
  },
});

export const mapPolicyEndorsementsToTable = (
  baseTable: PolicyEndorsementsTableData,
  response?: ApiResponse<PolicyEndorsementsResponse, PolicyEndorsementsFilters>,
): PolicyEndorsementsTableData => mapEndorsementsTable(baseTable, response);
