import Overview from '@/features/overview';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { PortalOverview } from '@/features/financial-workspace/portal-pages';

export default function OverviewPage() {
  return FINANCIAL_SIMULATOR_ENABLED ? <PortalOverview /> : <Overview />;
}
