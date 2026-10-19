import type { ClaimTimelineData } from '@/lib/types/claims-management/claimDetails';
import type { StatusTimelineEnrichedDetail } from '@/lib/types/claims-management';
import type {
  ClaimTrackingData,
  ClaimTrackingPrimaryStage,
  ClaimTrackingTerminalEnrichedData,
} from '@/lib/types/claims-management/statusTimelineApi';

const STATUS_TIMELINE_TITLE = 'Claim Status timeline';
const DEFAULT_TIMESTAMP = '-';

const TERMINAL_OUTCOME_STAGE_KEYS = new Set(['REJECTED', 'CLOSED', 'WITHDRAWN']);

const parseTimestamp = (timestamp?: string): number => {
  if (!timestamp) return 0;
  const parsedValue = new Date(timestamp).getTime();
  return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

const formatTimelineTimestamp = (timestamp?: string): string => {
  if (!timestamp) return DEFAULT_TIMESTAMP;

  const dateValue = new Date(timestamp);
  if (Number.isNaN(dateValue.getTime())) return DEFAULT_TIMESTAMP;

  return dateValue.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const isStageActive = (stage: ClaimTrackingPrimaryStage, currentInternalState: string): boolean => {
  if (stage.status === 'ACTIVE') return true;

  return stage.transient_states.some(
    (transientState) =>
      transientState.state === currentInternalState && transientState.status === 'ACTIVE',
  );
};

const isTerminalOutcomeStage = (stage: ClaimTrackingPrimaryStage): boolean =>
  stage.is_terminal || TERMINAL_OUTCOME_STAGE_KEYS.has(stage.stage_key);

const mapTerminalEnrichedData = (
  enrichedData?: ClaimTrackingTerminalEnrichedData,
): StatusTimelineEnrichedDetail[] => {
  if (!enrichedData) return [];

  const details: StatusTimelineEnrichedDetail[] = [];

  if (enrichedData.primary_reason) {
    details.push({ label: 'Primary reason', value: enrichedData.primary_reason });
  }

  if (enrichedData.secondary_reason) {
    details.push({ label: 'Secondary reason', value: enrichedData.secondary_reason });
  }

  if (enrichedData.reason) {
    details.push({ label: 'Reason', value: enrichedData.reason });
  }

  if (enrichedData.withdrawn_by?.name) {
    details.push({ label: 'Withdrawn by', value: enrichedData.withdrawn_by.name });
  }

  return details;
};

const getLatestActivityIndexByStage = (
  stages: ClaimTrackingPrimaryStage[],
): Map<string, number> => {
  const latestActivityIndexByStageKey = new Map<string, number>();

  stages.forEach((stage) => {
    if (!stage.activity_timeline.length) return;

    let latestIndex = 0;
    let latestTimestamp = parseTimestamp(stage.activity_timeline[0].timestamp);

    stage.activity_timeline.forEach((activity, index) => {
      const timestamp = parseTimestamp(activity.timestamp);
      if (timestamp >= latestTimestamp) {
        latestTimestamp = timestamp;
        latestIndex = index;
      }
    });

    latestActivityIndexByStageKey.set(stage.stage_key, latestIndex);
  });

  return latestActivityIndexByStageKey;
};

export const mapClaimTrackingToTimelineData = (
  trackingData?: ClaimTrackingData,
): ClaimTimelineData => {
  if (!trackingData) {
    return {
      title: STATUS_TIMELINE_TITLE,
      items: [],
    };
  }

  const latestActivityIndexByStageKey = getLatestActivityIndexByStage(trackingData.primary_stages);

  const flattenedActivities = trackingData.primary_stages.flatMap((stage) =>
    stage.activity_timeline.map((activity, activityIndex) => {
      const shouldShowEnrichedData =
        isTerminalOutcomeStage(stage) &&
        activityIndex === latestActivityIndexByStageKey.get(stage.stage_key) &&
        Boolean(stage.terminal_detail?.enriched_data);

      return {
        id: `${stage.stage_key}-activity-${activityIndex}`,
        title: activity.label,
        description: stage.display_name,
        stageDescription: stage.description,
        enrichedDetails: shouldShowEnrichedData
          ? mapTerminalEnrichedData(stage.terminal_detail?.enriched_data)
          : undefined,
        performer: '',
        timestampLabel: stage.timestamp_label || 'Timestamp',
        timestamp: activity.timestamp,
        isFromActiveStage: isStageActive(stage, trackingData.current_internal_state),
      };
    }),
  );

  const sortedActivities = [...flattenedActivities].sort((leftActivity, rightActivity) => {
    const leftTimestamp = parseTimestamp(leftActivity.timestamp);
    const rightTimestamp = parseTimestamp(rightActivity.timestamp);
    return rightTimestamp - leftTimestamp;
  });
  const activeActivityId =
    sortedActivities.find((activity) => activity.isFromActiveStage)?.id || sortedActivities[0]?.id;

  const items = sortedActivities.map((activity) => {
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      stageDescription: activity.stageDescription,
      enrichedDetails: activity.enrichedDetails,
      performer: activity.performer,
      timestampLabel: activity.timestampLabel,
      timestamp: formatTimelineTimestamp(activity.timestamp),
      isActive: activity.id === activeActivityId,
    };
  });

  return {
    title: STATUS_TIMELINE_TITLE,
    items,
  };
};
