import Reports from '@/features/reports';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { FinancialStatements } from '@/features/financial-workspace/statements-screen';

export default function OverviewPage() {
  return FINANCIAL_SIMULATOR_ENABLED ? <FinancialStatements /> : <Reports />;
}
