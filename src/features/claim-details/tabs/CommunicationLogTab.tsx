import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ErrorCard from '@/components/molecules/ErrorCard';
import ClaimDetailsTable from '@/components/organisms/ClaimDetailsTable';
import Skeleton from '@/components/ui/skeleton';
import { mapClaimCommunicationToTable } from '@/lib/adapter/claims-detail/claimsCommunication.adapter';
import {
  useClaimCommunicationsQuery,
  useGetAllClaimRecipientsQuery,
} from '@/lib/query/claimsDetail.queries';

export default function CommunicationLogTab({ policyEkey }: { policyEkey: string }) {
  const searchParams = useSearchParams();
  const claimNumber = searchParams.get('claimNumber')?.trim() || '';

  const { data: recipientsResponse } = useGetAllClaimRecipientsQuery({
    policyId: policyEkey ?? '',
  });
  const recipients = recipientsResponse?.data ?? [];

  const {
    data: communicationResponse,
    isLoading,
    isError,
    error,
  } = useClaimCommunicationsQuery({
    claimNumber,
    page: 1,
    pageSize: 10,
    enabled: Boolean(claimNumber),
  });
  const communicationTable = useMemo(
    () => mapClaimCommunicationToTable(communicationResponse, recipients),
    [communicationResponse, recipients],
  );

  if (isLoading) {
    return (
      <div className="rounded-policy-info-card border border-policy-info-border bg-policy-info-bg p-6">
        <Skeleton className="mb-4 h-6 w-56" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3">
        <ErrorCard
          title="Unable to load communication logs"
          description={error?.response?.data?.message ?? 'Please try again.'}
        />
      </div>
    );
  }

  if (!communicationTable.length) {
    return (
      <ErrorCard
        title="No communication logs found"
        description="There are no communication logs for this claim yet."
        className="mt-4"
      />
    );
  }

  return <ClaimDetailsTable variant="communication" data={communicationTable} />;
}
