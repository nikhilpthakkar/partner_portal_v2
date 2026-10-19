import ErrorCard from '@/components/molecules/ErrorCard';
import PolicyInformationSkelton from '@/components/molecules/skeltons/PolicyInformationSkelton';
import InformationCard from '@/components/organisms/InformationCard';
import type { ClaimSummarySection } from '@/lib/types/claims-management/claimDetails';
import { mapClaimSummaryToInformationColumns } from '@/lib/adapter/claims-detail/claimSummary.adapter';
import { useClaimTabData } from './useClaimTabData';

export default function ClaimantInformationTab() {
  const { panel, isLoading, isError, error } = useClaimTabData({
    panelId: 'claimant-information',
  });
  const summary: ClaimSummarySection | undefined = panel?.summary;

  const columns = mapClaimSummaryToInformationColumns(summary);

  if (isLoading) {
    return <PolicyInformationSkelton />;
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col gap-3">
        <ErrorCard
          title="Unable to load claimant information"
          description={error?.response?.data?.message ?? 'Please try again.'}
        />
      </div>
    );
  }

  return <InformationCard title={summary.title} columns={columns} />;
}
