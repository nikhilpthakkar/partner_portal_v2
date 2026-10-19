import { ClaimsTableStatus } from '@/lib/types/claims-management';
import { ApiResponse } from '@/lib/types/Global';
import { ClaimsTable, ClaimsTableFilters } from '@/lib/types/overview';
import { ClaimsTableData } from '@/lib/types/overview';

const emptyClaimsTableData: ClaimsTableData = {
  data: [],
  labels: {
    claimRequestNumber: '',
    coverId: '',
    claimantName: '',
    createdOn: '',
    status: '',
  },
  pagination: {
    currentPage: 1,
    pageSize: 1,
    totalRecords: 0,
    totalPages: 0,
    hasNext: false,
  },
};

export const mapClaimsTableApiToCard = (
  response: ApiResponse<ClaimsTable, ClaimsTableFilters> | undefined,
): ClaimsTableData => {
  if (!response) return emptyClaimsTableData;

  const { claims, pagination } = response.data;

  return {
    data: claims.map((claim) => ({
      claimRequestNumber: claim?.claimRequestNumber,
      status: mapStatusToClaimStatus(claim.statusGroup),
      claimantName: claim?.claimantName || '-',
      coverId: claim?.coverId,
      createdOn: claim?.createdOn || '',
    })),

    labels: {
      claimRequestNumber: 'Claim Number',
      coverId: 'Cover',
      claimantName: 'Claimant Name',
      status: 'Status',
      createdOn: 'Created On',
    },

    pagination,
  };
};

export const mapStatusToClaimStatus = (statusGroup: string): ClaimsTableStatus => {
  const normalized = statusGroup.toLowerCase().replace(/[\s_-]/g, '');

  if (normalized === 'registered') return 'Registered';
  if (normalized === 'inprogress') return 'In Progress';
  if (normalized === 'documentrequested' || normalized === 'pendingdocuments') {
    return 'Document Requested';
  }
  if (normalized === 'bankdetailsrequested') {
    return 'Bank Detail Requested';
  }
  if (normalized === 'paid' || normalized === 'success') return 'Paid';
  if (normalized === 'rejected' || normalized === 'failed') return 'Rejected';
  if (normalized === 'closed') return 'Closed';
  if (normalized === 'withdrawn') return 'Withdrawn';

  return 'In Progress';
};

export const statusStyles: Record<ClaimsTableStatus, string> = {
  Registered:
    'bg-endorse-policy-badge-warning-bg text-endorse-policy-badge-warning-text border-endorse-policy-badge-warning-border',
  'In Progress':
    'bg-endorse-policy-badge-warning-bg text-endorse-policy-badge-warning-text border-endorse-policy-badge-warning-border',
  'Document Requested':
    'bg-endorse-policy-badge-warning-bg text-endorse-policy-badge-warning-text border-endorse-policy-badge-warning-border',
  'Bank Detail Requested':
    'bg-endorse-policy-badge-warning-bg text-endorse-policy-badge-warning-text border-endorse-policy-badge-warning-border',
  Paid: 'bg-endorse-policy-badge-success-bg text-endorse-policy-badge-success-text border-endorse-policy-badge-success-border',
  Rejected: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
  Closed: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
  Withdrawn: 'bg-recent-searches-status-inactive-bg text-recent-searches-status-text',
};
