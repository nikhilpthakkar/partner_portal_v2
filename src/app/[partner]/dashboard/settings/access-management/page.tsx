import { AccessManagement } from '@/features/financial-workspace/access-screen';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
export default function AccessPage() {
  return FINANCIAL_SIMULATOR_ENABLED ? (
    <AccessManagement />
  ) : (
    <div className="p-6">
      Access management requires the authenticated entitlement service. This enhancement is
      available in the local simulator.
    </div>
  );
}
