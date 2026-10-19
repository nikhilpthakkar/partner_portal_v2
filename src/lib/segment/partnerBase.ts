import type { SegmentPartnerBase } from '@/lib/types/segment.payloads';

/** Build the standard partner block from store fields (used when props are passed instead of a hook). */
export function segmentPartnerBaseFromPartner(
  lob: string,
  partnerId: string,
  productIds: string[],
): SegmentPartnerBase {
  return {
    product: lob,
    partner: partnerId,
    plan_id: productIds.join(','),
  };
}
