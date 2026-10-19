'use client';

import { useEffect, useId, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SelectOptionGroup } from '@/lib/types/Global';
import { cn } from '@/lib/utils';

function findOptionLabel(groups: SelectOptionGroup[], value: string): string {
  for (const group of groups) {
    const match = group.options.find((option) => option.value === value);
    if (match) {
      return match.label;
    }
  }
  return '';
}

function findGroupIndexForValue(groups: SelectOptionGroup[], value: string): number {
  const idx = groups.findIndex((group) => group.options.some((option) => option.value === value));
  return idx >= 0 ? idx : 0;
}

const triggerClass =
  'text-policy-bulk-upload-text border-policy-bulk-upload-border bg-policy-bulk-upload-panel-bg flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm font-medium shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-policy-bulk-upload-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0';

const contentSurfaceClass =
  'rounded-md border border-policy-bulk-upload-border bg-policy-bulk-upload-panel-bg shadow-policy-bulk-upload-card';

const leafItemClass =
  'flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-sm text-policy-bulk-upload-text outline-none hover:bg-simple-select-accent-bg hover:text-simple-select-accent focus-visible:bg-simple-select-accent-bg focus-visible:text-simple-select-accent focus-visible:ring-2 focus-visible:ring-policy-bulk-upload-primary focus-visible:ring-offset-1';

const sectionLabelClass = 'px-2 py-1.5 text-xs font-medium text-policy-bulk-upload-muted';

export type PolicyBulkActionTypeSelectVariant = 'grouped' | 'cascade';

type PolicyBulkActionTypeSelectProps = {
  value: string;
  groups: SelectOptionGroup[];
  onValueChange: (value: string) => void;
  variant: PolicyBulkActionTypeSelectVariant;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function PolicyBulkActionTypeSelect({
  value,
  groups,
  onValueChange,
  variant,
  placeholder = 'Select action type',
  disabled,
  className,
}: PolicyBulkActionTypeSelectProps) {
  const displayLabel = value ? findOptionLabel(groups, value) : '';
  const subPanelId = useId();

  const [cascadeOpen, setCascadeOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [revealSecondary, setRevealSecondary] = useState(false);

  useEffect(() => {
    if (!cascadeOpen) {
      return;
    }
    const idx = findGroupIndexForValue(groups, value);
    setActiveGroupIndex(idx);
    const group = groups[idx];
    const isMulti = (group?.options.length ?? 0) > 1;
    const valueInActiveMulti =
      Boolean(value) && isMulti && Boolean(group?.options.some((option) => option.value === value));
    setRevealSecondary(valueInActiveMulti);
  }, [cascadeOpen, value, groups]);

  if (variant === 'grouped') {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(triggerClass, className)} size="default">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className={cn(contentSurfaceClass, 'z-50 max-h-72 min-w-(--radix-select-trigger-width)')}
        >
          {groups.map((group) => (
            <SelectGroup key={group.groupLabel}>
              <SelectLabel className={sectionLabelClass}>{group.groupLabel}</SelectLabel>
              {group.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'cursor-pointer rounded-md px-2 py-1.5 text-sm text-policy-bulk-upload-text focus:bg-simple-select-accent-bg focus:text-simple-select-accent data-[highlighted]:bg-simple-select-accent-bg data-[highlighted]:text-simple-select-accent outline-none',
                    '[&_span[data-slot=select-item-indicator]]:flex [&_span[data-slot=select-item-indicator]]:items-center',
                  )}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const activeGroup = groups[activeGroupIndex] ?? groups[0];
  const activeGroupIsMulti = (activeGroup?.options.length ?? 0) > 1;
  const showSecondary = activeGroupIsMulti && revealSecondary;

  const handlePrimaryClick = (group: (typeof groups)[number], index: number) => {
    if (group.options.length === 1) {
      onValueChange(group.options[0].value);
      setCascadeOpen(false);
      return;
    }
    setActiveGroupIndex(index);
    setRevealSecondary(true);
  };

  return (
    <Popover open={cascadeOpen} onOpenChange={setCascadeOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(triggerClass, className)}
          aria-label={placeholder}
          aria-haspopup="dialog"
          aria-expanded={cascadeOpen}
        >
          <span
            className={cn(
              'cursor-pointer min-w-0 flex-1 truncate',
              !displayLabel && 'text-policy-bulk-upload-muted',
            )}
          >
            {displayLabel || placeholder}
          </span>
          <ChevronDown className="size-4 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className={cn(
          contentSurfaceClass,
          'z-50 w-auto max-w-none border p-0 shadow-policy-bulk-upload-card',
        )}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className={cn('flex flex-row', showSecondary && 'min-h-32')}>
          <div
            role="menu"
            aria-label="Action categories"
            className={cn('flex flex-col p-2', showSecondary ? 'min-w-44' : 'min-w-52')}
          >
            {groups.map((group, index) => {
              const isMulti = group.options.length > 1;
              const isActivePrimary = index === activeGroupIndex;
              return (
                <button
                  key={group.groupLabel}
                  type="button"
                  role="menuitem"
                  aria-current={isActivePrimary && isMulti && showSecondary ? 'true' : undefined}
                  aria-controls={isMulti ? subPanelId : undefined}
                  className={cn(
                    'w-width-200 cursor-pointer flex hover:bg-muted rounded-md items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-policy-bulk-upload-text outline-none',
                    'focus-visible:bg-muted',
                    isActivePrimary && isMulti && showSecondary && 'bg-muted',
                  )}
                  onClick={() => handlePrimaryClick(group, index)}
                >
                  <span className="min-w-0 truncate">{group.groupLabel}</span>
                  {isMulti ? (
                    <ChevronRight
                      className="size-4 shrink-0 text-policy-bulk-upload-muted"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          {showSecondary ? (
            <div
              id={subPanelId}
              role="menu"
              aria-label={activeGroup ? `${activeGroup.groupLabel} actions` : 'Actions'}
              className="flex min-w-52 flex-col border-l border-policy-bulk-upload-border p-2"
            >
              {(activeGroup?.options ?? []).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="menuitem"
                  className={cn(
                    leafItemClass,
                    value === option.value &&
                      'bg-simple-select-accent-bg text-simple-select-accent',
                  )}
                  onClick={() => {
                    onValueChange(option.value);
                    setCascadeOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
