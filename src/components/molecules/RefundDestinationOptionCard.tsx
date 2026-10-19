'use client';

import { cn } from '@/lib/utils';

type RefundDestinationOptionCardProps = {
  isSelected: boolean;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
};

export function RefundDestinationOptionCard({
  isSelected,
  title,
  description,
  onClick,
  className,
}: RefundDestinationOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 cursor-pointer items-start gap-4 rounded-md border px-3 py-4 text-left',
        isSelected
          ? 'border-share-recipient-border-active bg-share-recipient-bg-active'
          : 'border-border bg-card',
        className,
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
          isSelected
            ? 'border-segmented-tab-active-text bg-segmented-tab-active-text'
            : 'border-border bg-background',
        )}
      >
        {isSelected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="text-sm font-medium leading-none text-foreground">{title}</span>
        <span className="text-sm leading-5 text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
