'use client';

import { ChangeEvent, KeyboardEvent, useRef } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';

import SimpleSelect from '@/components/molecules/SimpleSelect';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/lib/types/Global';

type PolicySearchBarProps = {
  filterValue: string;
  filterOptions: SelectOption[];
  onFilterChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  /** When set, overrides the placeholder derived from the selected filter label. */
  inputPlaceholder?: string;
  className?: string;
};

export default function PolicySearchBar({
  filterValue,
  filterOptions,
  onFilterChange,
  query,
  onQueryChange,
  onSearch = () => {},
  onClear,
  inputPlaceholder,
  className,
}: PolicySearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedLabel = filterOptions.find((option) => option.value === filterValue)?.label;
  const placeholderText =
    inputPlaceholder ??
    (selectedLabel ? `Search for ${selectedLabel.toLowerCase()}(s) separated by commas` : 'Search');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch?.();
    }
  };

  const handleSearchClick = () => {
    onSearch?.();
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onQueryChange('');
    onClear?.();
    inputRef.current?.focus();
  };
  const showClear = query.length > 0;
  const showSearchIcon = !showClear;

  return (
    <div className={cn('flex h-12 w-full items-center gap-4', className)}>
      <SimpleSelect
        value={filterValue}
        options={filterOptions}
        onValueChange={onFilterChange}
        className="min-h-12 w-policy-search-select-width rounded-md border-policy-search-border bg-white px-4 py-2 text-sm font-medium leading-normal text-policy-search-text shadow-policy-search"
        contentClassName="min-w-policy-search-select-width"
      />
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className="h-12 rounded-md border-policy-search-border bg-white px-4 py-2 pr-10 text-sm font-normal leading-normal text-policy-search-text shadow-policy-search"
        />
        {showSearchIcon && (
          <button
            type="button"
            onClick={handleSearchClick}
            aria-label="Search"
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-policy-search-text"
          >
            <SearchIcon className="size-4" />
          </button>
        )}
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-policy-search-text"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
