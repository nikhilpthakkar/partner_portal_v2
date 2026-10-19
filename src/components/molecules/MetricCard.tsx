import { Badge } from '@/components/ui/badge';
import { Card, CardHeader } from '@/components/ui/card';
import { MetricCardData } from '@/lib/types/overview';
import { cn } from '@/lib/utils';
import InfoTooltip from './InfoTooltip';

type MetricCardProps = {
  card: MetricCardData;
  className?: string;
};

export default function MetricCard({ card, className }: MetricCardProps) {
  const { label, value, badgeLabel, infoText } = card;

  return (
    <Card
      className={cn('rounded-metric-card border-metric-card-border bg-metric-card-bg', className)}
    >
      <CardHeader className="gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <p className="text-sm leading-5 text-pagination-text-muted">{label}</p>
            {infoText && (
              <InfoTooltip
                infoText={infoText}
                iconClassName="text-gwp-trend-icon h-3.5 w-3.5"
                arrowClassName="fill-gwp-trend-tooltip"
                className="bg-gwp-trend-tooltip text-gwp-trend-tooltip-text rounded-gwp-trend-tooltip max-w-64"
              />
            )}
          </div>
          {badgeLabel ? (
            <Badge className="bg-red-100 text-black font-medium border-transparent px-2 py-0.5 text-xs">
              {badgeLabel}
            </Badge>
          ) : null}
        </div>
        <p className="text-metric-card-value font-semibold leading-9 text-metric-card-text">
          {value}
        </p>
      </CardHeader>
    </Card>
  );
}
