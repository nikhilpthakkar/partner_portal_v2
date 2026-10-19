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

const SUPPORT_PAGE = PageNames.SUPPORT_DIALOG;
const SUPPORT_WORKFLOW = PageWorkflowNames.SUPPORT;

export function trackSupportDialogView(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: SUPPORT_PAGE,
    page_workflow: SUPPORT_WORKFLOW,
  });
}

export function trackSupportSelectCategory(base: SegmentPartnerBase, category: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SUPPORT_PAGE,
    page_workflow: SUPPORT_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SELECT_SUPPORT_CATEGORY,
    entity_name: 'issue_category',
    value: category,
  });
}

export function trackSupportSubmitTicket(
  base: SegmentPartnerBase,
  params: { category: string; document_count: number },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SUPPORT_PAGE,
    page_workflow: SUPPORT_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SUBMIT_SUPPORT_TICKET,
    entity_name: params.category,
    value: String(params.document_count),
  });
}

export function trackSupportUploadDocument(base: SegmentPartnerBase, fileName: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SUPPORT_PAGE,
    page_workflow: SUPPORT_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.UPLOAD_SUPPORT_DOCUMENT,
    entity_name: fileName,
  });
}

export function trackSupportRemoveDocument(base: SegmentPartnerBase, fileName: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SUPPORT_PAGE,
    page_workflow: SUPPORT_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.REMOVE_SUPPORT_DOCUMENT,
    entity_name: fileName,
  });
}

export function trackSupportCloseDialog(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SUPPORT_PAGE,
    page_workflow: SUPPORT_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CLOSE_SUPPORT_DIALOG,
    entity_name: 'support_dialog',
  });
}

export function trackSupportSubmitException(
  base: SegmentPartnerBase,
  params: { exception_message?: string } = {},
) {
  trackException(base, {
    page: SUPPORT_PAGE,
    page_workflow: SUPPORT_WORKFLOW,
    exception_type: 'create_support_ticket',
    exception_message: params.exception_message,
  });
}

export function trackSupportUploadException(
  base: SegmentPartnerBase,
  params: { exception_message?: string } = {},
) {
  trackException(base, {
    page: SUPPORT_PAGE,
    page_workflow: SUPPORT_WORKFLOW,
    exception_type: 'upload_support_document',
    exception_message: params.exception_message,
  });
}
