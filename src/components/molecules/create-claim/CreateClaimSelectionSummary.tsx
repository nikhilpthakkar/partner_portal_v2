import { cn } from '@/lib/utils';

export type CreateClaimSelectionSummaryProps = {
  insuredName: string;
  policyNumber: string;
  className?: string;
};

export function CreateClaimSelectionSummary({
  insuredName,
  policyNumber,
  className,
}: CreateClaimSelectionSummaryProps) {
  return (
    <div className={cn('max-w-xl text-sm text-pagination-text-muted', className)}>
      <span className="font-light">{`Selected: `}</span>
      <span className="font-medium text-pagination-text">{insuredName}</span>
      <span className="font-light">{` (`}</span>
      <span className="font-light">{policyNumber}</span>
      <span className="font-light">{`)`}</span>
    </div>
  );
}
