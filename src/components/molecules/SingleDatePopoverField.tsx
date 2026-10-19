'use client';

import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import type { Matcher } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarPrimitive } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const DEFAULT_DISPLAY_FORMAT = 'dd/MM/yyyy';
const DEFAULT_PLACEHOLDER = 'Pick a date';

export type SingleDatePopoverFieldProps = {
  triggerId: string;
  label: ReactNode;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  /** date-fns pattern for the trigger text when `selected` is set */
  displayFormat?: string;
  captionLayout?: ComponentProps<typeof CalendarPrimitive>['captionLayout'];
  fromYear?: number;
  toYear?: number;
  defaultMonth?: Date;
  disabled?: Matcher | Matcher[];
  /** Passed to the calendar when the field is required in the form */
  calendarRequired?: boolean;
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
  popoverAlign?: 'start' | 'center' | 'end';
  required?: boolean;
};

export function SingleDatePopoverField({
  triggerId,
  label,
  selected,
  onSelect,
  placeholder = DEFAULT_PLACEHOLDER,
  displayFormat = DEFAULT_DISPLAY_FORMAT,
  captionLayout = 'dropdown',
  fromYear,
  toYear,
  defaultMonth,
  disabled,
  calendarRequired,
  className,
  triggerClassName,
  labelClassName,
  popoverAlign = 'end',
  required,
}: SingleDatePopoverFieldProps) {
  const resolvedDefaultMonth = defaultMonth ?? selected ?? new Date();
  const triggerLabel = selected ? format(selected, displayFormat) : placeholder;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label
        htmlFor={triggerId}
        className={cn('text-sm font-medium leading-none text-pagination-text', labelClassName)}
      >
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={triggerId}
            type="button"
            variant="outline"
            className={cn(
              'h-9 w-full justify-start gap-2 border-pagination-border bg-white px-4 text-sm font-normal shadow-xs',
              triggerClassName,
            )}
            aria-required={required}
          >
            <Calendar className="size-4 shrink-0" aria-hidden />
            <span className={cn(!selected ? 'text-pagination-text-muted ' : '')}>
              {triggerLabel}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align={popoverAlign} className="w-auto p-0">
          <CalendarPrimitive
            mode="single"
            selected={selected}
            defaultMonth={resolvedDefaultMonth}
            captionLayout={captionLayout}
            {...(fromYear !== undefined ? { fromYear } : {})}
            {...(toYear !== undefined ? { toYear } : {})}
            onSelect={onSelect}
            disabled={disabled}
            required={calendarRequired}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
