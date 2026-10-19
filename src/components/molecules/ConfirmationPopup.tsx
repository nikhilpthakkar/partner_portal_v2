import { Button } from '../ui/button';

type ConfirmationPopupProps = {
  title: string;
  subtitle: string;
  confirmButtonLabel: string;
  cancelButtonLabel: string;
  onBack: () => void;
  onConfirm: () => void;
};

export const ConfirmationPopup = ({
  title,
  subtitle,
  confirmButtonLabel,
  cancelButtonLabel,
  onBack,
  onConfirm,
}: ConfirmationPopupProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-endorse-policy-text text-lg font-semibold leading-none">{title}</p>
          <p className="text-endorse-policy-muted text-sm leading-5">
            {subtitle}
            <br />
            {'This action cannot be undone.'}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-3.5">
          <Button type="button" variant="outline" onClick={onBack}>
            {cancelButtonLabel}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmButtonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
