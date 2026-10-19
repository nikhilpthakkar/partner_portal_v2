import {
  ActionEventNames,
  PageNames,
  PageWorkflowNames,
  SegmentActionName,
  SegmentEventNameTypes,
} from '@/lib/constants/segments.constants';
import { sendSegmentEvent } from '@/lib/segment';
import { trackException, type TrackExceptionParams } from '@/lib/segment/trackException';
import type { SegmentPartnerBase } from '@/lib/types/segment.payloads';

type CreateClaimActionParams = {
  action_name: SegmentActionName;
  entity_name?: string;
  policy_number?: string;
  claim_number?: string;
  value?: string;
};

export function trackCreateClaimPageView(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.CREATE_CLAIM_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
  });
}

export function trackCreateClaimAction(base: SegmentPartnerBase, params: CreateClaimActionParams) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CREATE_CLAIM_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    ...params,
  });
}

export function trackClaimsManagementPageView(
  base: SegmentPartnerBase,
  params: { page: PageNames; page_workflow: PageWorkflowNames },
) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: params.page,
    page_workflow: params.page_workflow,
  });
}

export function trackClaimsManagementSwitchTopTab(
  base: SegmentPartnerBase,
  params: { page: PageNames; entityName: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: params.page,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SWITCH_TOP_TAB,
    entity_name: params.entityName,
  });
}

export function trackClaimsManagementOpenCreateClaim(
  base: SegmentPartnerBase,
  params: { page: PageNames; page_workflow: PageWorkflowNames },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: params.page,
    page_workflow: params.page_workflow,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CREATE_CLAIM,
  });
}

export function trackClaimsOverviewSearch(
  base: SegmentPartnerBase,
  entityName: string,
  value: string,
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIMS_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SEARCH_CLAIM,
    entity_name: entityName,
    value: value,
  });
}

export function trackClaimsOverviewChangeSearchFilter(
  base: SegmentPartnerBase,
  entityName: string,
  value: string,
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIMS_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.CHANGE_SEARCH_FILTER,
    entity_name: entityName,
    value,
  });
}

export function trackClaimsOverviewOpenClaimDetails(base: SegmentPartnerBase, claimNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIMS_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.OPEN_CLAIM_DETAILS,
    claim_number: claimNumber,
  });
}

export function trackClaimsOverviewShareClaimAction(
  base: SegmentPartnerBase,
  params: { claim_number: string; page?: PageNames },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: params.page ?? PageNames.CLAIMS_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SHARE_CLAIM_STATUS,
    claim_number: params.claim_number,
  });
}

export function trackClaimStatusShareSubmit(base: SegmentPartnerBase, claimNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIM_STATUS_SHARE_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    claim_number: claimNumber,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SHARE_CLAIM_STATUS,
  });
}

export function trackClaimStatusShareDialogView(base: SegmentPartnerBase, claimNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.CLAIM_STATUS_SHARE_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    claim_number: claimNumber,
  });
}

export function trackClaimsManagementTableQueryException(
  base: SegmentPartnerBase,
  params: {
    exception_type?: string;
    exception_message: string;
  },
) {
  trackException(base, {
    page: PageNames.CLAIMS_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    exception_type: params.exception_type,
    exception_message: params.exception_message,
  });
}

/** Claims trend card tooltip → open dashboard claims table dialog. */
export function trackDashboardViewClaimsTableAction(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.DASHBOARD_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.VIEW_CLAIMS_TABLE,
  });
}

export function trackClaimsTrendDialogView(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.CLAIMS_TREND_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
  });
}

export function trackClaimsTrendDialogExport(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIMS_TREND_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.EXPORT_CLAIMS_DATA,
  });
}

export function trackClaimDetailsPageView(base: SegmentPartnerBase, claimNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.CLAIMS_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    claim_number: claimNumber,
  });
}

export function trackClaimDetailsPageException(
  base: SegmentPartnerBase,
  params: {
    claimNumber: string;
    exception_type?: string;
    exceptionMessage?: string;
  },
) {
  const payload: TrackExceptionParams = {
    page: PageNames.CLAIMS_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    claim_number: params.claimNumber,
    exception_type: params.exception_type,
  };

  if (params.exceptionMessage) {
    payload.exception_message = params.exceptionMessage;
  } else if (!params.exception_type) {
    payload.exception_message = 'Unable to load claim details';
  }

  trackException(base, payload);
}

