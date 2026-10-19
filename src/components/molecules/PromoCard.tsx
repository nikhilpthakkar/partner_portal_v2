import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronRight, Loader2 } from 'lucide-react';
import type { PromoCardData } from '@/lib/types/overview';

type PromoCardProps = {
  card: PromoCardData;
  className?: string;
  badgeClassName?: string;
  activeCapabilityId?: string | null;
  onRegisterInterest?: (capabilityId: string) => void;
  isLoading?: boolean;
};

export default function PromoCard({
  card,
  className,
  badgeClassName,
  activeCapabilityId,
  onRegisterInterest,
  isLoading = false,
}: PromoCardProps) {
  const { capabilityId, title, description, ctaLabel, badgeLabel, badgeTone } = card;

  const badgeToneStyles = {
    warning:
      'border-promo-card-badge-warning-border bg-promo-card-badge-warning-bg text-promo-card-badge-warning-text',
    success:
      'border-promo-card-badge-success-border bg-promo-card-badge-success-bg text-promo-card-badge-success-text',
    info: 'border-promo-card-badge-info-border bg-promo-card-badge-info-bg text-promo-card-badge-info-text',
  } as const;

  return (
    <Card
      className={cn(
        'border-promo-card-border rounded-promo-card bg-promo-card-bg relative max-w-sm overflow-hidden p-6',
        className,
      )}
    >
      <div className="flex w-full flex-col gap-6 justify-between h-full">
        <div className="flex w-full flex-col gap-2.5">
          <p className="text-promo-card-muted text-sm leading-5">{title}</p>
          <p className="text-promo-card-text text-base leading-6">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => {
            if (!isLoading) {
              onRegisterInterest?.(capabilityId);
            }
          }}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading && activeCapabilityId === capabilityId ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              {ctaLabel}
              <ChevronRight className="size-4" />
            </>
          )}
        </Button>
      </div>
      {badgeLabel && badgeTone ? (
        <Badge
          variant="outline"
          className={cn(
            'text-promo-card-badge leading-promo-card-badge top-promo-card-badge-top absolute right-6 rounded-md px-2 py-0.5',
            badgeToneStyles[badgeTone],
            badgeClassName,
          )}
        >
          {badgeLabel}
        </Badge>
      ) : null}
    </Card>
  );
}
