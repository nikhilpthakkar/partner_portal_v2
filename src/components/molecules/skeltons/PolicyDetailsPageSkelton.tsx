import Skeleton from '@/components/ui/skeleton';
import { PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';

export default function PolicyDetailsPageSkelton() {
  return (
    <div className={PAGE_LAYOUT_CLASS}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-5xl" />
        <div className="flex w-policy-details-select-width flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 w-full lg:col-span-2" />
          <Skeleton className="h-40 w-full lg:col-span-1" />
        </div>
      </div>
    </div>
  );
}
