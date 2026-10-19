'use client';

import { ChevronDownIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type GeoDistributionRegionFilterSelectProps = {
  presetLabel: string;
  emptySelectionLabel: string;
  isPresetActive: boolean;
  selectedItems: string[];
  itemOptions: string[];
  onPresetChange: (enabled: boolean) => void;
  onSelectedItemsChange: (items: string[]) => void;
  formatItemLabel?: (item: string) => string;
  disabled?: boolean;
  className?: string;
};

export default function GeoDistributionRegionFilterSelect({
  presetLabel,
  emptySelectionLabel,
  isPresetActive,
  selectedItems,
  itemOptions,
  onPresetChange,
  onSelectedItemsChange,
  formatItemLabel = (item) => item,
  disabled,
  className,
}: GeoDistributionRegionFilterSelectProps) {
  const triggerLabel = isPresetActive
    ? presetLabel
    : selectedItems.length === 0
      ? emptySelectionLabel
      : selectedItems.length === 1
        ? formatItemLabel(selectedItems[0])
        : `${formatItemLabel(selectedItems[0])} +${selectedItems.length - 1}`;

  const handlePresetToggle = () => {
    if (isPresetActive) {
      onPresetChange(false);
      if (selectedItems.length === 0 && itemOptions.length > 0) {
        onSelectedItemsChange([itemOptions[0]]);
      }
      return;
    }

    onPresetChange(true);
    onSelectedItemsChange([]);
  };

  const handleItemToggle = (item: string) => {
    if (isPresetActive) {
      onPresetChange(false);
      onSelectedItemsChange([item]);
      return;
    }

    const isSelected = selectedItems.includes(item);

    if (isSelected) {
      const nextItems = selectedItems.filter((entry) => entry !== item);
      if (nextItems.length === 0) {
        onPresetChange(true);
        onSelectedItemsChange([]);
        return;
      }

      onSelectedItemsChange(nextItems);
      return;
    }

    onSelectedItemsChange([...selectedItems, item]);
  };

  return (
    <Popover modal={false}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          'flex h-9 min-w-[140px] cursor-pointer items-center justify-between gap-2 rounded-md border border-simple-select-border bg-white px-4 py-2 text-sm font-medium text-simple-select-text shadow-simple-select-trigger',
          className,
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDownIcon className="size-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto min-w-[220px] rounded-md border border-[#e5e5e5] bg-white p-1 shadow-md"
      >
        <div className="flex flex-col">
          <button
            type="button"
            onClick={handlePresetToggle}
            className={cn(
              'relative flex w-full items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-sm leading-5',
              isPresetActive
                ? 'bg-[#f5f3ff] text-[#8b5cf6]'
                : 'text-[#0a0a0a] hover:bg-muted/50',
            )}
          >
            <Checkbox
              checked={isPresetActive}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2"
              tabIndex={-1}
              aria-hidden
            />
            {presetLabel}
          </button>

          {itemOptions.map((item) => {
            const isSelected = !isPresetActive && selectedItems.includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => handleItemToggle(item)}
                className={cn(
                  'relative flex w-full items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-sm leading-5 text-[#0a0a0a] hover:bg-muted/50',
                  isSelected && 'bg-[#f5f3ff] text-[#8b5cf6]',
                )}
              >
                <Checkbox
                  checked={isSelected}
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                  aria-hidden
                />
                {formatItemLabel(item)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
