'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  PolicyRefundTimelineAlert,
  PolicyRefundTimelineAttemptGroup,
  PolicyRefundTimelineStep,
} from '@/lib/types/policy-management/policyRefundDetailsSheet';

type PolicyRefundStatusTimelineProps = {
  title: string;
  steps?: PolicyRefundTimelineStep[];
  groups?: PolicyRefundTimelineAttemptGroup[];
  renderGroupDetails?: (group: PolicyRefundTimelineAttemptGroup) => ReactNode;
};

const getTimelineDotClassName = (status: PolicyRefundTimelineStep['status']) => {
  if (status === 'completed') {
    return 'bg-green-500';
  }

  if (status === 'failed') {
    return 'bg-red-500';
  }

  return 'bg-amber-400';
};

function TimelineAlertBanner({ alert }: { alert: PolicyRefundTimelineAlert }) {
  const isSuccess = alert.type === 'success';

  return (
    <div
      className={cn(
        'w-full rounded-md border px-4 py-2',
        isSuccess
          ? 'border-green-300 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800',
      )}
    >
      <p className="text-xs leading-[1.2]">{alert.message}</p>
    </div>
  );
}

function TimelineSteps({ steps }: { steps: PolicyRefundTimelineStep[] }) {
  return (
    <div className="relative pl-4">
      {steps.length > 1 ? (
        <div
          className="absolute top-2 w-px bg-border"
          style={{ left: '3px', height: 'calc(100% - 16px)' }}
        />
      ) : null}
      <div className="flex flex-col">
        {steps.map((step) => (
          <div key={step.id} className="relative flex flex-col gap-2 py-1.5">
            <div
              className={cn(
                'absolute -left-4 top-2 size-2 rounded-full',
                getTimelineDotClassName(step.status),
              )}
            />
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-medium leading-none text-foreground">{step.title}</p>
              {step.timestamp ? (
                <p className="shrink-0 text-right text-xs font-light leading-4 text-muted-foreground">
                  {step.timestamp}
                </p>
              ) : null}
            </div>
            {step.description ? (
              <p className="text-xs font-light leading-4 text-muted-foreground">{step.description}</p>
            ) : null}
            {step.status !== 'pending' && step.alert ? <TimelineAlertBanner alert={step.alert} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineAttemptGroup({
  group,
  details,
}: {
  group: PolicyRefundTimelineAttemptGroup;
  details?: ReactNode;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="p-2.5">
      <div className="flex items-center justify-between gap-4">
        {group.label ? (
          <p className="text-xs font-medium leading-none text-foreground">
            {group.index} · {group.label}
          </p>
        ) : (
          <span />
        )}
        {details ? (
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-segmented-tab-active-text hover:text-segmented-tab-active-text/80"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
          >
            View details
            <ChevronDown
              className={cn('size-4 transition-transform', detailsOpen && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>
      <div className="pt-1">
        <TimelineSteps steps={group.steps} />
      </div>
      {detailsOpen && details ? <div className="mt-3">{details}</div> : null}
    </div>
  );
}

export function PolicyRefundStatusTimeline({
  title,
  steps = [],
  groups = [],
  renderGroupDetails,
}: PolicyRefundStatusTimelineProps) {
  const timelineGroups =
    groups.length > 0
      ? groups
      : steps.length > 0
        ? [{ id: 'current-refund', index: 1, label: '', steps }]
        : [];

  if (!timelineGroups.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold leading-5 text-foreground">{title}</p>
        <div className="flex flex-col gap-1">
          {timelineGroups.map((group) => (
            <TimelineAttemptGroup
              key={group.id}
              group={group}
              details={renderGroupDetails?.(group)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
