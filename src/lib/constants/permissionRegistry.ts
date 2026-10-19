/**
 * Permission model: backend capability strings (`can_*`), stored in `partner.store`.
 * Effective permissions are the union of partner, LOB, and product permission arrays
 * (see `usePartnerConfig`).
 *
 * Route ↔ permission rules: `routePermissions.constants.ts`
 * Sidebar entries: `MainSidebar` (`navItems`)
 */

export { ENDORSE_ACTION_PERMISSIONS, PERMISSIONS, type Permission } from './auth.constants';
