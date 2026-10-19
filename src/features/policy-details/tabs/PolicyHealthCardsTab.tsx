import PolicyHealthCard from '@/components/organisms/PolicyHealthCard';
import PolicyHealthCardsTabSkelton from '@/components/molecules/skeltons/PolicyHealthCardsTabSkelton';
import {
  useDownloadPolicyHealthCardPdfQuery,
  useGetAllPolicyHealthCardsQuery,
} from '@/lib/query/policyHealthCard.queries';
import ErrorCard from '@/components/molecules/ErrorCard';
import { useEffect, useMemo, useState } from 'react';
import { usePolicyHealthCardStore } from '@/lib/store/policyHealthCard.store';
import type {
  PolicyHealthCard as PolicyHealthCardType,
  PolicyDetailsPanel,
  PolicyHealthCardActionType,
} from '@/lib/types/policy-management/policyDetails';
import { toast } from 'sonner';
import { mapHealthCardDataToCard } from '@/lib/adapter/policy-details/policyHealthCard.adapter';
import { downloadFileFromS3Url } from '@/lib/utils';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { trackPolicyHealthCardsDownload } from '@/lib/segment/track/policy';

type PolicyHealthCardsTabProps = {
  panel?: PolicyDetailsPanel;
  policyId?: string;
  onHealthCardAction?: (type: PolicyHealthCardActionType, uhid: string) => void;
};

const getHealthCardUhid = (card: PolicyHealthCardType) =>
  card.items
    .flat()
    .find((item) => item.id === 'health-card-uhid')
    ?.value.trim() ?? '';

export default function PolicyHealthCardsTab({
  panel,
  policyId,
  onHealthCardAction,
}: PolicyHealthCardsTabProps) {
  const segmentBase = useSegmentPartnerBase();
  const { setPolicyId } = usePolicyHealthCardStore();
  const { downloadPolicyHealthCardPdf } = useDownloadPolicyHealthCardPdfQuery();
  const [downloadingUhid, setDownloadingUhid] = useState('');
  useEffect(() => {
    if (policyId) {
      setPolicyId(policyId);
    }
  }, [policyId, setPolicyId]);

  const {
    data: healthCardsResponse,
    isLoading: isHealthCardsLoading,
    isError: isHealthCardsError,
  } = useGetAllPolicyHealthCardsQuery();

  const mappedHealthCards = useMemo(
    () => healthCardsResponse?.data?.map(mapHealthCardDataToCard) ?? [],
    [healthCardsResponse?.data],
  );

  const fallbackHealthCard = panel?.healthCard
    ? [{ uhid: getHealthCardUhid(panel.healthCard), card: panel.healthCard }]
    : [];

  const healthCards = mappedHealthCards.length ? mappedHealthCards : fallbackHealthCard;

  const handleHealthCardItemAction = async (type: PolicyHealthCardActionType, uhid: string) => {
    if (type !== 'download') {
      onHealthCardAction?.(type, uhid);
      return;
    }

    if (!policyId || !uhid || downloadingUhid) {
      return;
    }

    setDownloadingUhid(uhid);
    trackPolicyHealthCardsDownload(segmentBase, {
      policy_number: policyId,
      entity_name: uhid,
    });
    try {
      const response = await downloadPolicyHealthCardPdf(uhid);
      const pdfUrl = response.data.url;
      if (!pdfUrl) {
        toast.error('Health card download link is unavailable.');
        return;
      }
      await downloadFileFromS3Url(pdfUrl, response.data.fileName);
      toast.success('Your health card download request was successful.');
    } catch {
      toast.error('Failed to download health card.');
    } finally {
      setDownloadingUhid('');
    }
  };

  if (isHealthCardsLoading) {
    return <PolicyHealthCardsTabSkelton />;
  }

  if (isHealthCardsError) {
    return (
      <ErrorCard
        title="Unable to load health cards"
        description="Please try again."
        className="mt-4"
      />
    );
  }

  if (!healthCards.length) {
    return (
      <ErrorCard
        title="No health cards found"
        description="There are no health cards available for this policy."
        className="mt-4"
      />
    );
  }

  return (
    <div className="h-[67vh] overflow-y-auto p-1">
      <div className="flex flex-wrap gap-4">
        {healthCards.map(({ uhid, card }, index) => (
          <PolicyHealthCard
            key={`${card.title}-${uhid || index}`}
            data={card}
            loadingActionType={downloadingUhid === uhid ? 'download' : undefined}
            onAction={(type) => handleHealthCardItemAction(type, uhid)}
          />
        ))}
      </div>
    </div>
  );
}
