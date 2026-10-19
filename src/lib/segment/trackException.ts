import { SegmentEventNameTypes } from '@/lib/constants/segments.constants';
import { sendSegmentEvent } from '@/lib/segment';
import type { SegmentExceptionPayload, SegmentPartnerBase } from '@/lib/types/segment.payloads';
import { forwardExceptionToDatadog } from '@/lib/utils/datadogRum';

export type TrackExceptionParams = Omit<
  SegmentExceptionPayload,
  keyof SegmentPartnerBase | 'exception_message'
> & {
  exception_message?: string;
};

const resolveExceptionMessage = (
  exceptionType?: string,
  exceptionMessage?: string,
  fallbackMessage = 'An error occurred',
): string => {
  if (exceptionMessage) return exceptionMessage;
  if (exceptionType) return `Unable to load ${exceptionType} data`;
  return fallbackMessage;
};

export function trackException(base: SegmentPartnerBase, params: TrackExceptionParams): void {
  sendSegmentEvent(SegmentEventNameTypes.EXCEPTION, {
    ...base,
    ...params,
    exception_message: resolveExceptionMessage(
      params.exception_type,
      params.exception_message,
    ),
  });
  forwardExceptionToDatadog({
    page: params.page,
    page_workflow: params.page_workflow,
    exception_type: params.exception_type,
    exception_message: resolveExceptionMessage(
      params.exception_type,
      params.exception_message,
    ),
  });
}
