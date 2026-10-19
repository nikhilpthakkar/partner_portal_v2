import type { ApiResponse } from '@/lib/types/Global';
import type { ClaimShareRecipientResponse } from '@/lib/types/claims-management/claimShareApi';
import type {
  ClaimsCommunicationFilters,
  ClaimsCommunicationResponse,
} from '@/lib/types/claims-management/claimsCommunicationApi';
import type { ClaimCommunicationRow } from '@/lib/types/claims-management/claimDetails';
import { buildCommunicationLogRows } from '@/lib/adapter/communicationLog.adapter';

export const mapClaimCommunicationToTable = (
  response?: ApiResponse<ClaimsCommunicationResponse, ClaimsCommunicationFilters>,
  recipients: ClaimShareRecipientResponse[] = [],
): ClaimCommunicationRow[] => {
  if (!response?.data?.communications?.length) return [];

  return buildCommunicationLogRows(response.data.communications, recipients);
};
