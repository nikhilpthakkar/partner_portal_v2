'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Banknote,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LineChart,
  Mail,
  Settings,
  WalletCards,
} from 'lucide-react';

import { AppImage } from '@/components/atoms/AppImage';
import { PermissionGate } from '@/components/atoms/PermissionGate';
import { SidebarUserMenu } from '@/components/molecules/SidebarUserMenu';
import RaiseDisputeModal from '@/components/organisms/RaiseDisputeModal';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { useUserProfileStore } from '@/lib/store/userProfile.store';
import type { PermissionRequirement } from '@/lib/utils/permissionUtils';
import { cn } from '@/lib/utils';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { getSegmentPageContextFromPathname } from '@/lib/segment/pageContext';
import { trackSidebarNavigation } from '@/lib/segment/track/navigation';
import { useDataSource } from '@/lib/hooks/useDataSourceUrlState';
import { appendSourceQueryParam } from '@/lib/utils/dataSource.utils';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: PermissionRequirement;
};

const navItems: NavItem[] = [
  {
    label: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    label: 'Policy management',
    href: '/policy-management',
    icon: FileText,
    permission: PERMISSIONS.VIEW_POLICIES,
  },
  {
    label: 'Claims management',
    href: '/claims-management',
    icon: ClipboardList,
    permission: PERMISSIONS.VIEW_CLAIMS,
  },
  {
    label: 'Financials',
    href: '/financials',
    icon: WalletCards,
    permission: PERMISSIONS.VIEW_FINANCIALS,
  },
  {
    label: 'Manual refunds',
    href: '/manual-refunds',
    icon: Banknote,
    permission: PERMISSIONS.ADD_TCS_TDS_TRANSACTIONS,
  },
  { label: 'Reports', href: '/reports', icon: LineChart, permission: PERMISSIONS.VIEW_REPORTS },
  // { label: 'Export data', href: '/export-data', icon: FileOutput },
];

export function Sidebar() {
  const pathname = usePathname();
  const { partner } = useParams<{ partner: string }>();
  const { userProfile, isLoading } = useUserProfileStore();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const segmentBase = useSegmentPartnerBase();
  const dashboardBasePath = `/${partner}/dashboard`;
  const currentSource = useDataSource();
  const withCurrentSource = (href: string) => appendSourceQueryParam(href, '', currentSource);
  const overviewHref = withCurrentSource(`${dashboardBasePath}/overview`);
  const settingsHref = `${dashboardBasePath}/settings`;
  const settingsHrefWithSource = withCurrentSource(settingsHref);
  const userName = `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim();
  const userEmail = userProfile?.email || '--';

  return (
    <aside className="w-64 shrink-0 pb-6 pt-4 md:flex md:flex-col">
      <div className="px-6 pb-6">
        <Link
          href={overviewHref}
          onClick={() => {
            const pageContext = getSegmentPageContextFromPathname(pathname);
            trackSidebarNavigation(segmentBase, {
              ...pageContext,
              entity_name: 'Partner Portal',
              value: overviewHref,
            });
          }}
          className="text-foreground flex items-center gap-2 text-lg font-semibold leading-tight hover:opacity-80 transition-opacity"
        >
          {'Partner Portal'}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const resolvedHref = `${dashboardBasePath}${item.href}`;
          const hrefWithSource = withCurrentSource(resolvedHref);
          const isActive =
            pathname === resolvedHref ||
            (resolvedHref !== '/' && pathname.startsWith(`${resolvedHref}/`));

          return (
            <PermissionGate key={item.href} permission={item.permission}>
              <Link
                href={hrefWithSource}
                onClick={() => {
                  const pageContext = getSegmentPageContextFromPathname(pathname);
                  trackSidebarNavigation(segmentBase, {
                    ...pageContext,
                    entity_name: item.label,
                    value: hrefWithSource,
                  });
                }}
                className={cn(
                  'hover:bg-gray-300 text-sm font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  isActive && 'bg-gray-200 text-accent-foreground font-medium',
                )}
              >
                <Icon className="text-foreground size-4" />
                <span>{item.label}</span>
              </Link>
            </PermissionGate>
          );
        })}
      </nav>
      <div className="flex flex-col gap-3 px-4 pb-4">
        <PermissionGate permission={PERMISSIONS.CONFIGURE_METRICS}>
          <Link
            href={settingsHrefWithSource}
            onClick={() => {
              const pageContext = getSegmentPageContextFromPathname(pathname);
              trackSidebarNavigation(segmentBase, {
                ...pageContext,
                entity_name: 'Settings',
                value: settingsHrefWithSource,
              });
            }}
            className={cn(
              'hover:bg-gray-300 text-sm font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
              (pathname === `${dashboardBasePath}/settings` ||
                pathname.startsWith(`${dashboardBasePath}/settings/`)) &&
                'bg-gray-200 text-accent-foreground font-medium',
            )}
          >
            <Settings className="text-foreground size-4" />
            <span>Settings</span>
          </Link>
        </PermissionGate>
        <button
          type="button"
          onClick={() => {
            const pageContext = getSegmentPageContextFromPathname(pathname);
            trackSidebarNavigation(segmentBase, {
              ...pageContext,
              entity_name: 'Support',
              value: 'support',
            });
            setIsSupportModalOpen(true);
          }}
          className="hover:bg-gray-300 text-sm font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors cursor-pointer"
        >
          <Mail className="text-foreground size-4" />
          <span>Support</span>
        </button>
        <SidebarUserMenu name={userName} email={userEmail} isLoading={isLoading} />
      </div>

      <div className="border-t pt-6 border-border text-foreground flex items-center justify-center gap-3 text-xs leading-none">
        <span>{'Powered by'}</span>
        <AppImage
          src="/images/acko-enterprise-logo.svg"
          alt="ACKO Enterprise"
          width={80}
          height={20}
        />
      </div>
      {isSupportModalOpen && <RaiseDisputeModal open onOpenChange={setIsSupportModalOpen} />}
    </aside>
  );
}
