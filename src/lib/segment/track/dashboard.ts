import {
  ActionEventNames,
  PageNames,
  PageWorkflowNames,
  SegmentActionName,
  SegmentEventNameTypes,
} from '@/lib/constants/segments.constants';
import { sendSegmentEvent } from '@/lib/segment';
import { trackException } from '@/lib/segment/trackException';
import type { SegmentPartnerBase } from '@/lib/types/segment.payloads';

export function trackDashboardOverviewView(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.DASHBOARD_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.DASHBOARD,
  });
}

export function trackDashboardOverviewException(
  base: SegmentPartnerBase,
  params: { exception_type?: string },
) {
  if (!params.exception_type) return;
  trackException(base, {
    page: PageNames.DASHBOARD_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.DASHBOARD,
    exception_type: params.exception_type,
  });
}

export function trackDashboardRegisterInterest(base: SegmentPartnerBase, capabilityId: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.DASHBOARD_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.DASHBOARD,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.REGISTER_INTEREST,
    entity_name: capabilityId,
  });
}
