import type {
  ActionEventNames,
  PageNames,
  PageWorkflowNames,
  SegmentActionName,
} from '@/lib/constants/segments.constants';

export type SegmentPartnerBase = {
  product: string;
  partner: string;
  plan_id: string;
};

export type SegmentUserType = 'internal' | 'external';

export type SegmentUserContext = {
  user_name: string;
  user_email: string;
  user_type: SegmentUserType;
};

export type SegmentViewPayload = SegmentPartnerBase & {
  page: PageNames;
  page_workflow: PageWorkflowNames;
  claim_number?: string;
  policy_number?: string;
  value?: string;
  entity_name?: string;
};

export type SegmentActionPayload = SegmentPartnerBase & {
  page: PageNames;
  page_workflow: PageWorkflowNames;
  action_type: ActionEventNames;
  action_name: SegmentActionName | string;
  entity_name?: string;
  claim_number?: string;
  policy_number?: string;
  value?: string;
};

export type SegmentExceptionPayload = SegmentPartnerBase & {
  page: PageNames;
  page_workflow: PageWorkflowNames;
  exception_type?: string;
  exception_message: string;
  claim_number?: string;
  value?: string;
  entity_name?: string;
};
