'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Breadcrumb = {
  label: string;
  href: string;
  isCurrent: boolean;
};

const getBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const paths = pathname.split('/').filter(Boolean);
  const baseSegments = paths.slice(0, 2);
  const breadcrumbSegments = paths.slice(2);

  return breadcrumbSegments.map((segment, index) => {
    const fullPath = [...baseSegments, ...breadcrumbSegments.slice(0, index + 1)];

    const isCurrent = index === breadcrumbSegments.length - 1;

    return {
      label: segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      href: `/${fullPath.join('/')}`,
      isCurrent,
    };
  });
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground')}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => router.back()}
        aria-label="Go back"
        className="size-8 rounded-sm border-input bg-white shadow-xs"
      >
        <ArrowLeftIcon className="size-4" />
      </Button>

      {breadcrumbs.map((item, index) => {
        const content = !item.isCurrent ? (
          <Link href={item.href} className={'hover:text-foreground transition-colors'}>
            {item.label}
          </Link>
        ) : (
          <span className={cn(item.isCurrent && 'text-foreground')}>{item.label}</span>
        );

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {content}
            {!item.isCurrent && <ChevronRightIcon className="size-4 text-muted-foreground" />}
          </div>
        );
      })}
    </nav>
  );
}
