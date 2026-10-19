import { useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partner.store';
import type { SegmentPartnerBase } from '@/lib/types/segment.payloads';
import { segmentPartnerBaseFromPartner } from '@/lib/segment/partnerBase';

/**
 * Memoized Segment `product` / `partner` / `plan_id` block for the current partner configuration.
 */
export function useSegmentPartnerBase(): SegmentPartnerBase {
  const { lob, partnerId, productIds } = usePartnerStore();

  return useMemo(
    () => segmentPartnerBaseFromPartner(lob, partnerId, productIds),
    [lob, partnerId, productIds],
  );
}
