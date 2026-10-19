import {
  ActionEventNames,
  PageNames,
  PageWorkflowNames,
  SegmentActionName,
  SegmentEventNameTypes,
} from '@/lib/constants/segments.constants';
import { sendSegmentEvent } from '@/lib/segment';
import type { SegmentPartnerBase } from '@/lib/types/segment.payloads';
import type { SegmentPageContext } from '@/lib/segment/pageContext';

export function trackLogoutAction(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.LOGOUT_PAGE,
    page_workflow: PageWorkflowNames.LOGOUT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.LOGOUT,
  });
}

export function trackSidebarNavigation(
  base: SegmentPartnerBase,
  params: SegmentPageContext & { entity_name: string; value: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: params.page,
    page_workflow: params.page_workflow,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SIDEBAR_NAVIGATION,
    entity_name: params.entity_name,
    value: params.value,
  });
}

export function trackGlobalPartnerFilterChange(
  base: SegmentPartnerBase,
  params: SegmentPageContext & { value: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: params.page,
    page_workflow: params.page_workflow,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CHANGE_GLOBAL_PARTNER_FILTER,
    value: params.value,
  });
}

export function trackGlobalLobFilterChange(
  base: SegmentPartnerBase,
  params: SegmentPageContext & { value: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: params.page,
    page_workflow: params.page_workflow,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CHANGE_GLOBAL_LOB_FILTER,
    value: params.value,
  });
}

export function trackGlobalProductFilterChange(
  base: SegmentPartnerBase,
  params: SegmentPageContext & { value: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: params.page,
    page_workflow: params.page_workflow,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CHANGE_GLOBAL_PRODUCT_FILTER,
    value: params.value,
  });
}
