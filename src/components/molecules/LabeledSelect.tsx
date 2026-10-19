'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDownIcon, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/lib/types/Global';
import { formatEnum } from '@/lib/utils';

type LabeledSelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  className?: string;
  contentClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
};

const popoverContentStyles =
  'flex flex-col overflow-hidden rounded-md border border-labeled-select-border bg-white p-0 shadow-labeled-select';

const listStyles =
  'min-h-0 max-h-header-select-content-max-height overflow-y-auto overscroll-contain p-1';

const menuItemStyles =
  'cursor-pointer rounded-labeled-select-item px-2 py-1.5 text-sm text-labeled-select-text outline-none focus:bg-labeled-select-accent-bg focus:text-labeled-select-accent';

const searchInputStyles =
  'h-9 min-h-9 border-0 bg-transparent px-0 py-0 text-sm shadow-none hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0';

const getOptionLabel = (option: SelectOption) => formatEnum(option.label);

export default function LabeledSelect({
  label,
  value,
  options,
  onValueChange,
  className,
  contentClassName,
  placeholder,
  disabled,
  searchable = false,
  searchPlaceholder,
}: LabeledSelectProps) {
  const listboxId = useId();
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const typeaheadRef = useRef('');
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const sortedOptions = useMemo(
    () =>
      [...options].sort((left, right) =>
        getOptionLabel(left).localeCompare(getOptionLabel(right), undefined, {
          sensitivity: 'base',
        }),
      ),
    [options],
  );

  const selectedOption = sortedOptions.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchValue.trim()) {
      return sortedOptions;
    }

    const query = searchValue.trim().toLowerCase();
    return sortedOptions.filter((option) => {
      const formattedLabel = getOptionLabel(option).toLowerCase();
      return (
        option.label.toLowerCase().includes(query) ||
        formattedLabel.includes(query) ||
        option.value.toLowerCase().includes(query)
      );
    });
  }, [sortedOptions, searchValue, searchable]);

  const focusOption = (index: number) => {
    if (filteredOptions.length === 0) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(index, filteredOptions.length - 1));
    setFocusedIndex(nextIndex);
    const optionElement = optionRefs.current[nextIndex];
    optionElement?.scrollIntoView({ block: 'nearest' });
    optionElement?.focus();
  };

  const resetTypeahead = () => {
    typeaheadRef.current = '';
    if (typeaheadTimeoutRef.current) {
      clearTimeout(typeaheadTimeoutRef.current);
      typeaheadTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      resetTypeahead();
      return;
    }

    const selectedIndex = filteredOptions.findIndex((option) => option.value === value);
    const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;

    if (searchable) {
      setFocusedIndex(nextIndex);
      return;
    }

    focusOption(nextIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus when menu opens or options change
  }, [open, filteredOptions, value, searchable]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearchValue('');
      resetTypeahead();
    }
  };

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setSearchValue('');
    resetTypeahead();
    setOpen(false);
  };

  const handleListboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (filteredOptions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusOption(focusedIndex + 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        focusOption(focusedIndex - 1);
        return;
      case 'Home':
        event.preventDefault();
        focusOption(0);
        return;
      case 'End':
        event.preventDefault();
        focusOption(filteredOptions.length - 1);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleSelect(filteredOptions[focusedIndex].value);
        return;
      default:
        if (
          searchable ||
          event.key.length !== 1 ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        typeaheadRef.current += event.key.toLowerCase();

        if (typeaheadTimeoutRef.current) {
          clearTimeout(typeaheadTimeoutRef.current);
        }

        typeaheadTimeoutRef.current = setTimeout(() => {
          resetTypeahead();
        }, 500);

        const query = typeaheadRef.current;
        const startIndex = focusedIndex + 1;
        const matchFromCursor = filteredOptions.findIndex(
          (option, index) =>
            index >= startIndex && getOptionLabel(option).toLowerCase().startsWith(query),
        );
        const matchFromStart =
          matchFromCursor >= 0
            ? matchFromCursor
            : filteredOptions.findIndex((option) =>
                getOptionLabel(option).toLowerCase().startsWith(query),
              );

        if (matchFromStart >= 0) {
          focusOption(matchFromStart);
        }
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && filteredOptions.length > 0) {
      event.preventDefault();
      focusOption(0);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
      <PopoverTrigger
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        className={cn(
          'flex h-9 min-w-fit w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-labeled-select-border bg-white px-4 py-2 text-sm font-medium text-labeled-select-text shadow-labeled-select-trigger',
          className,
        )}
      >
        <span className="flex-1 truncate text-left">
          <span className="text-pagination-text-muted">{label}: </span>
          {selectedOption ? (
            <span>{getOptionLabel(selectedOption)}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder ?? ''}</span>
          )}
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(popoverContentStyles, 'w-(--radix-popover-trigger-width)', contentClassName)}
      >
        {searchable ? (
          <div className="flex shrink-0 items-center gap-2 border-b border-labeled-select-border px-3 py-0">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              className={searchInputStyles}
              aria-label={`Search ${label}`}
              aria-controls={listboxId}
            />
          </div>
        ) : null}
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          tabIndex={searchable ? -1 : 0}
          onKeyDown={handleListboxKeyDown}
          className={cn(listStyles)}
        >
          {filteredOptions.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = focusedIndex === index;

            return (
              <button
                key={option.value}
                id={`${listboxId}-option-${index}`}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => handleSelect(option.value)}
                onFocus={() => setFocusedIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelect(option.value);
                    return;
                  }

                  handleListboxKeyDown(
                    event as unknown as KeyboardEvent<HTMLDivElement>,
                  );
                }}
                className={cn(
                  menuItemStyles,
                  'flex w-full truncate text-left',
                  isSelected && 'bg-labeled-select-accent-bg text-labeled-select-accent',
                )}
              >
                {getOptionLabel(option)}
              </button>
            );
          })}
          {filteredOptions.length === 0 && searchable ? (
            <div className="px-2 py-2 text-sm text-muted-foreground">No results found</div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
