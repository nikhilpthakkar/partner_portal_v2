'use client';

import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

type ShareRecipientCardProps = {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
};

export default function ShareRecipientCard({
  title,
  subtitle,
  selected,
  onClick,
  className,
}: ShareRecipientCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-share-recipient flex w-full items-center gap-3 border px-3 py-3 text-left cursor-pointer',
        selected
          ? 'border-share-recipient-border-active bg-share-recipient-bg-active'
          : 'border-share-recipient-border bg-share-recipient-bg',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-share-recipient-text text-sm font-medium leading-none">{title}</span>
        {subtitle ? <span className="text-share-recipient-muted text-sm">{subtitle}</span> : null}
      </div>
      <ChevronRight className="h-5 w-5 text-share-recipient-chevron" />
    </button>
  );
}
