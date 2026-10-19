'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import DateRangePicker from '@/components/molecules/DateRangePicker';
import MultiSearchSelect from '@/components/molecules/MultiSearchSelect';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/lib/types/Global';

const SINGLE_SELECT_ALL_VALUE = '__all__';

type FilterConfigItem = {
  id: string;
  placeholder: string;
  options: SelectOption[];
  /** Defaults to multi-select. Set `false` for a single-value dropdown. */
  multiple?: boolean;
};

type FiltersProps = {
  dateRange: DateRange;
  onDateRangeChange: (value: DateRange) => void;
  config: FilterConfigItem[];
  labels: {
    trigger: string;
    title: string;
    clear: string;
    apply: string;
    close: string;
  };
  onApply: (values: Record<string, string[]>) => void;
  appliedValues?: Record<string, string[]>;
  /** `end` pushes the Filters trigger to the right (default). `start` keeps it next to the date picker. */
  align?: 'start' | 'end';
  className?: string;
};

export default function Filters({
  dateRange,
  onDateRangeChange,
  config,
  labels,
  onApply,
  appliedValues,
  align = 'end',
  className,
}: FiltersProps) {
  const [open, setOpen] = useState<boolean>(false);

  const [values, setValues] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(config.map((c) => [c.id, []])),
  );
  const [search, setSearch] = useState<Record<string, string>>(() =>
    Object.fromEntries(config.map((c) => [c.id, ''])),
  );

  useEffect(() => {
    if (appliedValues === undefined) {
      return;
    }
    setValues((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const c of config) {
        const incoming = appliedValues[c.id];
        if (incoming === undefined) {
          continue;
        }
        const prevKey = [...(prev[c.id] ?? [])].sort().join('\0');
        const nextKey = [...incoming].sort().join('\0');
        if (prevKey !== nextKey) {
          next[c.id] = [...incoming];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [appliedValues, config]);

  const handleValueChange = (id: string, nextValues: string[]) => {
    setValues((prev) => ({
      ...prev,
      [id]: nextValues,
    }));
  };

  const handleSingleValueChange = (id: string, value: string) => {
    handleValueChange(id, value === SINGLE_SELECT_ALL_VALUE ? [] : [value]);
  };

  const handleSearchChange = (id: string, value: string) => {
    setSearch((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleClear = () => {
    const cleared = Object.fromEntries(config.map((c) => [c.id, [] as string[]]));
    setValues(cleared);
    setSearch(Object.fromEntries(config.map((c) => [c.id, ''])));
    onApply(cleared);
    setOpen(false);
  };

  const handleApply = () => {
    onApply(values);
    setOpen(false);
  };

  return (
    <div className={cn('flex w-full items-center gap-2', className)}>
      <div className="w-filters-date-range-width">
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'border-filters-border text-filters-text shadow-filters-trigger',
              align === 'end' && 'ml-auto',
            )}
          >
            {labels.trigger}
            <ChevronDown className="h-4 w-4 text-filters-muted" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-[320px] border-0 p-0">
          <div className="flex flex-col gap-4 rounded-md border border-filters-border bg-white p-4 text-filters-text shadow-filters">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-filters-text">{labels.title}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
                className="rounded-sm text-filters-text cursor-pointer"
              >
                <X className="h-4 w-4 text-filters-text" />
              </button>
            </div>

            {/* Selects */}
            <div className="flex flex-col gap-3">
              {config.map((select) =>
                select.multiple === false ? (
                  <Select
                    key={select.id}
                    value={(values[select.id] ?? [])[0] ?? SINGLE_SELECT_ALL_VALUE}
                    onValueChange={(value) => handleSingleValueChange(select.id, value)}
                  >
                    <SelectTrigger className="border-filters-border h-9 w-full shadow-filters-trigger">
                      <SelectValue placeholder={select.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SINGLE_SELECT_ALL_VALUE}>{select.placeholder}</SelectItem>
                      {select.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <MultiSearchSelect
                    key={select.id}
                    values={values[select.id] ?? []}
                    options={select.options}
                    onValuesChange={(vals) => handleValueChange(select.id, vals)}
                    placeholder={select.placeholder}
                    searchValue={search[select.id] ?? ''}
                    onSearchChange={(val) => handleSearchChange(select.id, val)}
                    emptyLabel="No options"
                  />
                ),
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                className="border-filters-border text-filters-text shadow-filters-trigger"
              >
                {labels.clear}
              </Button>
              <Button
                onClick={handleApply}
                className="bg-filters-button-bg text-filters-button-text shadow-filters-trigger hover:bg-filters-button-bg-hover"
              >
                {labels.apply}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
