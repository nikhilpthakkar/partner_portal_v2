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

export function trackPolicyManagementPageView(
  base: SegmentPartnerBase,
  params: { page: PageNames; page_workflow: PageWorkflowNames },
) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: params.page,
    page_workflow: params.page_workflow,
  });
}

export function trackPolicyManagementOpenBulkUpload(
  base: SegmentPartnerBase,
  params: {
    page: PageNames;
    page_workflow: PageWorkflowNames;
  },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: params.page,
    page_workflow: params.page_workflow,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.UPLOAD_FILE,
    entity_name: 'policy_bulk_upload',
  });
}

export function trackPolicyManagementSwitchTopTab(
  base: SegmentPartnerBase,
  params: { page: PageNames; entityName: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: params.page,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SWITCH_TOP_TAB,
    entity_name: params.entityName,
  });
}

export function trackPolicyOverviewSearch(
  base: SegmentPartnerBase,
  entityName: string,
  value: string,
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SEARCH_POLICY,
    entity_name: entityName,
    value: value,
  });
}

export function trackPolicyOverviewChangeSearchFilter(
  base: SegmentPartnerBase,
  entityName: string,
  value: string,
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CHANGE_SEARCH_FILTER,
    entity_name: entityName,
    value,
  });
}

export function trackPolicyOverviewDataException(
  base: SegmentPartnerBase,
  params: { exception_type?: string; entity_name: string; value: string },
) {
  if (!params.exception_type) return;
  trackException(base, {
    page: PageNames.POLICY_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    exception_type: params.exception_type,
    entity_name: params.entity_name,
    value: params.value,
  });
}

export function trackPolicyOverviewSharePolicy(base: SegmentPartnerBase, policyNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SHARE_POLICY,
    policy_number: policyNumber,
  });
}

export function trackPolicyOverviewEndorsePolicy(base: SegmentPartnerBase, policyNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.ENDORSE_POLICY,
    policy_number: policyNumber,
  });
}

export function trackPolicyOverviewOpenPolicyDetails(
  base: SegmentPartnerBase,
  policyNumber: string,
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.OPEN_POLICY_DETAILS,
    entity_name: policyNumber,
  });
}

export function trackPolicyShareDialogSubmit(base: SegmentPartnerBase, policyNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_DETAILS_SHARE_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    policy_number: policyNumber,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SUBMIT_SHARE_POLICY,
  });
}

export function trackPolicyShareDialogView(base: SegmentPartnerBase, policyNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.POLICY_DETAILS_SHARE_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    policy_number: policyNumber,
  });
}

export function trackPolicyManagementTableDownloadCertificate(
  base: SegmentPartnerBase,
  policyNumber: string,
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.DOWNLOAD_POLICY_CERTIFICATE,
    policy_number: policyNumber,
  });
}

export function trackPolicyDetailsPageView(base: SegmentPartnerBase, policyNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.POLICY_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    policy_number: policyNumber,
  });
}

export function trackPolicyDetailsHeaderAction(
  base: SegmentPartnerBase,
  params: { action_name: SegmentActionName | string; policy_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: params.action_name,
    policy_number: params.policy_number,
  });
}

export function trackShareHealthCardAction(base: SegmentPartnerBase, policyNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SHARE_HEALTH_CARD,
    policy_number: policyNumber,
  });
}

export function trackPolicyDetailsTabDownloadHealthCard(
  base: SegmentPartnerBase,
  params: { policy_number: string; entity_name?: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.DOWNLOAD_HEALTH_CARD,
    policy_number: params.policy_number,
    entity_name: params.entity_name,
  });
}

export function trackPolicyHealthCardsDownload(
  base: SegmentPartnerBase,
  params: { policy_number: string; entity_name?: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.DOWNLOAD_HEALTH_CARD,
    policy_number: params.policy_number,
    entity_name: params.entity_name,
  });
}

export function trackPolicyClaimsHistoryShare(
  base: SegmentPartnerBase,
  params: { policy_number: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SHARE_CLAIM,
    policy_number: params.policy_number,
    claim_number: params.claim_number,
  });
}

