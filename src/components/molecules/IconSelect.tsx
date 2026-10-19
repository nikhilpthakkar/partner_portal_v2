'use client';

import type { ReactNode } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/lib/types/Global';

type IconSelectProps = {
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  icon: ReactNode;
  className?: string;
  contentClassName?: string;
  placeholder?: string;
  disabled?: boolean;
};

const menuContentStyles =
  'rounded-md border border-icon-select-border bg-white p-1 shadow-icon-select';

const menuItemStyles =
  'focus:bg-icon-select-accent-bg focus:text-icon-select-accent data-[state=checked]:bg-icon-select-accent-bg data-[state=checked]:text-icon-select-accent rounded-icon-select-item px-2 py-1.5 text-sm text-icon-select-text [&>span]:hidden';

export default function IconSelect({
  value,
  options,
  onValueChange,
  icon,
  className,
  contentClassName,
  placeholder,
  disabled,
}: IconSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'h-9 min-w-fit w-full justify-between rounded-md border-icon-select-border bg-white px-4 py-2 text-sm font-normal text-icon-select-text shadow-icon-select-trigger',
          className,
        )}
      >
        <span className="flex items-center gap-2">
          {icon}
          <SelectValue placeholder={placeholder ?? ''} />
        </span>
      </SelectTrigger>
      <SelectContent className={cn(menuContentStyles, contentClassName)}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className={menuItemStyles}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
