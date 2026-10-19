import {
  PageNames,
  PageWorkflowNames,
  SegmentEventNameTypes,
} from '@/lib/constants/segments.constants';
import { sendSegmentEvent } from '@/lib/segment';
import type { SegmentPartnerBase } from '@/lib/types/segment.payloads';

export function trackReportsPageView(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.REPORTS_PAGE,
    page_workflow: PageWorkflowNames.REPORTS,
  });
}
