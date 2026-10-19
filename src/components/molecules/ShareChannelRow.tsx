'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ShareChannelRowProps = {
  label: string;
  value: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  editable?: boolean;
  onValueChange?: (value: string) => void;
  error?: string;
  className?: string;
  itemClassName?: string;
};

export default function ShareChannelRow({
  label,
  value,
  checked,
  onCheckedChange,
  editable = false,
  onValueChange,
  error,
  className,
  itemClassName,
}: ShareChannelRowProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      <Checkbox
        className="cursor-pointer"
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(Boolean(next))}
      />
      <div className={cn('flex flex-col gap-3 w-full', itemClassName)}>
        <p className="text-share-channel-text text-sm font-medium leading-none">{label}</p>
        <Input
          value={value}
          disabled={!editable || !checked}
          onChange={editable && onValueChange ? (e) => onValueChange(e.target.value) : undefined}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-9 text-sm rounded-md',
            !editable && 'text-share-channel-muted',
            error && 'border-destructive',
          )}
        />
        {error && (
          <p className="text-destructive text-xs leading-none" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
