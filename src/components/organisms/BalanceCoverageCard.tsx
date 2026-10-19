import { Card } from '@/components/ui/card';
import TruncatedTooltipText from '@/components/molecules/TruncatedTooltipText';
import { cn } from '@/lib/utils';

const COVERAGE_BAR = {
  current: '#0d9488',
  excess: '#a7f3d0',
  rechargePrimary: '#ea580c',
  rechargeAdditional: '#fbbf24',
} as const;

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

export function computeBalanceCoverageSegmentWidths(
  month: number,
  excess: number,
  rechargePrimary: number,
  rechargeAdditional: number,
): {
  monthSeg: number;
  excessSeg: number;
  rechargePrimarySeg: number;
  rechargeAdditionalSeg: number;
} {
  const m = clampPct(month);
  const e = clampPct(excess);
  const rp = clampPct(rechargePrimary);
  const ra = clampPct(rechargeAdditional);
  const sum = m + e + rp + ra;
  if (sum <= 0) {
    return { monthSeg: 0, excessSeg: 0, rechargePrimarySeg: 0, rechargeAdditionalSeg: 0 };
  }
  if (sum === 100) {
    return {
      monthSeg: m,
      excessSeg: e,
      rechargePrimarySeg: rp,
      rechargeAdditionalSeg: ra,
    };
  }
  const k = 100 / sum;
  return {
    monthSeg: m * k,
    excessSeg: e * k,
    rechargePrimarySeg: rp * k,
    rechargeAdditionalSeg: ra * k,
  };
}

