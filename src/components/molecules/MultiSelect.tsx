'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDownIcon, Search } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/lib/types/Global';

type MultiSelectProps = {
  label: string;
  values: string[];
  options: SelectOption[];
  onValuesChange: (values: string[]) => void;
  className?: string;
  contentClassName?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
};

const popoverContentStyles =
  'flex flex-col overflow-hidden rounded-md border border-multi-select-border bg-white p-0 shadow-multi-select';

const listStyles =
  'min-h-0 max-h-header-select-content-max-height overflow-y-auto overscroll-contain p-2';

const searchInputStyles =
  'h-9 min-h-9 border-0 bg-transparent px-0 py-0 text-sm shadow-none hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0';

export default function MultiSelect({
  label,
  values,
  options,
  onValuesChange,
  className,
  contentClassName,
  placeholder,
  searchPlaceholder,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const selectedSet = useMemo(() => new Set(values), [values]);

  const sortedOptions = useMemo(
    () =>
      [...options].sort((left, right) =>
        left.label.localeCompare(right.label, undefined, { sensitivity: 'base' }),
      ),
    [options],
  );

  const displayContent = useMemo((): ReactNode => {
    if (values.length === 0) {
      return placeholder ?? '';
    }
    if (values.length === options.length) {
      return 'All';
    }

    const selectedLabels = sortedOptions
      .filter((option) => selectedSet.has(option.value))
      .map((option) => option.label);

    const firstLabel =
      selectedLabels[0] && selectedLabels[0].length > 6
        ? `${selectedLabels[0].slice(0, 6)}...`
        : (selectedLabels[0] ?? '');

    if (selectedLabels.length <= 1) {
      return firstLabel;
    }

    return (
      <>
        <span className="min-w-0 truncate">{firstLabel}</span>
        <span className="inline-flex shrink-0 items-center rounded-full bg-multi-select-accent-bg p-1 text-xs font-medium leading-none text-multi-select-accent">
          + {selectedLabels.length - 1}
        </span>
      </>
    );
  }, [options, placeholder, selectedSet, sortedOptions, values]);

  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) {
      return sortedOptions;
    }

    const query = searchValue.trim().toLowerCase();
    return sortedOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query),
    );
  }, [searchValue, sortedOptions]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearchValue('');
    }
  };

  const toggleValue = (value: string) => {
    const isSelected = selectedSet.has(value);

    if (isSelected && values.length === 1) {
      return;
    }

    const nextValues = isSelected ? values.filter((item) => item !== value) : [...values, value];

    onValuesChange(nextValues);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          'cursor-pointer flex h-9 max-w-multi-select-trigger-width min-w-fit items-center justify-between gap-2 rounded-md border border-multi-select-border bg-white px-4 py-2 text-sm font-medium text-multi-select-text shadow-multi-select-trigger',
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
          {label ? <span className="shrink-0 text-multi-select-text-muted">{label}: </span> : null}
          {typeof displayContent === 'string' ? (
            <span className="truncate">{displayContent}</span>
          ) : (
            displayContent
          )}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-multi-select-icon" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(
          popoverContentStyles,
          'w-(--radix-popover-trigger-width)',
          contentClassName,
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-multi-select-border px-3 py-0">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={searchPlaceholder}
            className={searchInputStyles}
            aria-label={label ? `Search ${label}` : 'Search'}
          />
        </div>
        <div className={listStyles}>
          {filteredOptions.map((option) => {
            const isSelected = selectedSet.has(option.value);

            return (
              <div
                key={option.value}
                onClick={() => toggleValue(option.value)}
                className={cn(
                  'cursor-pointer flex min-w-multi-select-item-width w-full items-center gap-2 rounded-multi-select-item px-2 py-1.5 text-sm text-multi-select-text',
                  isSelected && 'bg-multi-select-accent-bg text-multi-select-accent',
                )}
              >
                <Checkbox checked={isSelected} aria-hidden="true" tabIndex={-1} />
                <span className="truncate">{option.label}</span>
              </div>
            );
          })}
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-2 text-sm text-multi-select-text-muted">No results found</div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