export function trackPolicyClaimsHistoryView(
  base: SegmentPartnerBase,
  params: { policy_number: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.VIEW_CLAIM,
    policy_number: params.policy_number,
    claim_number: params.claim_number,
  });
}

export function trackEndorsePolicyDialogView(base: SegmentPartnerBase, policyNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.POLICY_ENDORSEMENT_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    policy_number: policyNumber,
  });
}

export function trackEndorsePolicyOptionClick(
  base: SegmentPartnerBase,
  params: { policy_number: string; endorsement_type: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_ENDORSEMENT_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SELECT_POLICY_ENDORSEMENT_OPTION,
    policy_number: params.policy_number,
    entity_name: params.endorsement_type,
  });
}

export function trackEndorsePolicyFlowView(
  base: SegmentPartnerBase,
  params: { policy_number: string; endorsement_type: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.POLICY_ENDORSEMENT_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    policy_number: params.policy_number,
    entity_name: params.endorsement_type,
  });
}

export function trackPolicyDetailsSwitchTab(
  base: SegmentPartnerBase,
  params: { entity_name: string; policy_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SWITCH_POLICY_DETAILS_TAB,
    entity_name: params.entity_name,
    policy_number: params.policy_number,
  });
}

export function trackBulkUploadDialogView(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.POLICY_BULK_OPERATIONS_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
  });
}

export function trackBulkUploadActionTypeSelect(base: SegmentPartnerBase, actionType: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_BULK_OPERATIONS_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SELECT_BULK_UPLOAD_ACTION_TYPE,
    entity_name: actionType,
  });
}

export function trackBulkUploadDownloadTemplate(
  base: SegmentPartnerBase,
  params: { action_type: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_BULK_OPERATIONS_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.DOWNLOAD_BULK_UPLOAD_TEMPLATE,
    entity_name: params.action_type,
  });
}

export function trackBulkUploadStageFile(base: SegmentPartnerBase, params: { file_name: string }) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_BULK_OPERATIONS_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.STAGE_BULK_UPLOAD_FILE,
    entity_name: params.file_name,
  });
}

export function trackBulkUploadSubmit(
  base: SegmentPartnerBase,
  params: { action_type: string; file_name: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_BULK_OPERATIONS_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SUBMIT_BULK_UPLOAD,
    entity_name: params.action_type,
    value: params.file_name,
  });
}

export function trackBulkUploadCloseDialog(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_BULK_OPERATIONS_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CLOSE_BULK_UPLOAD_DIALOG,
  });
}

export function trackBulkActionListException(base: SegmentPartnerBase, exceptionMessage: string) {
  trackException(base, {
    page: PageNames.POLICY_BULK_OPERATIONS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    exception_type: 'bulk_action_list',
    exception_message: exceptionMessage,
  });
}

export function trackBulkDownloadSuccess(base: SegmentPartnerBase, entityName: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_BULK_OPERATIONS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.DOWNLOAD_BULK_SUCCESS_FILE,
    entity_name: entityName,
  });
}

export function trackBulkDownloadError(base: SegmentPartnerBase, entityName: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_BULK_OPERATIONS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.DOWNLOAD_BULK_ERROR_FILE,
    entity_name: entityName,
  });
}

export function trackBulkDownloadInput(base: SegmentPartnerBase, entityName: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.POLICY_BULK_OPERATIONS_PAGE,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.DOWNLOAD_BULK_INPUT_FILE,
    entity_name: entityName,
  });
}

export function trackBulkUploadSubmitError(
  base: SegmentPartnerBase,
  params: {
    exception_type: string;
    exception_message: string;
    action_type: string;
    file_name: string;
    entity_name: string;
    value: string;
  },
) {
  trackException(base, {
    page: PageNames.POLICY_BULK_OPERATIONS_DIALOG,
    page_workflow: PageWorkflowNames.POLICY_BULK_OPERATIONS,
    exception_type: params.exception_type,
    exception_message: params.exception_message,
    entity_name: params.action_type,
    value: params.file_name,
  });
}
