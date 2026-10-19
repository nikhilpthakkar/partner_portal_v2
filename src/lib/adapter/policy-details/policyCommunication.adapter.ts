import type { ApiResponse } from '@/lib/types/Global';
import type { ClaimShareRecipientResponse } from '@/lib/types/claims-management/claimShareApi';
import { buildCommunicationLogRows } from '@/lib/adapter/communicationLog.adapter';
import type {
  PolicyCommunicationFilters,
  PolicyCommunicationResponse,
} from '@/lib/types/policy-management/policyCommunicationApi';
import type { PolicyCommunicationTable } from '@/lib/types/policy-management/policyDetails';

export const mapPolicyCommunicationToTable = (
  baseTable: PolicyCommunicationTable,
  response?: ApiResponse<PolicyCommunicationResponse, PolicyCommunicationFilters>,
  recipients: ClaimShareRecipientResponse[] = [],
): PolicyCommunicationTable => ({
  ...baseTable,
  rows: buildCommunicationLogRows(response?.data?.communications ?? [], recipients),
});
