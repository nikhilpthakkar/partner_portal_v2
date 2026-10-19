'use client';

import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';

import EndorsementActionCard, {
  type EndorsementActionCardProps,
} from '@/components/molecules/EndorsementActionCard';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Skeleton from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { EndorsePolicyBadgeTone } from '@/lib/types/policy-management/policyDetails';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackEndorsePolicyFlowView,
  trackEndorsePolicyOptionClick,
} from '@/lib/segment/track/policy';

const FinancialPolicyEndorsement = lazy(() =>
  import('./financial-policy-endorsement/FinancialPolicyEndorsement').then((module) => ({
    default: module.FinancialPolicyEndorsement,
  })),
);

const NonFinancialPolicyEndorsement = lazy(() =>
  import('./non-financial-policy-endorsement/NonFinancialPolicyEndorsement').then((module) => ({
    default: module.NonFinancialPolicyEndorsement,
  })),
);

type EndorsementAction = Omit<EndorsementActionCardProps, 'onClick'>;

type EndorsementSection = {
  id: string;
  title: string;
  badgeLabel?: string;
  badgeTone?: EndorsePolicyBadgeTone;
  actions: EndorsementAction[];
};

type EndorsePolicyCardProps = {
  title: string;
  description: string;
  policyNumber: string;
  policyId: string;
  plan: string;
  insuredName: string;
  sections: EndorsementSection[];
  notice?: string;
  isEndorsementTypeLoading?: boolean;
  isEndorsementTypeError?: boolean;
  isEndorsementTypeEmpty?: boolean;
  onEndorsementSuccess: () => Promise<void>;
  onClose: () => void;
};

const badgeToneStyles: Record<EndorsePolicyBadgeTone, string> = {
  warning:
    'border-endorse-policy-badge-warning-border bg-endorse-policy-badge-warning-bg text-endorse-policy-badge-warning-text',
  success:
    'border-endorse-policy-badge-success-border bg-endorse-policy-badge-success-bg text-endorse-policy-badge-success-text',
};