export function trackClaimDetailsUploadDialogView(base: SegmentPartnerBase, claimNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.CLAIM_DETAILS_UPLOAD_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    claim_number: claimNumber,
  });
}

export function trackClaimDetailsViewDocumentsDialogView(
  base: SegmentPartnerBase,
  claimNumber: string,
) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: PageNames.CLAIM_DETAILS_VIEW_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    claim_number: claimNumber,
  });
}

export function trackClaimDetailsShareClick(base: SegmentPartnerBase, claimNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIMS_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SHARE_CLAIM_STATUS,
    claim_number: claimNumber,
  });
}

export function trackClaimUploadAddAdditionalDocument(
  base: SegmentPartnerBase,
  params: { entity_name: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIM_DETAILS_UPLOAD_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.ADD_ADDITIONAL_DOCUMENT_FILE,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

export function trackClaimUploadBrowse(
  base: SegmentPartnerBase,
  params: {
    entity_name: string;
    claim_number: string;
  },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIM_DETAILS_UPLOAD_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.BROWSE_DOCUMENT_UPLOAD,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

export function trackClaimDocumentUploaded(
  base: SegmentPartnerBase,
  params: { entity_name: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIM_DETAILS_UPLOAD_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.UPLOAD_CLAIM_DOCUMENT,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

export function trackClaimUploadException(
  base: SegmentPartnerBase,
  params: { claim_number: string; exception_type: string; exception_message: string },
) {
  trackException(base, {
    page: PageNames.CLAIM_DETAILS_UPLOAD_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    claim_number: params.claim_number,
    exception_type: params.exception_type,
    exception_message: params.exception_message,
  });
}

export function trackClaimDocumentsSubmitSuccess(base: SegmentPartnerBase, claimNumber: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIM_DETAILS_UPLOAD_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SUBMIT_CLAIM_DOCUMENTS,
    claim_number: claimNumber,
  });
}

export function trackClaimViewUploadedRow(
  base: SegmentPartnerBase,
  params: { entity_name: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIM_DETAILS_UPLOAD_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.VIEW_UPLOADED_DOCUMENT_ROW,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

export function trackClaimDocumentDeleted(
  base: SegmentPartnerBase,
  params: { entity_name: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIM_DETAILS_UPLOAD_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.DELETE_CLAIM_DOCUMENT,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

export function trackClaimViewerSelectDocument(
  base: SegmentPartnerBase,
  params: { entity_name: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIM_DETAILS_VIEW_DOCUMENTS_DIALOG,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SELECT_DOCUMENT_IN_VIEWER,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

export function trackClaimDetailsOpenUploadDialog(
  base: SegmentPartnerBase,
  params: { entity_name: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIMS_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.OPEN_UPLOAD_DOCUMENTS_DIALOG,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

export function trackClaimDetailsSwitchTab(
  base: SegmentPartnerBase,
  params: {
    entity_name: string;
    claim_number: string;
  },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIMS_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SWITCH_CLAIM_DETAILS_TAB,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

/** Uploaded documents tab: fetch error */
export function trackUploadedDocumentsTabFetchException(
  base: SegmentPartnerBase,
  claimNumber: string,
) {
  trackException(base, {
    page: PageNames.CLAIMS_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    claim_number: claimNumber,
    exception_type: 'fetch_uploaded_claim_documents',
    exception_message: 'Unable to load uploaded documents',
  });
}

export function trackUploadedDocumentsViewList(
  base: SegmentPartnerBase,
  params: { entity_name: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIMS_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.VIEW_CLAIM_DOCUMENT_LIST,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

export function trackUploadedDocumentsDownload(
  base: SegmentPartnerBase,
  params: { entity_name: string; claim_number: string },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: PageNames.CLAIMS_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.DOWNLOAD_CLAIM_DOCUMENTS,
    entity_name: params.entity_name,
    claim_number: params.claim_number,
  });
}

export function trackUploadedDocumentsDownloadException(
  base: SegmentPartnerBase,
  claimNumber: string,
) {
  trackException(base, {
    page: PageNames.CLAIMS_DETAILS_PAGE,
    page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    claim_number: claimNumber,
    exception_type: 'download_claim_documents',
    exception_message: 'Failed to download document',
  });
}
