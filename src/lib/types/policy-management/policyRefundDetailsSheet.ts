export type PolicyRefundTimelineStepStatus = 'completed' | 'pending' | 'failed';

export type PolicyRefundTimelineAlert = {
  type: 'success' | 'error';
  message: string;
};

export type PolicyRefundTimelineStep = {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status: PolicyRefundTimelineStepStatus;
  alert?: PolicyRefundTimelineAlert;
};

export type PolicyRefundTimelineAttemptGroup = {
  id: string;
  index: number;
  label: string;
  steps: PolicyRefundTimelineStep[];
  refundRequestId?: string;
  manualRefundId?: string;
  refundDestination?: string;
};

export type PolicyRefundDetailsSheetSummaryVariant =
  | 'inProgress'
  | 'success'
  | 'failed'
  | 'manualSettled'
  | 'info';

export type PolicyRefundDetailsSheetViewModel = {
  summaryDescription: string;
  summaryVariant: PolicyRefundDetailsSheetSummaryVariant;
  requestId: string;
  timelineGroups: PolicyRefundTimelineAttemptGroup[];
  timelineSteps: PolicyRefundTimelineStep[];
};
