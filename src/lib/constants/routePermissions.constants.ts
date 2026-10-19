import { PERMISSIONS, type Permission } from '@/lib/constants/auth.constants';

type RoutePermissionRule = {
  pattern: RegExp;
  permission: Permission | Permission[];
};

export const DASHBOARD_ROUTE_PERMISSIONS: RoutePermissionRule[] = [
  { pattern: /\/dashboard\/overview$/, permission: PERMISSIONS.VIEW_DASHBOARD },
  { pattern: /\/dashboard\/policy-management(\/|$)/, permission: PERMISSIONS.VIEW_POLICIES },
  { pattern: /\/dashboard\/claims-management(\/|$)/, permission: PERMISSIONS.VIEW_CLAIMS },
  { pattern: /\/dashboard\/reports(\/|$)/, permission: PERMISSIONS.VIEW_REPORTS },
  { pattern: /\/dashboard\/financials(\/|$)/, permission: PERMISSIONS.VIEW_FINANCIALS },
  { pattern: /\/dashboard\/manual-refunds(\/|$)/, permission: PERMISSIONS.ADD_TCS_TDS_TRANSACTIONS },
  { pattern: /\/dashboard\/settings(\/|$)/, permission: PERMISSIONS.CONFIGURE_METRICS },
  { pattern: /\/dashboard\/export-data(\/|$)/, permission: PERMISSIONS.UPLOAD_BULK },
];

export const getDashboardRoutePermission = (
  pathname: string,
): Permission | Permission[] | undefined =>
  DASHBOARD_ROUTE_PERMISSIONS.find((rule) => rule.pattern.test(pathname))?.permission;
