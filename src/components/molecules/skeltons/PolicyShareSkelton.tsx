import Skeleton from '@/components/ui/skeleton';

type PolicyShareSkeltonProps = {
  rowCount?: number;
  columnCount?: number;
};

export default function PolicyShareSkelton({
  rowCount = 3,
  columnCount = 3,
}: PolicyShareSkeltonProps) {
  const rows = Array.from({ length: rowCount }, (_, i) => i);
  const columns = Array.from({ length: columnCount }, (_, j) => j);
  return (
    <>
      <div className="flex flex-col gap-3">
        {rows.map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
      <div className="rounded-share-policy-panel border-share-policy-panel-border border p-4">
        <div className="flex flex-col gap-4">
          {columns.map((j) => (
            <div key={j} className="flex gap-3">
              <Skeleton className="size-4 shrink-0 rounded-sm" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
