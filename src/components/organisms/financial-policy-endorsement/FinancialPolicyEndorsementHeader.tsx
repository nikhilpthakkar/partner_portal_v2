import { FINANCIAL_POLICY_ENDORSEMENT_HEADER } from '@/lib/constants/policyEndorsement.constants';

type FinancialPolicyEndorsementHeaderProps = {
  endorsementType: string;
  policyNumber: string;
};

export const FinancialPolicyEndorsementHeader = ({
  endorsementType,
  policyNumber,
}: FinancialPolicyEndorsementHeaderProps) => {
  const headerContent =
    FINANCIAL_POLICY_ENDORSEMENT_HEADER[
      endorsementType as keyof typeof FINANCIAL_POLICY_ENDORSEMENT_HEADER
    ];

  if (!headerContent) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-endorse-policy-text text-lg font-semibold leading-none">
        {headerContent.title}
      </p>
      <p className="text-endorse-policy-muted text-sm leading-5">
        {headerContent.description} <span className="text-endorse-policy-text">{policyNumber}</span>
      </p>
    </div>
  );
};
