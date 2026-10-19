'use client';

import { ChevronDown } from 'lucide-react';
import Skeleton from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import TruncatedTooltipText from '@/components/molecules/TruncatedTooltipText';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { trackLogoutAction } from '@/lib/segment/track/navigation';

type SidebarUserMenuProps = {
  name: string;
  email: string;
  isLoading?: boolean;
};

export function SidebarUserMenu({ name, email, isLoading = false }: SidebarUserMenuProps) {
  const router = useRouter();
  const segmentBase = useSegmentPartnerBase();
  const initial = (name?.trim()?.[0] ?? 'U').toUpperCase();
  const handleLogoutClick = () => {
    trackLogoutAction(segmentBase);
    setTimeout(() => {
      router.push('/logout');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="size-sidebar-user-avatar shrink-0 rounded-sidebar-user-avatar" />
        <div className="flex flex-1 flex-col gap-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-sidebar-user-avatar-bg flex size-sidebar-user-avatar shrink-0 items-center justify-center overflow-hidden rounded-sidebar-user-avatar">
            <div
              aria-hidden
              className="flex size-full items-center justify-center text-sidebar-user-name text-sm font-semibold bg-avatar-background text-avatar-text"
            >
              {initial}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-none">
            <span className="text-sidebar-user-name text-sm font-semibold capitalize">{name}</span>
            <span className="text-sidebar-user-email text-xs">
              <TruncatedTooltipText text={email} />
            </span>
          </div>
          <ChevronDown className="text-sidebar-user-icon size-4 shrink-0" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="min-w-40 rounded-md border border-border bg-popover p-1 shadow-md"
      >
        <DropdownMenuItem
          className="px-2 py-1.5 text-sm cursor-pointer"
          onClick={handleLogoutClick}
        >
          {'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
