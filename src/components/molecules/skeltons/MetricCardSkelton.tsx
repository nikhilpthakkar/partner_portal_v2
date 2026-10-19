import { Card, CardHeader } from '@/components/ui/card';
import Skeleton from '@/components/ui/skeleton';

type MetricCardSkeltonProps = {
  index: number;
};

export default function MetricCardSkelton({ index }: MetricCardSkeltonProps) {
  return (
    <Card
      key={`metric-skeleton-${index}`}
      className="rounded-metric-card border-metric-card-border bg-metric-card-bg"
    >
      <CardHeader className="gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-7 w-28" />
      </CardHeader>
    </Card>
  );
}
