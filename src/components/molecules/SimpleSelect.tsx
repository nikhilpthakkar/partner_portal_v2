'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/lib/types/Global';

type SimpleSelectProps = {
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  className?: string;
  contentClassName?: string;
  placeholder?: string;
  disabled?: boolean;
};

const menuContentStyles =
  'rounded-md border border-simple-select-border bg-white p-1 shadow-simple-select';

const menuItemStyles =
  'focus:bg-simple-select-accent-bg focus:text-simple-select-accent data-[state=checked]:bg-simple-select-accent-bg data-[state=checked]:text-simple-select-accent [&>span]:hidden rounded-simple-select-item px-2 py-1.5 text-sm text-simple-select-text';

export default function SimpleSelect({
  value,
  options,
  onValueChange,
  className,
  contentClassName,
  placeholder,
  disabled,
}: SimpleSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'justify-between gap-2 rounded-md border-simple-select-border bg-white px-4 py-2 text-sm font-medium leading-normal text-simple-select-text shadow-simple-select-trigger [&>svg]:opacity-50',
          className,
        )}
      >
        <SelectValue placeholder={placeholder ?? ''} />
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
