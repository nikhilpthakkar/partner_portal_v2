import Breadcrumbs from '@/components/molecules/Breadcrumbs';
import { PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import { CreateClaimStepper } from '@/components/organisms/create-claim/CreateClaimStepper';
import { Loader2 } from 'lucide-react';

export type CreateClaimHydrationLoadingProps = {
  currentStepIndex: number;
};

export function CreateClaimHydrationLoading({
  currentStepIndex,
}: CreateClaimHydrationLoadingProps) {
  return (
    <div className={PAGE_LAYOUT_CLASS}>
      <Breadcrumbs />
      <CreateClaimStepper currentStepIndex={currentStepIndex} />
      <div
        className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-pagination-border bg-card py-12 text-sm text-pagination-text-muted"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-8 animate-spin text-pagination-text-muted" aria-hidden />
        <span>{'Loading policy…'}</span>
      </div>
    </div>
  );
}
