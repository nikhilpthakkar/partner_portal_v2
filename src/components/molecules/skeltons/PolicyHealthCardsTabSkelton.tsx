import Skeleton from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type PolicyHealthCardsTabSkeltonProps = {
  rows?: number;
  className?: string;
};

export default function PolicyHealthCardsTabSkelton({
  rows = 2,
  className,
}: PolicyHealthCardsTabSkeltonProps) {
  const placeholders = Array.from({ length: rows }, (_, index) => index);

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {placeholders.map((index) => (
        <div key={`policy-health-card-skeleton-${index}`} className="flex w-full items-start gap-4">
          <div className="bg-policy-health-card-bg border border-policy-health-card-border rounded-policy-health-card shadow-policy-health-card flex w-full flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-8 w-44" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
