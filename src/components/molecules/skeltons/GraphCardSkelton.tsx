import Skeleton from '@/components/ui/skeleton';

type GraphCardSkeltonProps = {
  chartHeight: number;
};

export default function GraphCardSkelton({ chartHeight }: GraphCardSkeltonProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="flex items-center justify-center w-full h-full relative">
        <Skeleton className="w-full" style={{ height: chartHeight / 1.2 }} />
      </div>
    </div>
  );
}
