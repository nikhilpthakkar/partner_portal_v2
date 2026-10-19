type NonFinancialPolicyEndorsementHeaderProps = {
  policyNumber: string;
};

export const NonFinancialPolicyEndorsementHeader = ({
  policyNumber,
}: NonFinancialPolicyEndorsementHeaderProps) => (
  <div className="flex flex-col gap-1.5">
    <p className="text-endorse-policy-text text-lg font-semibold leading-none">
      {'Endorse policy'}
    </p>
    <p className="text-endorse-policy-muted text-sm leading-5">
      {'Selected policy '}
      <span className="text-endorse-policy-text">{policyNumber}</span>
    </p>
  </div>
);
