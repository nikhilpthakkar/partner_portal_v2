'use client';

import type { KeyboardEvent, ReactNode } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type EndorsementActionCardProps = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
};

export default function EndorsementActionCard({
  id,
  title,
  description,
  icon,
  onClick,
}: EndorsementActionCardProps) {
  return (
    <Card
      className={cn(
        'flex w-width-200 border-endorse-policy-action-border bg-endorse-policy-action-bg rounded-endorse-policy-action shadow-endorse-policy-action gap-3 p-4 flex-row',
        'cursor-pointer transition-colors hover:bg-endorse-policy-action-hover',
      )}
      onClick={() => onClick?.()}
    >
      <div className="text-endorse-policy-icon flex h-6 items-center justify-center">{icon}</div>
      <div className="flex flex-col gap-1">
        <p className="text-endorse-policy-text text-base leading-6">{title}</p>
        <p className="text-endorse-policy-muted text-sm leading-5">{description}</p>
      </div>
    </Card>
  );
}