export default function EndorsePolicyCard({
  title,
  description,
  policyNumber,
  policyId,
  plan,
  insuredName,
  sections,
  notice,
  isEndorsementTypeLoading = false,
  isEndorsementTypeError = false,
  isEndorsementTypeEmpty = false,
  onEndorsementSuccess,
  onClose,
}: EndorsePolicyCardProps) {
  const [endorsementType, setEndorsementType] = useState<string | null>(null);
  const segmentBase = useSegmentPartnerBase();
  const segmentBaseRef = useRef(segmentBase);
  segmentBaseRef.current = segmentBase;

  useEffect(() => {
    if (!endorsementType) {
      return;
    }
    trackEndorsePolicyFlowView(segmentBaseRef.current, {
      policy_number: policyNumber,
      endorsement_type: endorsementType,
    });
  }, [endorsementType, policyNumber]);

  const renderEndorsementFlow = () => {
    switch (endorsementType) {
      case 'PreClosure':
        return (
          <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin" />}>
            <FinancialPolicyEndorsement
              policyNumber={policyNumber}
              policyId={policyId}
              plan={plan}
              insuredName={insuredName}
              endorsementType={endorsementType}
              onBackToEndorsementType={() => setEndorsementType(null)}
              onEndorsementSuccess={onEndorsementSuccess}
            />
          </Suspense>
        );
      case 'PolicyCancellation':
        return (
          <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin" />}>
            <FinancialPolicyEndorsement
              policyNumber={policyNumber}
              policyId={policyId}
              plan={plan}
              insuredName={insuredName}
              endorsementType={endorsementType}
              onBackToEndorsementType={() => setEndorsementType(null)}
              onEndorsementSuccess={onEndorsementSuccess}
            />
          </Suspense>
        );
      case 'InsuredUpdation':
        return (
          <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin" />}>
            <NonFinancialPolicyEndorsement
              policyNumber={policyNumber}
              policyId={policyId}
              plan={plan}
              insuredName={insuredName}
              endorsementType={endorsementType}
              onBackToEndorsementType={() => setEndorsementType(null)}
              onEndorsementSuccess={onEndorsementSuccess}
            />
          </Suspense>
        );
      case 'NomineeUpdate':
        return (
          <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin" />}>
            <NonFinancialPolicyEndorsement
              policyNumber={policyNumber}
              policyId={policyId}
              plan={plan}
              insuredName={insuredName}
              endorsementType={endorsementType}
              onBackToEndorsementType={() => setEndorsementType(null)}
              onEndorsementSuccess={onEndorsementSuccess}
            />
          </Suspense>
        );
      case 'DependentUpdation':
      case 'DependentAddition':
        return (
          <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin" />}>
            <NonFinancialPolicyEndorsement
              policyNumber={policyNumber}
              policyId={policyId}
              plan={plan}
              insuredName={insuredName}
              endorsementType={endorsementType}
              onBackToEndorsementType={() => setEndorsementType(null)}
              onEndorsementSuccess={onEndorsementSuccess}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const renderEndorsementDialog = () => {
    if (endorsementType) {
      return <div className="min-w-endorse-modal-width">{renderEndorsementFlow()}</div>;
    } else {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-endorse-policy-text text-lg font-semibold leading-none">{title}</p>
            <p className="text-endorse-policy-muted text-sm leading-5">
              {description} <span className="text-endorse-policy-text">{policyNumber}</span>
            </p>
          </div>
          {notice && !isEndorsementTypeEmpty && !isEndorsementTypeLoading && (
            <div className="border-endorse-policy-notice-border bg-endorse-policy-notice-bg shadow-endorse-policy-notice rounded-endorse-policy-notice flex items-center gap-2 border p-4">
              <p className="text-endorse-policy-notice-title text-xs font-sm leading-5">{notice}</p>
            </div>
          )}
          {isEndorsementTypeLoading ? (
            <div className="flex flex-col gap-6">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            </div>
          ) : isEndorsementTypeError ? (
            <div className="rounded-endorse-policy-card border-endorse-policy-border bg-primary-foreground border p-4">
              <p className="text-endorse-policy-text text-sm font-medium leading-none">
                {'Unable to load endorsement options'}
              </p>
              <p className="text-endorse-policy-muted mt-2 text-sm leading-5">
                {'Please close the modal and try again.'}
              </p>
            </div>
          ) : isEndorsementTypeEmpty ? (
            <div className="rounded-endorse-policy-card border-endorse-policy-border bg-primary-foreground border p-4">
              <p className="text-endorse-policy-text text-sm font-medium leading-none">
                {'No endorsement options available'}
              </p>
              <p className="text-endorse-policy-muted mt-2 text-sm leading-5">
                {'There are no applicable endorsement types for this policy right now.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {sections.map((section) => (
                <div key={section.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-endorse-policy-text text-sm font-semibold leading-5">
                      {section.title}
                    </p>
                    {section.badgeLabel && section.badgeTone ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          'rounded-endorse-policy-badge border px-2 py-0.5 text-xs font-medium leading-4',
                          badgeToneStyles[section.badgeTone],
                        )}
                      >
                        {section.badgeLabel}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {section.actions.map((action) => (
                      <EndorsementActionCard
                        key={action.id}
                        id={action.id}
                        title={action.title}
                        description={action.description}
                        icon={action.icon as ReactNode}
                        onClick={() => {
                          trackEndorsePolicyOptionClick(segmentBaseRef.current, {
                            policy_number: policyNumber,
                            endorsement_type: action.id,
                          });
                          setEndorsementType(action.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Card className="mx-auto border-endorse-policy-border bg-endorse-policy-bg rounded-endorse-policy-card shadow-endorse-policy-card relative flex flex-col gap-6 p-6">
      {renderEndorsementDialog()}
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer text-endorse-policy-close hover:text-endorse-policy-close-hover absolute right-4 top-4 flex h-4 items-center justify-center"
        aria-label="Close"
      >
        <X className="h-4" />
      </button>
    </Card>
  );
}
