'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import SegmentedTabs from '@/components/molecules/SegmentedTabs';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import PolicyOverview from '@/components/organisms/PolicyOverview';
import PolicyBulkOperations from '@/components/organisms/PolicyBulkOperations';
import PolicyBulkUploadCard from '@/components/organisms/PolicyBulkUploadCard';
import CancellationReportDownloadDialog from '@/components/organisms/CancellationReportDownloadDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DEFAULT_POLICY_MANAGEMENT_TAB,
  POLICY_MANAGEMENT_TOP_TABS,
  POLICY_MANAGEMENT_HEADER,
  POLICY_MANAGEMENT_UPLOAD_FILE_LABEL,
} from '@/lib/constants/policy.constants';
import { PermissionGate } from '@/components/atoms/PermissionGate';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { hasPermission } from '@/lib/utils/permissionUtils';
import { usePartnerStore } from '@/lib/store/partner.store';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackPolicyManagementOpenBulkUpload,
  trackPolicyManagementPageView,
  trackPolicyManagementSwitchTopTab,
} from '@/lib/segment/track/policy';
import { PageNames, PageWorkflowNames } from '@/lib/constants/segments.constants';

export default function PolicyManagement() {
  const segmentBase = useSegmentPartnerBase();
  const [topTab, setTopTab] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [cancellationReportDialogOpen, setCancellationReportDialogOpen] = useState(false);

  const resolvedTopTab = topTab || DEFAULT_POLICY_MANAGEMENT_TAB.pageTab;

  const permissions = usePartnerStore((state) => state.permissions);
  const productIds = usePartnerStore((state) => state.productIds);
  const policyManagementTopTabs = POLICY_MANAGEMENT_TOP_TABS.filter((tab) =>
    hasPermission(permissions, tab.permission),
  );
  const showTopTabs = policyManagementTopTabs.length > 1;

  const activePageName = useMemo(() => {
    if (resolvedTopTab === 'bulk-operations') {
      return PageNames.POLICY_BULK_OPERATIONS_PAGE;
    }
    return PageNames.POLICY_OVERVIEW_PAGE;
  }, [resolvedTopTab]);

  const pageWorkflowName = useMemo(() => {
    if (resolvedTopTab === 'bulk-operations') {
      return PageWorkflowNames.POLICY_BULK_OPERATIONS;
    }
    return PageWorkflowNames.POLICY_MANAGEMENT;
  }, [resolvedTopTab]);

  useEffect(() => {
    trackPolicyManagementPageView(segmentBase, {
      page: activePageName,
      page_workflow: pageWorkflowName,
    });
  }, [segmentBase, activePageName, pageWorkflowName]);

  const handleOpenBulkUpload = () => {
    trackPolicyManagementOpenBulkUpload(segmentBase, {
      page: activePageName,
      page_workflow: pageWorkflowName,
    });
    setUploadDialogOpen(true);
  };

  const handleTopTabChange = (value: string) => {
    trackPolicyManagementSwitchTopTab(segmentBase, {
      page: activePageName,
      entityName: value,
    });
    setTopTab(value);
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-8 px-6 py-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-8 text-pagination-text">
            {POLICY_MANAGEMENT_HEADER.title}
          </h1>
          <p className="text-base text-pagination-text-muted">
            {POLICY_MANAGEMENT_HEADER.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {resolvedTopTab === 'policy-overview' && (
            <PermissionGate permission={PERMISSIONS.VIEW_FINANCIALS}>
              <Button
                type="button"
                onClick={() => setCancellationReportDialogOpen(true)}
                className="h-9 gap-2 bg-[#8b5cf6] px-4 text-sm font-medium leading-normal text-white shadow-xs hover:bg-[#7c3aed]"
              >
                <Download className="size-4 shrink-0" aria-hidden />
                Download Cancellation report
              </Button>
            </PermissionGate>
          )}
          {resolvedTopTab === 'bulk-operations' && (
            <PermissionGate permission={PERMISSIONS.UPLOAD_BULK}>
              <Button
                type="button"
                onClick={handleOpenBulkUpload}
                aria-label={POLICY_MANAGEMENT_UPLOAD_FILE_LABEL}
                className="bg-policy-bulk-upload-primary text-policy-bulk-upload-primary-text hover:bg-policy-bulk-upload-primary-hover shadow-xs h-9 gap-2 px-4 text-sm font-medium leading-normal"
              >
                <Upload className="size-4 shrink-0" aria-hidden />
                {POLICY_MANAGEMENT_UPLOAD_FILE_LABEL}
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {showTopTabs && (
          <SegmentedTabs
            value={resolvedTopTab}
            onValueChange={handleTopTabChange}
            tabs={policyManagementTopTabs}
            className="w-full max-w-sm py-3 min-h-12"
            triggerClassName="h-10 py-4 px-2"
          />
        )}
        {resolvedTopTab === 'policy-overview' && <PolicyOverview showTopTabs={showTopTabs} />}
        {resolvedTopTab === 'bulk-operations' && <PolicyBulkOperations />}
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-3xl overflow-y-auto border-0 bg-transparent p-0 shadow-none"
        >
          <PolicyBulkUploadCard
            dialogOpen={uploadDialogOpen}
            onClose={() => {
              setUploadDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <CancellationReportDownloadDialog
        open={cancellationReportDialogOpen}
        onOpenChange={setCancellationReportDialogOpen}
        productIds={productIds}
      />
    </div>
  );
}
