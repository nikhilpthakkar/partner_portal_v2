import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const PAGE_LAYOUT_CLASS = 'mx-auto flex w-full flex-col gap-6 px-6 py-3';

export const PAGE_TITLE_CLASS = 'text-2xl font-semibold leading-8 text-pagination-text';

export const PAGE_SUBTITLE_CLASS = 'text-base text-pagination-text-muted';

type PageHeadingProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  capitalizeTitle?: boolean;
  titleClassName?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeading({
  title,
  subtitle,
  capitalizeTitle = false,
  titleClassName,
  actions,
  className,
}: PageHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <h1
            className={cn(
              PAGE_TITLE_CLASS,
              capitalizeTitle && 'capitalize',
              titleClassName,
            )}
          >
            {title}
          </h1>
          {subtitle ? <span className={PAGE_SUBTITLE_CLASS}>{subtitle}</span> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}
