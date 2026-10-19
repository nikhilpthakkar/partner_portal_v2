import Skeleton from '@/components/ui/skeleton';

export default function PaginationSkelton() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}
