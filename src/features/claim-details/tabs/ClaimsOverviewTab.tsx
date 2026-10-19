import { useMemo } from 'react';
import ErrorCard from '@/components/molecules/ErrorCard';
import PolicyInformationSkelton from '@/components/molecules/skeltons/PolicyInformationSkelton';
import InformationCard from '@/components/organisms/InformationCard';
import Skeleton from '@/components/ui/skeleton';
import type { ClaimSummarySection } from '@/lib/types/claims-management/claimDetails';
import { mapClaimSummaryToInformationColumns } from '@/lib/adapter/claims-detail/claimSummary.adapter';
import { useClaimTabData } from './useClaimTabData';
import { useParams, useRouter } from 'next/navigation';

export default function ClaimsOverviewTab() {
  const router = useRouter();
  const { partner } = useParams<{ partner: string }>();
  const { panel, isLoading, isFetching, isError, error } = useClaimTabData({
    panelId: 'claim-overview',
  });

  const summary: ClaimSummarySection | undefined = panel?.summary;

  const columns = useMemo(() => mapClaimSummaryToInformationColumns(summary), [summary]);

  const isInitialSummaryLoading = (isLoading || isFetching) && !summary;
  const isSummaryError = !isInitialSummaryLoading && (isError || !summary);

  return (
    <div>
      {isInitialSummaryLoading ? (
        <PolicyInformationSkelton />
      ) : isSummaryError ? (
        <ErrorCard
          title="Unable to load claim overview"
          description={error?.response?.data?.message ?? 'Please try again.'}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {isFetching && <Skeleton className="h-1 w-full" />}
          {summary && (
            <InformationCard
              title={summary.title}
              columns={columns}
              onActionClick={(value) =>
                router.push(
                  `/${partner}/dashboard/policy-management/policy-details?policyNumber=${encodeURIComponent(value)}`,
                )
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
