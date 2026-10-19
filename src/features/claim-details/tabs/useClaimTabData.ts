import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { mapClaimToViewModel } from '@/lib/adapter/claims-detail/claimsDetails.adapter';
import { useCachedClaimDetailsQuery } from '@/lib/query/claimsDetail.queries';

type UseClaimTabDataArgs = {
  panelId?: string;
};

export const useClaimTabData = ({ panelId }: UseClaimTabDataArgs = {}) => {
  const searchParams = useSearchParams();
  const claimNumber = searchParams.get('claimNumber')?.trim() || '';
  const {
    data: claimsDetailResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useCachedClaimDetailsQuery();

  const selectedClaim = useMemo(() => {
    const claims = claimsDetailResponse?.data?.claims ?? [];
    if (!claims.length) return undefined;
    if (!claimNumber) return claims[0];
    return claims.find((claim) => claim.claimRequestNumber === claimNumber) ?? claims[0];
  }, [claimsDetailResponse, claimNumber]);

  const mappedData = useMemo(() => {
    if (!selectedClaim) return undefined;
    return mapClaimToViewModel(selectedClaim);
  }, [selectedClaim]);

  const panel = mappedData?.panels[panelId ?? 'claim-overview'];

  return {
    mappedData,
    panel,
    isLoading,
    isFetching,
    isError,
    error,
  };
};
