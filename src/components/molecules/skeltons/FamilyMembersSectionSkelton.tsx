import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Skeleton from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type FamilyMembersSectionSkeltonProps = {
  cardCount?: number;
  className?: string;
};

function FamilyMemberCardSkelton({ index }: { index: number }) {
  return (
    <Card
      key={`family-member-skeleton-${index}`}
      className="gap-0 rounded-lg border border-border p-0 shadow-none ring-0"
    >
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="size-10 rounded-3xl" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-6 py-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border px-6 py-2">
        <div className="flex w-full items-center justify-center gap-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardFooter>
    </Card>
  );
}

export default function FamilyMembersSectionSkelton({
  cardCount = 4,
  className,
}: FamilyMembersSectionSkeltonProps) {
  const cards = Array.from({ length: cardCount }, (_, index) => index);

  return (
    <Card className={cn('px-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((index) => (
          <FamilyMemberCardSkelton key={`family-member-skeleton-${index}`} index={index} />
        ))}
      </div>
    </Card>
  );
}
