import type { ComponentPropsWithoutRef } from 'react';
import type { CreateClaimPolicySummaryRow } from '@/lib/utils/createClaim';
import { cn } from '@/lib/utils';

export type CreateClaimPolicySidebarProps = {
  rows: CreateClaimPolicySummaryRow[];
  /** Used for stacking row padding (matches claim-details vs bank-verification comps). */
  rowDensity?: 'compact' | 'comfortable';
} & Omit<ComponentPropsWithoutRef<'aside'>, 'children'>;

export function CreateClaimPolicySidebar({
  rows,
  rowDensity = 'compact',
  className,
  ...asideProps
}: CreateClaimPolicySidebarProps) {
  const rowSpacing = rowDensity === 'comfortable' ? 'py-3' : 'py-2';

  return (
    <aside className={className} {...asideProps}>
      <dl className="flex flex-col gap-0 text-sm leading-5">
        {rows.map((row, i) => (
          <div
            key={`${row.label}-${i}`}
            className={cn(
              'flex flex-col gap-2',
              rowSpacing,
              i < rows.length - 1 && 'border-b border-pagination-border',
            )}
          >
            <dt className="font-normal text-pagination-text-muted">{row.label}</dt>
            <dd className="font-semibold break-words text-pagination-text">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
