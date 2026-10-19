'use client';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { SelectOption } from '@/lib/types/Global';
import { cn } from '@/lib/utils';

type InsuredSelectProps = {
  label?: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showWhenEmpty?: boolean;
};

const menuContentStyles =
  'rounded-md border border-simple-select-border bg-white p-1 shadow-simple-select';

const menuItemStyles =
  'focus:bg-simple-select-accent-bg focus:text-simple-select-accent data-[state=checked]:bg-simple-select-accent-bg data-[state=checked]:text-simple-select-accent [&>span]:hidden rounded-simple-select-item px-2 py-1.5 text-sm text-simple-select-text';

export default function InsuredSelect({
  label = 'Insured',
  value,
  options,
  onValueChange,
  placeholder = 'Select insured',
  disabled = false,
  showWhenEmpty = false,
}: InsuredSelectProps) {
  if (!options.length && !showWhenEmpty) {
    return null;
  }

  const isDisabled = disabled || (showWhenEmpty && !options.length);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={isDisabled}>
      <SelectTrigger className="w-fit rounded-md border-policy-search-border bg-white px-4 py-2 text-sm font-medium leading-normal shadow-policy-search">
        <span className="whitespace-nowrap">
          {selectedLabel ? (
            <>
              <span className="text-muted-foreground">{label}: </span>
              <span className="text-foreground">{selectedLabel}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
      </SelectTrigger>
      <SelectContent className={cn(menuContentStyles, 'w-fit')}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className={menuItemStyles}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
