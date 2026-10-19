import Reports from '@/features/reports';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { PortalReports } from '@/features/financial-workspace/portal-pages';

export default function OverviewPage() {
  return FINANCIAL_SIMULATOR_ENABLED ? <PortalReports /> : <Reports />;
}
