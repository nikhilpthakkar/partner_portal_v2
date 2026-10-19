export const ACCESS_TOKEN_KEY = 'pp_access_token';
export const REFRESH_TOKEN_KEY = 'pp_refresh_token';
export const AUTH_REALM = 'partner-portal';
export const AUTH_CLIENT_ID = 'partner-portal';
export const LIFE_AUTH_REALM = 'partner-portal-life';
export const LIFE_AUTH_CLIENT_ID = 'partner-portal-life';

export const GLOBAL_LOADER_MESSAGES = {
  PARTNER_CONFIG_LOADING:
    "Hang tight! We're loading your data. Please refresh if this takes too long.",
  LOGIN_REDIRECT_LOADING: 'We are redirecting you to the login page.',
  LOGOUT_REDIRECT_LOADING: 'Logging you out. You will be redirected to the login page.',
  TROUBLE_LOADING_STATUS:
    "We're having trouble loading this page. Please try refreshing, or check back in a moment.",
} as const;

export const ACCESS_DENIED_MESSAGE = 'You do not have permission to access this page.';

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'can_view_dashboard',
  VIEW_POLICIES: 'can_view_policies',
  VIEW_CLAIMS: 'can_view_claims',
  UPDATE_CLAIMS: 'can_update_claims',
  VIEW_FINANCIALS: 'can_view_financials',
  VIEW_REPORTS: 'can_view_reports',
  ENDORSE_NON_FINANCIAL: 'can_endorse_non_financial',
  ENDORSE_FINANCIAL: 'can_endorse_financial',
  UPLOAD_BULK: 'can_upload_bulk',
  RAISE_DISPUTE: 'can_raise_dispute',
  ADD_TCS_TDS_TRANSACTIONS: 'can_add_tcs_tds_transactions',
  CONFIGURE_METRICS: 'can_configure_metrics',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Either financial or non-financial endorse capability — use with PermissionGate `anyOf`. */
export const ENDORSE_ACTION_PERMISSIONS: Permission[] = [
  PERMISSIONS.ENDORSE_NON_FINANCIAL,
  PERMISSIONS.ENDORSE_FINANCIAL,
];
