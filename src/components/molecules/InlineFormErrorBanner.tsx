import { cn } from '@/lib/utils';

type InlineFormErrorBannerProps = {
  message: string;
  className?: string;
};

export default function InlineFormErrorBanner({ message, className }: InlineFormErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center rounded-md border border-inline-form-error-border bg-inline-form-error-bg p-4',
        className,
      )}
    >
      <p className="w-full text-xs leading-none text-inline-form-error-text">{message}</p>
    </div>
  );
}
