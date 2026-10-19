'use client';

import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { cn } from '@/lib/utils';
import { PermissionGate } from '../atoms/PermissionGate';

type UploadRequiredBannerProps = {
  title: string;
  description: string;
  actionLabel: string;
  onActionClick: () => void;
  className?: string;
};

export default function UploadRequiredBanner({
  title,
  description,
  actionLabel,
  onActionClick,
  className,
}: UploadRequiredBannerProps) {
  return (
    <div
      className={cn(
        'border-upload-required-banner-border bg-upload-required-banner-bg flex items-center justify-between gap-4 rounded-md border p-4',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-upload-required-banner-title text-sm font-medium">{title}</p>
        <p className="text-upload-required-banner-description text-sm leading-5">{description}</p>
      </div>
      <PermissionGate permission={PERMISSIONS.UPDATE_CLAIMS}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onActionClick}
          className="border-upload-required-banner-button-border bg-upload-required-banner-button-bg text-upload-required-banner-button-text hover:bg-upload-required-banner-button-hover-bg hover:text-upload-required-banner-button-hover-text shadow-upload-required-banner-button shrink-0"
        >
          {actionLabel}
        </Button>
      </PermissionGate>
    </div>
  );
}
