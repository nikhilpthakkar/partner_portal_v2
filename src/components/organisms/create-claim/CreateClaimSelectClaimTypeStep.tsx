import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CREATE_CLAIM_CLAIM_TYPE_FOOTER,
  CREATE_CLAIM_FOOTER,
  CREATE_CLAIM_SELECTED_POLICY_SECTION,
  CREATE_CLAIM_TYPE_OPTIONS,
  CREATE_CLAIM_TYPE_SECTION,
} from '@/lib/constants/createClaim.constants';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import { cn, formatEnum } from '@/lib/utils';
import { HeartPulse, ShieldAlert, Wallet } from 'lucide-react';
import { formatIssuedOnLong, resolveSumAssured, resolveUhid } from '@/lib/utils/createClaim';
import { CreateClaimSelectionSummary } from '@/components/molecules/create-claim/CreateClaimSelectionSummary';

const CLAIM_TYPE_ICONS = [HeartPulse, ShieldAlert, Wallet] as const;

export type CreateClaimSelectClaimTypeStepProps = {
  selectedPolicy: RecentSearchPolicy;
  insuredSummaryName: string;
  policySummaryStatus: string;
  selectedClaimTypeId: string | null;
  onSelectClaimTypeId: (id: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function CreateClaimSelectClaimTypeStep({
  selectedPolicy,
  insuredSummaryName,
  policySummaryStatus,
  selectedClaimTypeId,
  onSelectClaimTypeId,
  onBack,
  onContinue,
}: CreateClaimSelectClaimTypeStepProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="flex flex-col gap-4" aria-labelledby="selected-policy-heading">
        <h2
          id="selected-policy-heading"
          className="text-lg font-semibold leading-none text-pagination-text"
        >
          {CREATE_CLAIM_SELECTED_POLICY_SECTION.title}
        </h2>
        <div className="bg-claims-management-table-header-bg border-pagination-border rounded-lg border p-4">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex">
              <div className="flex flex-col gap-2 py-1.5 text-sm leading-5 w-width-280">
                <span className="text-pagination-text-muted">
                  {CREATE_CLAIM_SELECTED_POLICY_SECTION.labels.policyNumber}
                </span>
                <span className="font-semibold text-pagination-text">
                  {selectedPolicy.policyNumber}
                </span>
              </div>
              <div className="flex flex-col gap-2 py-1.5 text-sm leading-5 w-width-280">
                <span className="text-pagination-text-muted">
                  {CREATE_CLAIM_SELECTED_POLICY_SECTION.labels.customerName}
                </span>
                <span className="font-semibold capitalize text-pagination-text">
                  {insuredSummaryName}
                </span>
              </div>
            </div>
            <Badge
              className={cn(
                'shrink-0 border-transparent px-2 py-1 text-xs font-semibold',
                policySummaryStatus === 'active'
                  ? 'bg-green-100 text-pagination-text'
                  : 'bg-muted text-pagination-text',
              )}
              variant="outline"
            >
              {selectedPolicy.status}
            </Badge>
          </div>
          <div className="flex flex-wrap">
            <div className="flex flex-col gap-2 py-1.5 text-sm leading-5 w-width-280">
              <span className="text-pagination-text-muted">
                {CREATE_CLAIM_SELECTED_POLICY_SECTION.labels.productName}
              </span>
              <span className="font-semibold text-pagination-text">
                {formatEnum(selectedPolicy.planDetails?.planId ?? '—')}
              </span>
            </div>
            <div className="flex flex-col gap-2 py-1.5 text-sm leading-5 w-width-280">
              <span className="text-pagination-text-muted">
                {CREATE_CLAIM_SELECTED_POLICY_SECTION.labels.issuedOn}
              </span>
              <span className="font-semibold text-pagination-text">
                {formatIssuedOnLong(selectedPolicy.issuedOn)}
              </span>
            </div>
            <div className="flex flex-col gap-2 py-1.5 text-sm leading-5 w-width-280">
              <span className="text-pagination-text-muted">
                {CREATE_CLAIM_SELECTED_POLICY_SECTION.labels.sumAssured}
              </span>
              <span className="font-semibold text-pagination-text">
                {resolveSumAssured(selectedPolicy)}
              </span>
            </div>
            <div className="flex flex-col gap-2 py-1.5 text-sm leading-5 w-width-280">
              <span className="text-pagination-text-muted">
                {CREATE_CLAIM_SELECTED_POLICY_SECTION.labels.uhid}
              </span>
              <span className="font-semibold text-pagination-text">
                {resolveUhid(selectedPolicy)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="claim-type-heading">
        <div className="flex flex-col gap-1.5">
          <h2
            id="claim-type-heading"
            className="text-lg font-semibold leading-none text-pagination-text"
          >
            {CREATE_CLAIM_TYPE_SECTION.title}
          </h2>
          <p className="text-sm leading-5 text-pagination-text-muted">
            {CREATE_CLAIM_TYPE_SECTION.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          {CREATE_CLAIM_TYPE_OPTIONS.map((option, idx) => {
            const Icon = CLAIM_TYPE_ICONS[idx];
            const chosen = selectedClaimTypeId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectClaimTypeId(option.id)}
                aria-pressed={chosen}
                className={cn(
                  'cursor-pointer max-w-width-380 items-center justify-center shadow-xs flex flex-1 flex-col rounded-xl border p-6 text-left outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-create-claim-button-border',
                  chosen
                    ? 'border-create-claim-button bg-violet-50'
                    : 'border-pagination-border bg-card hover:border-pagination-text-muted',
                )}
              >
                <Icon
                  className={cn(
                    'mb-4 size-10 shrink-0',
                    chosen ? 'text-violet-700' : 'text-pagination-text-muted opacity-50',
                  )}
                  aria-hidden
                  strokeWidth={1.5}
                />
                <span
                  className={cn(
                    'mb-1.5 block text-base font-semibold tracking-tight',
                    chosen ? 'text-select-claim-type-text' : 'text-pagination-text',
                  )}
                >
                  {option.title}
                </span>
                <span
                  className={cn(
                    'block truncate text-center text-sm leading-5 md:text-left',
                    chosen ? 'text-create-claim-button' : 'text-pagination-text-muted',
                  )}
                  title={option.description}
                >
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CreateClaimSelectionSummary
          insuredName={insuredSummaryName}
          policyNumber={selectedPolicy.policyNumber}
          className="[&_span]:leading-none max-w-xl"
        />

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-9 px-4 text-sm font-medium shadow-xs"
            onClick={onBack}
          >
            {CREATE_CLAIM_FOOTER.backCta}
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!selectedClaimTypeId}
            onClick={onContinue}
            className="disabled:text-primary-foreground h-9 bg-create-claim-button px-4 text-sm font-medium text-create-claim-button-text shadow-xs hover:bg-create-claim-button-hover disabled:opacity-50"
          >
            {CREATE_CLAIM_CLAIM_TYPE_FOOTER.continueCta}
          </Button>
        </div>
      </div>
    </div>
  );
}
