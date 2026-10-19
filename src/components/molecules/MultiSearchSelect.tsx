'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDownIcon, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/lib/types/Global';
import DropdownCheckItem from '../atoms/DropdownCheckItem';
import { BULK_FILTERS_LABELS } from '@/lib/constants/policyBulkOperations.constants';

type MultiSearchSelectProps = {
  label?: string;
  values: string[];
  options: SelectOption[];
  onValuesChange: (values: string[]) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  emptyLabel: string;
  className?: string;
  contentClassName?: string;
  contentAlign?: 'start' | 'center' | 'end';
  summaryStyle?: 'comma' | 'compact';
  deferCommit?: boolean;
  disabled?: boolean;
  allLabel?: string;
};

const menuContentStyles =
  'rounded-md border border-multi-select-border bg-white p-1 shadow-multi-select';

function buildTriggerSummary(
  values: string[],
  options: SelectOption[],
  placeholder: string | undefined,
  summaryStyle: 'comma' | 'compact',
  allLabel: string,
): ReactNode {
  if (summaryStyle === 'comma') {
    if (values.length === 0) return placeholder ?? '';
    if (values.length === options.length && options.length > 0) return allLabel;
    return options
      .filter((o) => values.includes(o.value))
      .map((o) => o.label)
      .join(', ');
  }
  if (values.length === 0) return placeholder ?? '';
  if (values.length === options.length) return allLabel;
  const labels = options.filter((o) => values.includes(o.value)).map((o) => o.label);
  const first =
    labels[0] && labels[0].length > 6 ? `${labels[0].slice(0, 6)}...` : (labels[0] ?? '');
  if (labels.length <= 1) return first;
  return (
    <>
      <span className="min-w-0 truncate">{first}</span>
      <span className="inline-flex shrink-0 items-center rounded-full bg-multi-select-accent-bg p-1 text-xs font-medium leading-none text-multi-select-accent">
        + {labels.length - 1}
      </span>
    </>
  );
}

export default function MultiSearchSelect({
  label,
  values,
  options,
  onValuesChange,
  searchValue,
  onSearchChange,
  placeholder,
  emptyLabel,
  className,
  contentClassName,
  contentAlign = 'start',
  summaryStyle = 'comma',
  deferCommit = false,
  disabled,
  allLabel = 'All',
}: MultiSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(values);

  const list = deferCommit && open ? draft : values;
  const selected = useMemo(() => new Set(list), [list]);

  const triggerSummary = useMemo(
    () => buildTriggerSummary(values, options, placeholder, summaryStyle, allLabel),
    [allLabel, values, options, placeholder, summaryStyle],
  );

  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) return options;
    const q = searchValue.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, searchValue]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (deferCommit && next) setDraft([...values]);
  };

  const toggle = (id: string) => {
    const base = deferCommit && open ? draft : values;
    const next = new Set(base);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const arr = [...next];
    if (options.length > 0 && arr.length === 0 && !deferCommit) return;
    if (deferCommit && open) setDraft(arr);
    else onValuesChange(arr);
  };

  const apply = () => {
    onValuesChange(draft);
    onSearchChange('');
    setOpen(false);
  };

  const selectAllOrClear = () => {
    if (draft.length === 0) {
      setDraft(options.map((o) => o.value));
    } else {
      setDraft([]);
    }
  };

  return (
    <Popover {...(deferCommit ? { open, onOpenChange: handleOpenChange } : {})}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-multi-select-border bg-white px-4 py-2 text-sm font-medium text-multi-select-text shadow-multi-select-trigger cursor-pointer',
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
          {label ? <span className="shrink-0 text-multi-select-text-muted">{label}: </span> : null}
          {typeof triggerSummary === 'string' ? (
            <span className="truncate">{triggerSummary}</span>
          ) : (
            triggerSummary
          )}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-multi-select-icon" />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align={contentAlign}
        avoidCollisions={false}
        className={cn('w-full p-0 z-50', menuContentStyles, contentClassName)}
      >
        <div className="flex items-center gap-2 border-b border-multi-select-border px-3 py-2">
          <Search className="h-4 w-4 text-multi-select-text" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className="h-4 border-0 text-sm px-0 py-0 shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>

        <div className="max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <DropdownCheckItem
              key={option.value}
              label={option.label}
              checked={selected.has(option.value)}
              onSelect={() => toggle(option.value)}
            />
          ))}
          {filteredOptions.length === 0 && (
            <div className="px-2 py-2 text-sm text-multi-select-text-muted">{emptyLabel}</div>
          )}
        </div>

        {deferCommit ? (
          <div className="flex justify-end gap-2 border-t border-multi-select-border px-2 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-multi-select-border text-multi-select-text shadow-multi-select-trigger"
              onClick={selectAllOrClear}
            >
              {draft.length === 0 ? BULK_FILTERS_LABELS.selectAll : BULK_FILTERS_LABELS.clear}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={draft.length === 0}
              onClick={apply}
              className="bg-multi-select-accent hover:bg-filters-button-bg-hover"
            >
              {'Apply'}
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
