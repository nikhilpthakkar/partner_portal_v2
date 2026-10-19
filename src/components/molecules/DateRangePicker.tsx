'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DateRangePickerProps = {
  value: DateRange;
  onChange: (value: DateRange) => void;
  onClear?: () => void;
  showClear?: boolean;
  showReset?: boolean;
  resetLabel?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
};

export default function DateRangePicker({
  value,
  onChange,
  onClear,
  showClear = false,
  showReset = true,
  resetLabel = 'Reset',
  className,
  placeholder = 'Select dates',
  disabled,
  disabledDate,
}: DateRangePickerProps) {
  const [calendarKey, setCalendarKey] = useState(0);
  const hasSelectedDate = Boolean(value?.from || value?.to);

  const handleReset = () => {
    onChange({ from: undefined, to: undefined });
    onClear?.();
    setCalendarKey((currentKey) => currentKey + 1);
  };

  const getLabel = () => {
    if (!value?.from || !value?.to) return placeholder;

    if (isSameDay(value.from, value.to)) {
      return format(value.from, 'dd MMM yy');
    }

    if (
      isSameMonth(value.from, value.to) &&
      isSameDay(value.from, startOfMonth(value.from)) &&
      isSameDay(value.to, endOfMonth(value.to))
    ) {
      return format(value.from, 'MMMM yyyy');
    }

    return `${format(value.from, 'dd MMM yy')} - ${format(value.to, 'dd MMM yy')}`;
  };

  const label = getLabel();

  return (
    <Popover>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'h-9 w-full justify-start gap-2 border-date-range-border bg-white px-4 text-sm text-date-range-text shadow-date-range',
              showClear && hasSelectedDate && 'pr-10',
              !hasSelectedDate && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        {showClear && hasSelectedDate ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label="Clear selected dates"
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 bg-muted hover:bg-muted/80"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleReset();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <PopoverContent side="bottom" align="end" className="w-auto p-0">
        <Calendar
          key={calendarKey}
          mode="range"
          defaultMonth={value?.from}
          selected={hasSelectedDate ? value : undefined}
          onSelect={(nextRange) =>
            onChange(nextRange ?? { from: undefined, to: undefined })
          }
          numberOfMonths={2}
          showOutsideDays={false}
          disabled={(date) =>
            date > new Date() || date < new Date('1900-01-01') || Boolean(disabledDate?.(date))
          }
          required={false}
        />
        {showReset ? (
          <div className="flex justify-start border-t border-date-range-border px-3 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || !hasSelectedDate}
              className="h-8 border-date-range-border px-3 text-sm font-medium text-date-range-text shadow-date-range"
              onClick={handleReset}
            >
              {resetLabel}
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
