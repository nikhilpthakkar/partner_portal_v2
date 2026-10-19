import {
  CREATE_CLAIM_FLOW_STEPS,
  CREATE_CLAIM_TITLE,
  type CreateClaimFlowStepId,
} from '@/lib/constants/createClaim.constants';
import { PAGE_TITLE_CLASS } from '@/components/molecules/PageHeading';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export type CreateClaimStepperProps = {
  currentStepIndex: number;
  onStepClick?: (stepId: CreateClaimFlowStepId) => void;
};

export function CreateClaimStepper({ currentStepIndex, onStepClick }: CreateClaimStepperProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className={PAGE_TITLE_CLASS}>{CREATE_CLAIM_TITLE}</h1>
      <div
        role="navigation"
        aria-label="Claim creation steps"
        className="flex w-fit flex-wrap gap-3.5 rounded-md bg-slate-50"
      >
        {CREATE_CLAIM_FLOW_STEPS.map((step, idx) => {
          const complete = idx < currentStepIndex;
          const active = idx === currentStepIndex;
          const canNavigate = Boolean(onStepClick && complete);
          return (
            <button
              key={step.id}
              type="button"
              disabled={!canNavigate}
              onClick={() => {
                if (canNavigate) {
                  onStepClick?.(step.id);
                }
              }}
              className={cn(
                'flex rounded-md p-2 w-width-200 text-left transition-colors',
                active ? 'bg-violet-100' : '',
                canNavigate ? 'cursor-pointer hover:bg-violet-50' : 'cursor-default',
              )}
              aria-current={active ? 'step' : undefined}
            >
              <div className="flex items-center gap-2.5">
                {complete ? (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-icon-default-bg text-white">
                    <Check
                      className="size-3.5 text-labeled-select-accent"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </span>
                ) : (
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                      active
                        ? 'bg-labeled-select-accent text-white'
                        : 'bg-icon-default-bg text-pagination-text',
                    )}
                  >
                    {step.ordinal}
                  </span>
                )}
                <span className="truncate text-sm font-medium leading-none text-pagination-text">
                  {step.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
