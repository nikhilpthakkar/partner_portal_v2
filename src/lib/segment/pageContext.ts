import { PageNames, PageWorkflowNames } from '@/lib/constants/segments.constants';

export type SegmentPageContext = {
  page: PageNames;
  page_workflow: PageWorkflowNames;
};

/** Map current URL to Segment page + workflow for shell-level events (sidebar, global filters). */
export function getSegmentPageContextFromPathname(pathname: string | null): SegmentPageContext {
  const path = pathname ?? '';
  if (path.includes('/policy-details')) {
    return {
      page: PageNames.POLICY_DETAILS_PAGE,
      page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    };
  }
  if (path.includes('/claim-details')) {
    return {
      page: PageNames.CLAIMS_DETAILS_PAGE,
      page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    };
  }
  if (path.includes('/policy-management')) {
    return {
      page: PageNames.POLICY_OVERVIEW_PAGE,
      page_workflow: PageWorkflowNames.POLICY_MANAGEMENT,
    };
  }
  if (path.includes('/claims-management')) {
    return {
      page: PageNames.CLAIMS_OVERVIEW_PAGE,
      page_workflow: PageWorkflowNames.CLAIMS_MANAGEMENT,
    };
  }
  if (path.includes('/settings')) {
    return {
      page: PageNames.SETTINGS_PAGE,
      page_workflow: PageWorkflowNames.SETTINGS,
    };
  }
  if (path.includes('/reports')) {
    return {
      page: PageNames.REPORTS_PAGE,
      page_workflow: PageWorkflowNames.REPORTS,
    };
  }
  if (path.includes('/financials')) {
    return {
      page: PageNames.FINANCIALS_PAGE,
      page_workflow: PageWorkflowNames.FINANCIALS,
    };
  }
  return {
    page: PageNames.DASHBOARD_OVERVIEW_PAGE,
    page_workflow: PageWorkflowNames.DASHBOARD,
  };
}
