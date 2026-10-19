import { useMemo } from 'react';
import ErrorCard from '@/components/molecules/ErrorCard';
import PolicyClaimsHistoryTabSkelton from '@/components/molecules/skeltons/PolicyClaimsHistoryTabSkelton';
import PolicyCommunicationTable from '@/components/organisms/PolicyCommunicationTable';
import { mapPolicyCommunicationToTable } from '@/lib/adapter/policy-details/policyCommunication.adapter';
import { useGetAllClaimRecipientsQuery } from '@/lib/query/claimsDetail.queries';
import { usePolicyCommunicationsQuery } from '@/lib/query/policyDetails.queries';
import type { PolicyCommunicationTable as PolicyCommunicationTableType } from '@/lib/types/policy-management/policyDetails';

type PolicyCommunicationTabProps = {
  policyNumber: string;
  policyId?: string;
};

const DEFAULT_COMMUNICATION_TABLE: PolicyCommunicationTableType = {
  labels: {
    type: 'Type',
    recipientType: 'Recipient type',
    subject: 'Subject',
    date: 'Date',
    status: 'Status',
    target: 'Recipient',
  },
  rows: [],
};

export default function PolicyCommunicationTab({
  policyNumber,
  policyId = '',
}: PolicyCommunicationTabProps) {
  const {
    data: policyCommunicationResponse,
    isLoading,
    isError,
    error,
  } = usePolicyCommunicationsQuery({
    policyNumber,
    page: 1,
    pageSize: 15,
    enabled: Boolean(policyNumber),
  });
  const { data: recipientsResponse } = useGetAllClaimRecipientsQuery({ policyId });
  const recipients = recipientsResponse?.data ?? [];

  const resolvedTable = useMemo(
    () =>
      mapPolicyCommunicationToTable(
        DEFAULT_COMMUNICATION_TABLE,
        policyCommunicationResponse,
        recipients,
      ),
    [policyCommunicationResponse, recipients],
  );

  if (isLoading) {
    return <PolicyClaimsHistoryTabSkelton />;
  }

  if (isError) {
    return (
      <ErrorCard
        title="Unable to load communication logs"
        description={error?.response?.data?.message ?? 'Please try again.'}
        className="mt-4 h-[66vh]"
      />
    );
  }

  if (!resolvedTable.rows.length) {
    return (
      <ErrorCard
        title="No communication logs found"
        description="There are no communication logs for this policy yet."
        className="mt-4 h-[66vh]"
      />
    );
  }

  return (
    <div>
      <PolicyCommunicationTable data={resolvedTable} />
    </div>
  );
}
