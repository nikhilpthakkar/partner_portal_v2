import Financials from '@/features/financials';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { FinancialLedger } from '@/features/financial-workspace/ledger-screen';

export default function FinancialsPage() {
  return FINANCIAL_SIMULATOR_ENABLED ? <FinancialLedger /> : <Financials />;
}
