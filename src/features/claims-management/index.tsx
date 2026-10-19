'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import SegmentedTabs from '@/components/molecules/SegmentedTabs';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import { PermissionGate } from '@/components/atoms/PermissionGate';
import { Button } from '@/components/ui/button';
import ClaimsOverview from '@/components/organisms/ClaimsOverview';
import BulkOperations from '@/components/organisms/PolicyBulkOperations';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { CLAIMS_MANAGEMENT_HEADER_RESPONSE } from '@/lib/constants/claimsDetail.constants';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackClaimsManagementOpenCreateClaim,
  trackClaimsManagementPageView,
  trackClaimsManagementSwitchTopTab,
} from '@/lib/segment/track/claims';
import { PageNames, PageWorkflowNames } from '@/lib/constants/segments.constants';

export default function ClaimsManagement() {
  const router = useRouter();
  const { partner } = useParams<{ partner: string }>();
  const segmentBase = useSegmentPartnerBase();
  const data = CLAIMS_MANAGEMENT_HEADER_RESPONSE;
  const [topTab, setTopTab] = useState('');

  const resolvedTopTab = topTab || data.defaults.topTab;

  const activePageName = useMemo(() => {
    if (resolvedTopTab === 'bulk-operations') {
      return PageNames.POLICY_BULK_OPERATIONS_PAGE;
    }
    return PageNames.CLAIMS_OVERVIEW_PAGE;
  }, [resolvedTopTab]);

  const pageWorkflowName = useMemo(() => {
    if (resolvedTopTab === 'bulk-operations') {
      return PageWorkflowNames.POLICY_BULK_OPERATIONS;
    }
    return PageWorkflowNames.CLAIMS_MANAGEMENT;
  }, [resolvedTopTab]);

  useEffect(() => {
    trackClaimsManagementPageView(segmentBase, {
      page: activePageName,
      page_workflow: pageWorkflowName,
    });
  }, [segmentBase, activePageName, pageWorkflowName]);

  const handleTopTabChange = (value: string) => {
    trackClaimsManagementSwitchTopTab(segmentBase, {
      page: activePageName,
      entityName: value,
    });
    setTopTab(value);
  };

  const handleOpenCreateClaim = () => {
    trackClaimsManagementOpenCreateClaim(segmentBase, {
      page: activePageName,
      page_workflow: pageWorkflowName,
    });
    router.push(`/${partner}/dashboard/claims-management/create-claim`);
  };

  return (
    <div className="max-h-fit overflow-y-auto bg-white">
      <div className={PAGE_LAYOUT_CLASS}>
        <PageHeading
          title={data.header.title}
          subtitle={data.header.subtitle}
          actions={
            <PermissionGate permission={PERMISSIONS.UPDATE_CLAIMS}>
              <Button
                type="button"
                variant="default"
                onClick={handleOpenCreateClaim}
                aria-label={data.header.primaryActionLabel.label}
                className="bg-create-claim-button text-create-claim-button-text hover:bg-create-claim-button-hover shadow-create-claim-button h-9 gap-2 px-4 text-sm font-medium leading-normal"
              >
                <PlusIcon className="size-4 shrink-0" aria-hidden />
                {data.header.primaryActionLabel.label}
              </Button>
            </PermissionGate>
          }
        />
        <div className="flex flex-col gap-4">
          {data.topTabs.length > 1 && (
            <SegmentedTabs
              value={resolvedTopTab}
              onValueChange={handleTopTabChange}
              tabs={data.topTabs}
              className="w-full max-w-sm py-3 min-h-12"
              triggerClassName="h-10 py-4 px-2"
            />
          )}
          {resolvedTopTab === 'claims-overview' && <ClaimsOverview data={data} />}
          {resolvedTopTab === 'bulk-operations' && <BulkOperations />}
        </div>
      </div>
    </div>
  );
}
