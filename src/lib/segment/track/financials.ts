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

const FINANCIALS_PAGE = PageNames.FINANCIALS_PAGE;
const FINANCIALS_WORKFLOW = PageWorkflowNames.FINANCIALS;

export function trackFinancialsPageView(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: FINANCIALS_PAGE,
    page_workflow: FINANCIALS_WORKFLOW,
  });
}

export function trackFinancialsDataException(
  base: SegmentPartnerBase,
  params: { exception_type?: string },
) {
  if (!params.exception_type) return;
  trackException(base, {
    page: FINANCIALS_PAGE,
    page_workflow: FINANCIALS_WORKFLOW,
    exception_type: params.exception_type,
  });
}

export function trackFinancialsDisputeDocumentUploadException(
  base: SegmentPartnerBase,
  exceptionMessage: string,
) {
  trackException(base, {
    page: FINANCIALS_PAGE,
    page_workflow: FINANCIALS_WORKFLOW,
    exception_type: 'upload_dispute_document',
    exception_message: exceptionMessage,
  });
}

export function trackFinancialsSwitchTopTab(base: SegmentPartnerBase, tab: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: FINANCIALS_PAGE,
    page_workflow: FINANCIALS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SWITCH_TOP_TAB,
    entity_name: tab,
  });
}

export function trackFinancialsAggregateFilterChange(
  base: SegmentPartnerBase,
  aggregateBy: string,
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: FINANCIALS_PAGE,
    page_workflow: FINANCIALS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CHANGE_SEARCH_FILTER,
    entity_name: 'aggregate_by',
    value: aggregateBy,
  });
}

export function trackFinancialsSearchUtr(base: SegmentPartnerBase, utr: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: FINANCIALS_PAGE,
    page_workflow: FINANCIALS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CHANGE_SEARCH_FILTER,
    entity_name: 'utr',
    value: utr,
  });
}

export function trackFinancialsExport(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: FINANCIALS_PAGE,
    page_workflow: FINANCIALS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: 'Export transaction summary',
    entity_name: 'transaction_summary',
  });
}

export function trackFinancialsRaiseDispute(base: SegmentPartnerBase, selectedCount: number) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: FINANCIALS_PAGE,
    page_workflow: FINANCIALS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: 'Raise dispute',
    entity_name: 'raise_dispute',
    value: String(selectedCount),
  });
}

export function trackFinancialsAddTransaction(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: FINANCIALS_PAGE,
    page_workflow: FINANCIALS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: 'Add transaction',
    entity_name: 'add_transaction',
  });
}
