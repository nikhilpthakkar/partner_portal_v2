import { Card } from '@/components/ui/card';
import Skeleton from '@/components/ui/skeleton';

type PromoCardSkeltonProps = {
  index: number;
};

export default function PromoCardSkelton({ index }: PromoCardSkeltonProps) {
  return (
    <Card
      key={`promo-skeleton-${index}`}
      className="border-promo-card-border rounded-promo-card bg-promo-card-bg relative overflow-hidden p-6 w-full max-w-none"
    >
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-5 w-24 top-promo-card-badge-top absolute right-6 rounded-md" />
    </Card>
  );
}