function coverageBarBackground(
  monthSeg: number,
  excessSeg: number,
  rechargePrimarySeg: number,
  rechargeAdditionalSeg: number,
): string {
  const parts: { w: number; color: string }[] = [];
  if (monthSeg > 0) parts.push({ w: monthSeg, color: COVERAGE_BAR.current });
  if (excessSeg > 0) parts.push({ w: excessSeg, color: COVERAGE_BAR.excess });
  if (rechargePrimarySeg > 0) {
    parts.push({ w: rechargePrimarySeg, color: COVERAGE_BAR.rechargePrimary });
  }
  if (rechargeAdditionalSeg > 0) {
    parts.push({ w: rechargeAdditionalSeg, color: COVERAGE_BAR.rechargeAdditional });
  }

  if (parts.length === 0) {
    return 'linear-gradient(to right, var(--color-muted) 0%, var(--color-muted) 100%)';
  }

  let pos = 0;
  const stops: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const isLast = i === parts.length - 1;
    const next = isLast ? 100 : pos + p.w;
    stops.push(`${p.color} ${pos}%`, `${p.color} ${next}%`);
    pos = next;
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

export type BalanceCoverageTimelineMarker = {
  label: string;
  positionPercent: number;
};

type BalanceCoverageCardProps = {
  title: string;
  amount: string;
  monthPercent: number;
  excessPercent: number;
  rechargePrimaryPercent: number;
  rechargeAdditionalPercent: number;
  timelineMarkers?: BalanceCoverageTimelineMarker[];
  fullCoverageLabel?: string;
  currentLabel?: string;
  excessLabel?: string;
  rechargePrimaryLabel?: string;
  rechargePrimaryLegend?: string;
  rechargeAdditionalLabel?: string;
  rechargeAdditionalLegend?: string;
  monthLegendLabel?: string;
  excessLegendLabel?: string;
  summaryText?: string;
  className?: string;
};

const labelOnDark = 'text-balance-coverage-label';
const labelOnLight = 'text-xs font-medium leading-tight text-foreground';

function timelineMarkerStyle(percent: number): {
  left: string;
  transform: string;
  align: 'start' | 'center' | 'end';
} {
  const p = clampPct(percent);
  if (p <= 0) return { left: '0%', transform: 'translateX(0)', align: 'start' };
  if (p >= 99.5) return { left: '100%', transform: 'translateX(-100%)', align: 'end' };
  if (p < 8) return { left: `${p}%`, transform: 'translateX(0)', align: 'start' };
  return { left: `${p}%`, transform: 'translateX(-50%)', align: 'center' };
}

const LAST_TIMELINE_LABEL_LIFT_PX = 12;
const LAST_TIMELINE_LABEL_OVERLAP_GAP_PCT = 8;

export default function BalanceCoverageCard({
  title,
  amount,
  monthPercent,
  excessPercent,
  rechargePrimaryPercent,
  rechargeAdditionalPercent,
  fullCoverageLabel,
  currentLabel,
  excessLabel,
  rechargePrimaryLabel,
  rechargeAdditionalLabel,
  summaryText,
  className,
  timelineMarkers,
}: BalanceCoverageCardProps) {
  const { monthSeg, excessSeg, rechargePrimarySeg, rechargeAdditionalSeg } = computeBalanceCoverageSegmentWidths(
    monthPercent,
    excessPercent,
    rechargePrimaryPercent,
    rechargeAdditionalPercent,
  );

  const residual = excessSeg + rechargePrimarySeg + rechargeAdditionalSeg;
  const isFullCurrentOnly = monthSeg > 0 && residual <= 0.01;

  const barTrackStyle = {
    background: coverageBarBackground(
      monthSeg,
      excessSeg,
      rechargePrimarySeg,
      rechargeAdditionalSeg,
    ),
  };

  const centeredFullLabel = (fullCoverageLabel ?? currentLabel ?? '').trim();
  const lastLabelNeedsLift =
    Boolean(timelineMarkers && timelineMarkers.length > 1) &&
    (() => {
      const markers = timelineMarkers as BalanceCoverageTimelineMarker[];
      const last = clampPct(markers[markers.length - 1].positionPercent);
      const prev = clampPct(markers[markers.length - 2].positionPercent);
      return last - prev < LAST_TIMELINE_LABEL_OVERLAP_GAP_PCT;
    })();

  return (
    <Card
      className={cn(
        'bg-balance-coverage-bg border-balance-coverage-border rounded-balance-coverage-card',
        'flex w-full flex-col gap-balance-coverage-gap overflow-hidden p-balance-coverage-gap',
        className,
      )}
    >
      <div className="flex w-full flex-col gap-1.5">
        <p className="w-full text-sm font-normal leading-5 text-balance-coverage-title">{title}</p>
        <p className="w-full text-xl font-semibold leading-none text-balance-coverage-amount">
          {amount}
        </p>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-4">
        <div className="flex w-full flex-col">
          {timelineMarkers && timelineMarkers.length > 0 ? (
            <div
              className="relative h-10 w-full min-w-0"
              aria-hidden
            >
              {timelineMarkers.map((m, index) => {
                const { left, transform, align } = timelineMarkerStyle(m.positionPercent);
                const isLastMarker = index === timelineMarkers.length - 1;
                return (
                  <div
                    key={`${m.label}-${index}`}
                    className={cn(
                      'absolute top-0 flex flex-col gap-0.5',
                      align === 'start' && 'items-start',
                      align === 'end' && 'items-end',
                      align === 'center' && 'items-center',
                    )}
                    style={{ left, transform }}
                  >
                    <span
                      style={
                        isLastMarker && lastLabelNeedsLift
                          ? { transform: `translateY(-${LAST_TIMELINE_LABEL_LIFT_PX}px)` }
                          : undefined
                      }
                      className={cn(
                        'max-w-[28vw] truncate text-[11px] leading-tight text-balance-coverage-title sm:max-w-[120px] sm:text-xs',
                        align === 'start' && 'origin-top-left self-start text-left',
                        align === 'end' && 'origin-top-right self-end text-right',
                        align === 'center' && 'text-center',
                      )}
                    >
                      {m.label}
                    </span>
                    <span className="block h-2 w-px shrink-0 bg-balance-coverage-border" />
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="flex w-full items-center gap-2">
            <div className="relative min-h-10 min-w-0 flex-1">
            <div
              className="pointer-events-none absolute top-1/2 left-0 w-full -translate-y-1/2 overflow-hidden rounded-[8px] h-balance-coverage-bar-height min-h-10"
              style={barTrackStyle}
              aria-hidden
            />
            <div className="relative z-[1] flex min-h-10 w-full">
              {isFullCurrentOnly && centeredFullLabel ? (
                <div className="flex min-h-10 w-full items-center justify-center px-2 py-1">
                  <p className={cn('text-center text-xs leading-tight', labelOnDark)}>
                    {centeredFullLabel}
                  </p>
                </div>
              ) : (
                <>
                  {monthSeg > 0 ? (
                    <div
                      className="flex min-h-10 min-w-0 shrink-0 items-center justify-start px-1.5 py-1 sm:px-2"
                      style={{ width: `${monthSeg}%` }}
                    >
                      {currentLabel ? (
                        <p className={cn('text-left text-xs leading-tight', labelOnDark)}>
                          {currentLabel}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {excessSeg > 0 ? (
                    <div
                      className="flex min-h-10 min-w-0 shrink-0 items-center justify-center px-1.5 py-1 sm:px-2"
                      style={{ width: `${excessSeg}%` }}
                    >
                      {excessLabel ? <p className={cn(labelOnLight, 'text-center')}>{excessLabel}</p> : null}
                    </div>
                  ) : null}
                  {rechargePrimarySeg > 0 ? (
                    <div
                      className="flex min-h-10 min-w-0 shrink-0 items-center justify-center px-1.5 py-1 sm:px-2"
                      style={{ width: `${rechargePrimarySeg}%` }}
                    >
                      {rechargePrimaryLabel ? (
                        <p className={cn('text-center text-xs leading-tight', labelOnDark)}>
                          {rechargePrimaryLabel}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {rechargeAdditionalSeg > 0 ? (
                    <div
                      className="flex min-h-10 min-w-0 shrink-0 items-center justify-end px-1.5 py-1 sm:px-2"
                      style={{ width: `${rechargeAdditionalSeg}%` }}
                    >
                      {rechargeAdditionalLabel ? (
                        <TruncatedTooltipText
                          text={rechargeAdditionalLabel}
                          className={cn('max-w-full text-right text-xs leading-tight', labelOnDark)}
                          tooltipClassName="text-xs"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
        </div>

        {summaryText ? (
          <p className="mt-2 w-full text-sm font-normal leading-5 text-muted-foreground break-words">
            {summaryText}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
