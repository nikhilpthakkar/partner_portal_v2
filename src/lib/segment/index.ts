import { EventProperties, SegmentEventNameTypes } from '@/lib/constants/segments.constants';
import { getSegmentUserContext, waitForSegmentUserContext } from '@/lib/segment/userContext';
import type {
  SegmentActionPayload,
  SegmentExceptionPayload,
  SegmentViewPayload,
} from '@/lib/types/segment.payloads';
import {
  pageEvent,
  trackEvent,
  waitForAnalyticsLoad,
} from '@acko-tech/building-blocks.ui.acko-analytics';

export const getSegmentKey = () => {
  try {
    const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
    if (isProduction) {
      return 'Db7qg80zZq79SffgRblhPHcSuBwraILN';
    } else {
      return 'OmV7jAWTCgzH5jCxRpM1UBbAJfGUsOOj';
    }
  } catch {
    return 'OmV7jAWTCgzH5jCxRpM1UBbAJfGUsOOj';
  }
};

function mergeProps(payload: SegmentViewPayload | SegmentActionPayload | SegmentExceptionPayload) {
  return {
    sub_product_name: EventProperties.SUB_PRODUCT_NAME,
    ...payload,
    ...getSegmentUserContext(),
  };
}

export function sendSegmentEvent(
  eventNameType: SegmentEventNameTypes.VIEW,
  payload: SegmentViewPayload,
): void;
export function sendSegmentEvent(
  eventNameType: SegmentEventNameTypes.ACTION,
  payload: SegmentActionPayload,
): void;
export function sendSegmentEvent(
  eventNameType: SegmentEventNameTypes.EXCEPTION,
  payload: SegmentExceptionPayload,
): void;

export function sendSegmentEvent(
  eventNameType: SegmentEventNameTypes,
  eventData: SegmentViewPayload | SegmentActionPayload | SegmentExceptionPayload,
) {
  void waitForSegmentUserContext().then(() => {
    const props = mergeProps(eventData);

    if (eventNameType === SegmentEventNameTypes.VIEW) {
      waitForAnalyticsLoad().then(() => pageEvent(eventNameType, props));
    } else if (
      eventNameType === SegmentEventNameTypes.ACTION ||
      eventNameType === SegmentEventNameTypes.EXCEPTION
    ) {
      trackEvent(eventNameType, props);
    }
  });
}

export type {
  SegmentActionPayload,
  SegmentExceptionPayload,
  SegmentPartnerBase,
  SegmentUserContext,
  SegmentUserType,
  SegmentViewPayload,
} from '@/lib/types/segment.payloads';

export { segmentPartnerBaseFromPartner } from '@/lib/segment/partnerBase';
export { trackException, type TrackExceptionParams } from '@/lib/segment/trackException';
