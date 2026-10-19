export const InfoPill = ({ infoText }: { infoText: string }) => {
  if (!infoText) return null;

  return (
    <div className="rounded-endorse-policy-notice border border-yellow-200 bg-endorse-policy-notice-bg px-4 py-3">
      <p className="text-endorse-policy-notice-text text-xs leading-5">{infoText}</p>
    </div>
  );
};
