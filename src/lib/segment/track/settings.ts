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

const SETTINGS_PAGE = PageNames.SETTINGS_PAGE;
const SETTINGS_WORKFLOW = PageWorkflowNames.SETTINGS;

export function trackSettingsPageView(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.VIEW, {
    ...base,
    page: SETTINGS_PAGE,
    page_workflow: SETTINGS_WORKFLOW,
  });
}

export function trackSettingsSearch(base: SegmentPartnerBase, query: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SETTINGS_PAGE,
    page_workflow: SETTINGS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SEARCH_METRICS,
    entity_name: 'metrics_search',
    value: query.trim() || 'empty_query',
  });
}

export function trackSettingsToggleKpi(
  base: SegmentPartnerBase,
  params: { entity_name: string; enabled: boolean },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SETTINGS_PAGE,
    page_workflow: SETTINGS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.TOGGLE_KPI,
    entity_name: params.entity_name,
    value: params.enabled ? 'enabled' : 'disabled',
  });
}

export function trackSettingsToggleChart(
  base: SegmentPartnerBase,
  params: { entity_name: string; enabled: boolean },
) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SETTINGS_PAGE,
    page_workflow: SETTINGS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.TOGGLE_CHART,
    entity_name: params.entity_name,
    value: params.enabled ? 'enabled' : 'disabled',
  });
}

export function trackSettingsSave(base: SegmentPartnerBase) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SETTINGS_PAGE,
    page_workflow: SETTINGS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SAVE_METRICS_CONFIGURATION,
    entity_name: 'configure_metrics',
  });
}

export function trackSettingsSwitchNav(base: SegmentPartnerBase, navItemId: string) {
  sendSegmentEvent(SegmentEventNameTypes.ACTION, {
    ...base,
    page: SETTINGS_PAGE,
    page_workflow: SETTINGS_WORKFLOW,
    action_type: ActionEventNames.TAP_BTN_CLICK_PP,
    action_name: SegmentActionName.SWITCH_SETTINGS_NAV,
    entity_name: navItemId,
  });
}

export function trackSettingsLoadException(
  base: SegmentPartnerBase,
  params: { exception_message?: string } = {},
) {
  trackException(base, {
    page: SETTINGS_PAGE,
    page_workflow: SETTINGS_WORKFLOW,
    exception_type: 'overview_config',
    exception_message: params.exception_message,
  });
}

export function trackSettingsSaveException(
  base: SegmentPartnerBase,
  params: { exception_message?: string } = {},
) {
  trackException(base, {
    page: SETTINGS_PAGE,
    page_workflow: SETTINGS_WORKFLOW,
    exception_type: 'save_overview_config',
    exception_message: params.exception_message,
  });
}

export function trackSettingsValidationException(
  base: SegmentPartnerBase,
  params: { exception_message?: string } = {},
) {
  trackException(base, {
    page: SETTINGS_PAGE,
    page_workflow: SETTINGS_WORKFLOW,
    exception_type: 'tenure_distribution_validation',
    exception_message:
      params.exception_message ?? 'Tenure distribution settings are invalid',
  });
}
