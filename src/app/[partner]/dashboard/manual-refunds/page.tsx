import ManualRefunds from '@/features/manual-refunds';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { ManualRefundsPreview } from '@/features/financial-workspace/ledger-screen';

export default function ManualRefundsPage() {
  return FINANCIAL_SIMULATOR_ENABLED ? <ManualRefundsPreview /> : <ManualRefunds />;
}
