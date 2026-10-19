export type ClaimTrackingActivityTimeline = {
  label: string;
  timestamp: string;
};

export type ClaimTrackingPayeeDetails = {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  account_holder: string;
  account_number: string;
  ifsc_code: string;
  bank_details_type: string;
};

export type ClaimTrackingEnrichedData = {
  id: string;
  claim_request_number: string;
  sub_type: string;
  status: string;
  settlement_type: string;
  mode: string;
  amount: number;
  payee_details: ClaimTrackingPayeeDetails;
  task_id: string;
  updated_on: string;
  actionable_link?: string;
};

export type ClaimTrackingTransientState = {
  state: string;
  description: string;
  status: string;
  timestamp?: string;
  eta?: string;
  state_key: string;
  display_name: string;
  requires_action: boolean;
  enriched_data?: ClaimTrackingEnrichedData;
};

export type ClaimTrackingPrimaryStage = {
  description: string;
  status: string;
  timestamp?: string;
  eta?: string;
  stage_key: string;
  display_name: string;
  timestamp_label?: string;
  eta_label?: string;
  transient_states: ClaimTrackingTransientState[];
  activity_timeline: ClaimTrackingActivityTimeline[];
  has_activity_timeline: boolean;
  is_terminal: boolean;
  terminal_detail?: ClaimTrackingTerminalDetail;
};

export type ClaimTrackingInformant = {
  name: string;
  phone: string;
  email: string;
  whatsapp_opt_in: boolean;
  type: string;
  source: string;
  alternate_email?: string;
  user_id: string;
};

export type ClaimTrackingSupportContact = {
  email: string;
  phone: string;
};

export type ClaimTrackingTerminalDetail = {
  title: string;
  message: string;
  enriched_data?: ClaimTrackingTerminalEnrichedData;
  show_rejection_letter: boolean;
  support_contact: PersonDetails;
};

export type ClaimTrackingData = {
  claim_request_number: string;
  machine_instance_id: string;
  cover_id: string;
  current_internal_state: string;
  primary_stages: ClaimTrackingPrimaryStage[];
  informant?: ClaimTrackingInformant;
  support_contact?: ClaimTrackingSupportContact;
};

export type ClaimTrackingTerminalEnrichedData = {
  reason?: string;
  primary_reason?: string;
  secondary_reason?: string;
  withdrawn_by?: PersonDetails;
  is_customer?: boolean;
};

export type PersonDetails = {
  name: string;
  email: string;
};
