import Skeleton from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type PolicyClaimsHistoryTabSkeltonProps = {
  rows?: number;
  className?: string;
};

export default function PolicyClaimsHistoryTabSkelton({
  rows = 4,
  className,
}: PolicyClaimsHistoryTabSkeltonProps) {
  const placeholders = Array.from({ length: rows }, (_, index) => index);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {placeholders.map((index) => (
        <Skeleton key={`policy-claims-history-skeleton-${index}`} className="h-6 w-full" />
      ))}
    </div>
  );
}
