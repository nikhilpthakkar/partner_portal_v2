import Overview from '@/features/overview';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { OverviewPreview } from '@/features/financial-workspace/overview-preview';

export default function OverviewPage() {
  return FINANCIAL_SIMULATOR_ENABLED ? <OverviewPreview /> : <Overview />;
}
