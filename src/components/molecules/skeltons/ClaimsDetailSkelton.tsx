import Skeleton from '@/components/ui/skeleton';
import { PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';

export default function ClaimsDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className={PAGE_LAYOUT_CLASS}>
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-20" /> {/* Logo */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-40 rounded-xl" /> {/* Partner filter */}
            <Skeleton className="h-10 w-40 rounded-xl" /> {/* Type filter */}
          </div>
        </div>

        {/* Breadcrumb */}
        <Skeleton className="h-4 w-52 mb-6" />

        {/* Claim Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-52" /> {/* Claim ID */}
            <Skeleton className="h-6 w-24 rounded-full" /> {/* Status badge */}
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" /> {/* Share button */}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Card - Claim Overview */}
          <div className="lg:col-span-2 rounded-xl border border-claims-table-border p-6">
            <Skeleton className="h-6 w-40 mb-6" /> {/* Section title */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-28" /> {/* Label */}
                  <Skeleton className="h-5 w-40" /> {/* Value */}
                </div>
              ))}
            </div>
          </div>

          {/* Right Card - Status Timeline */}
          <div className="rounded-xl border border-claims-table-border p-6">
            <Skeleton className="h-6 w-40 mb-6" /> {/* Section title */}
            <div className="flex flex-col gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-3 w-3 rounded-full mt-2" />
                  <div className="flex flex-col gap-2 w-full">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
