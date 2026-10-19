'use client';

import { Download, Loader2, Share2 } from 'lucide-react';
import { Fragment } from 'react';

import { AppImage } from '@/components/atoms/AppImage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  PolicyHealthCard,
  PolicyHealthCardActionType,
  PolicyHealthCardItem,
} from '@/lib/types/policy-management/policyDetails';

type PolicyHealthCardProps = {
  data: PolicyHealthCard;
  onAction?: (type: PolicyHealthCardActionType) => void;
  loadingActionType?: PolicyHealthCardActionType;
  className?: string;
};

const actionIcons: Record<PolicyHealthCardActionType, React.ReactNode> = {
  download: <Download className="h-4 w-4" />,
  share: <Share2 className="h-4 w-4" />,
};

export default function PolicyHealthCard({
  data,
  onAction,
  loadingActionType,
  className,
}: PolicyHealthCardProps) {
  const flatItems = data.items.flat();
  const findItem = (id: string): PolicyHealthCardItem | undefined =>
    flatItems.find((item) => item.id === id);

  const startDateItem = findItem('health-card-start-date');
  const endDateItem = findItem('health-card-end-date');
  const policyNumberItem = findItem('health-card-policy-number');
  const uhidItem = findItem('health-card-uhid');
  const relationshipItem = findItem('health-card-relationship');

  const memberName = data.title || '-';

  const dateRowItems = [startDateItem, endDateItem].filter((item): item is PolicyHealthCardItem =>
    Boolean(item),
  );

  const primaryRowItems = [policyNumberItem, uhidItem, relationshipItem].filter(
    (item): item is PolicyHealthCardItem => Boolean(item),
  );
  const shouldRenderDetails = primaryRowItems.length > 0;

  return (
    <div className="flex lg:w-12/25 sm:w-full md:w-fit items-start gap-4 flex-nowrap">
      <div
        className={cn(
          'bg-policy-health-card-bg border border-policy-health-card-border rounded-policy-health-card shadow-policy-health-card flex w-full flex-col p-6',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center">
            {data.primaryLogoSrc ? (
              <AppImage
                src={data.primaryLogoSrc}
                alt={data.primaryLogoAlt ?? 'ACKO'}
                width={96}
                height={24}
              />
            ) : (
              <span className="text-policy-health-card-title text-2xl font-semibold leading-none">
                {data.primaryLogoAlt ?? 'ACKO'}
              </span>
            )}
          </div>
          {data.secondaryLogoSrc ? (
            <AppImage
              src={data.secondaryLogoSrc}
              alt={data.secondaryLogoAlt ?? 'TPA'}
              width={48}
              height={24}
            />
          ) : null}
        </div>
        <p className="pt-6 text-policy-health-card-title text-2xl font-semibold leading-none">
          {memberName}
        </p>
        {dateRowItems.length > 0 && (
          <div className="flex items-center gap-4 pt-6">
            {dateRowItems.map((item, index) => (
              <Fragment key={item.id}>
                <div className="flex items-center">
                  <p className="text-policy-health-card-value text-sm">{item.value}</p>
                </div>
                {index === 0 && dateRowItems.length > 1 && (
                  <div className="h-px w-16 bg-policy-health-card-border" />
                )}
              </Fragment>
            ))}
          </div>
        )}
        {shouldRenderDetails && (
          <div className="grid gap-4 sm:grid-cols-2 pt-6">
            {primaryRowItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex flex-col gap-2',
                  primaryRowItems.length === 1 ? 'sm:col-span-2' : '',
                )}
              >
                <p className="text-policy-health-card-label text-sm font-semibold">{item.label}</p>
                <p className="text-policy-health-card-value text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {data.actions.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.actions.map((action) => {
            const isActionLoading = loadingActionType === action.type;

            return (
              <Button
                key={action.type}
                type="button"
                variant="outline"
                size="icon"
                aria-label={action.label}
                title={action.label}
                disabled={isActionLoading}
                onClick={() => onAction?.(action.type)}
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  actionIcons[action.type]
                )}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
