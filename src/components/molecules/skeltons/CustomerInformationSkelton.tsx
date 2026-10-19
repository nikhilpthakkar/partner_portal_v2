import { Card } from '@/components/ui/card';
import Skeleton from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type CustomerInformationSkeltonProps = {
  rowsPerColumn?: number;
  className?: string;
};

export default function CustomerInformationSkelton({
  rowsPerColumn = 3,
  className,
}: CustomerInformationSkeltonProps) {
  const rows = Array.from({ length: rowsPerColumn }, (_, index) => index);

  return (
    <Card
      className={cn(
        'border-policy-info-border bg-policy-info-bg rounded-policy-info-card shadow-policy-info-card flex w-full flex-col gap-4 p-6 font-sans',
        className,
      )}
    >
      <Skeleton className="h-6 w-40" />
      <div className="grid w-full grid-cols-2 gap-2">
        {rows.map((index) => (
          <div key={`customer-info-skeleton-row-${index}`} className="flex flex-col gap-2 py-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
        {rows.map((index) => (
          <div
            key={`customer-info-skeleton-row-second-${index}`}
            className="flex flex-col gap-2 py-1"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}
