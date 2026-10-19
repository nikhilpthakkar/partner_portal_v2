'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

type DropdownCheckItemProps = {
  label: string;
  checked: boolean;
  onSelect: () => void;
  className?: string;
};

export default function DropdownCheckItem({
  label,
  checked,
  onSelect,
  className,
}: DropdownCheckItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded-multi-select-item px-2 py-1.5 text-left text-sm text-multi-select-text hover:bg-multi-select-accent-bg',
        checked && 'font-medium',
        className,
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center">
        <Check
          className={cn('h-4 w-4 text-multi-select-text', checked ? 'opacity-100' : 'opacity-0')}
        />
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}
