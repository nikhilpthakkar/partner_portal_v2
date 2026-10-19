'use client';

import InfoTooltip from '@/components/molecules/InfoTooltip';
import { cn } from '@/lib/utils';
import type { StatusTimelineItem } from '@/lib/types/claims-management';

type StatusTimelineProps = {
  title: string;
  items: StatusTimelineItem[];
  className?: string;
};

export default function StatusTimeline({ title, items, className }: StatusTimelineProps) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 overflow-hidden rounded-status-timeline border border-status-timeline-border bg-status-timeline-bg p-5 shadow-status-timeline',
        className,
      )}
    >
      <h3 className="text-xl font-semibold leading-7 text-status-timeline-title">{title}</h3>

      <div className="flex w-full flex-col gap-2 max-h-[55vh] overflow-y-auto">
        <div className="relative pl-4">
          {/* Vertical timeline line */}
          {items.length > 1 && (
            <div
              className="absolute top-2 w-px bg-status-timeline-line"
              style={{ left: '3px', height: `calc(100% - 16px)` }}
            />
          )}

          <div className="flex flex-col gap-2">
            {items.map((item, index) => {
              const isActive = item.isActive ?? index === 0;

              return (
                <div key={item.id} className="relative flex flex-col gap-2 py-2">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute -left-4 top-2.5 size-2 rounded-full',
                      isActive ? 'bg-green-500' : 'bg-green-200',
                    )}
                  />

                  {/* Content */}
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-normal leading-5 text-status-timeline-item-title">
                      {item.description}
                    </p>
                    {item.stageDescription ? (
                      <InfoTooltip
                        infoText={item.stageDescription}
                        iconClassName="size-4 text-status-timeline-item-description"
                        arrowClassName="fill-claims-trend-tooltip"
                        className="max-w-xs bg-claims-trend-tooltip text-claims-trend-tooltip-text rounded-claims-trend-tooltip"
                      />
                    ) : null}
                  </div>
                  <p className="text-sm font-bold leading-5 text-status-timeline-item-title">
                    {item.title}
                  </p>
                  {item.enrichedDetails && item.enrichedDetails.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {item.enrichedDetails.map((detail) => (
                        <p
                          key={`${item.id}-${detail.label}`}
                          className="text-sm leading-5 text-status-timeline-item-description"
                        >
                          <span className="font-medium text-status-timeline-item-title">
                            {detail.label}:
                          </span>{' '}
                          {detail.value}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-sm font-normal leading-5 text-status-timeline-item-description">
                    {item.performer && `By: ${item.performer}`} {item.timestampLabel}:{' '}
                    {item.timestamp}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
