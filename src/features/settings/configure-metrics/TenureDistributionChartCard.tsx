'use client';

import { Check, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import SegmentedTabs from '@/components/molecules/SegmentedTabs';
import InlineFormErrorBanner from '@/components/molecules/InlineFormErrorBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  TENURE_DISTRIBUTION_DURATION_TABS,
  TENURE_DISTRIBUTION_MAX_RANGES,
} from '@/lib/constants/tenureDistribution.constants';
import type {
  TenureDistributionDurationUnit,
  TenureDistributionRange,
  TenureDistributionSettings,
} from '@/lib/types/overview/tenureDistribution';
import {
  getTenureDistributionValidationErrorMessage,
  getTenureDurationLabel,
  hasTenureDistributionMissingRangeError,
  hasTenureDistributionValidationErrors,
  isTenureMonthlyValueOutOfBounds,
  isTenureRangeComplete,
  isTenureRangeInvalid,
  parseTenureInputValue,
} from '@/lib/types/overview/tenureDistribution';
import { cn } from '@/lib/utils';

type TenureDistributionChartCardProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  settings: TenureDistributionSettings;
  onSettingsChange: (settings: TenureDistributionSettings) => void;
  disabled?: boolean;
  className?: string;
  validateOnSave?: boolean;
};

const TABLE_COLUMNS = ['From', 'To', 'Duration', 'Actions'] as const;

export default function TenureDistributionChartCard({
  checked,
  onCheckedChange,
  settings,
  onSettingsChange,
  disabled = false,
  className,
  validateOnSave = false,
}: TenureDistributionChartCardProps) {
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const durationLabel = getTenureDurationLabel(settings.duration_unit);
  const hasMissingRangeError = hasTenureDistributionMissingRangeError(settings);
  const validationErrorMessage = getTenureDistributionValidationErrorMessage(settings);
  const hasValidationErrors = hasTenureDistributionValidationErrors(settings);
  const shouldShowValidation = showValidation || validateOnSave;
  const shouldShowErrorBanner = shouldShowValidation && hasValidationErrors;

  const updateRange = (index: number, patch: Partial<TenureDistributionRange>) => {
    onSettingsChange({
      ...settings,
      ranges: settings.ranges.map((range, rangeIndex) => {
        if (rangeIndex === index) {
          return { ...range, ...patch };
        }

        if (patch.to !== undefined && rangeIndex === index + 1) {
          return { ...range, from: patch.to };
        }

        return range;
      }),
    });
  };

  const handleDurationChange = (value: string) => {
    onSettingsChange({
      ...settings,
      duration_unit: value as TenureDistributionDurationUnit,
    });
  };

  const handleAddRange = () => {
    if (settings.ranges.length >= TENURE_DISTRIBUTION_MAX_RANGES) {
      return;
    }

    const previousRange = settings.ranges[settings.ranges.length - 1];

    onSettingsChange({
      ...settings,
      ranges: [...settings.ranges, { from: previousRange?.to ?? null, to: null }],
    });
    setPendingDeleteIndex(null);
    setFocusedRowIndex(settings.ranges.length);
  };

  const handleRequestDeleteRange = (index: number) => {
    if (settings.ranges.length <= 1) {
      return;
    }

    setPendingDeleteIndex(index);
    setFocusedRowIndex(null);
  };

  const handleCancelDeleteRange = () => {
    setPendingDeleteIndex(null);
  };

  const handleConfirmDeleteRange = (index: number) => {
    if (settings.ranges.length <= 1) {
      return;
    }

    onSettingsChange({
      ...settings,
      ranges: settings.ranges.filter((_, rangeIndex) => rangeIndex !== index),
    });
    setPendingDeleteIndex(null);
    setFocusedRowIndex((current) => {
      if (current === null) {
        return null;
      }
      if (current === index) {
        return null;
      }
      return current > index ? current - 1 : current;
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border border-border bg-card px-4 py-3',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-sm font-medium leading-none text-foreground">
            Policies by tenure distribution
          </p>
          <p className="text-sm text-muted-foreground">
            Define tenure ranges. Data will be grouped into these buckets on the chart (Max 5
            ranges)
          </p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-label="Policies by tenure distribution"
        />
      </div>

      {checked ? (
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Select the duration</span>
            <SegmentedTabs
              value={settings.duration_unit}
              onValueChange={handleDurationChange}
              tabs={[...TENURE_DISTRIBUTION_DURATION_TABS]}
              className="max-w-[240px]"
            />
          </div>

          {shouldShowErrorBanner && validationErrorMessage ? (
            <InlineFormErrorBanner message={validationErrorMessage} />
          ) : null}

          <div className="overflow-hidden rounded-md border border-border">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px]">
              {TABLE_COLUMNS.map((column) => (
                <div
                  key={column}
                  className="flex h-10 items-center border-b border-border bg-tenure-distribution-table-header-bg px-4 text-xs font-medium text-muted-foreground"
                >
                  {column}
                </div>
              ))}

              {settings.ranges.map((range, index) => {
                const isRowInvalid = isTenureRangeInvalid(range.from, range.to);
                const isFromOutOfBounds =
                  settings.duration_unit === 'monthly' &&
                  isTenureMonthlyValueOutOfBounds(range.from);
                const isToOutOfBounds =
                  settings.duration_unit === 'monthly' &&
                  isTenureMonthlyValueOutOfBounds(range.to);
                const isRowIncomplete =
                  hasMissingRangeError && !isTenureRangeComplete(range.from, range.to);
                const shouldHighlightFrom =
                  shouldShowValidation &&
                  (isFromOutOfBounds ||
                    (isRowIncomplete && range.from === null) ||
                    (isRowInvalid && range.from !== null && range.to !== null));
                const shouldHighlightTo =
                  shouldShowValidation &&
                  (isToOutOfBounds ||
                    (isRowIncomplete && range.to === null) ||
                    (isRowInvalid && range.from !== null && range.to !== null));
                const isActiveRow = focusedRowIndex === index;
                const isPendingDelete = pendingDeleteIndex === index;
                const rowBackgroundClass = isPendingDelete
                  ? 'bg-tenure-distribution-row-pending-delete'
                  : isActiveRow
                    ? 'bg-tenure-distribution-row-active'
                    : undefined;

                return (
                  <div key={`tenure-range-row-${index}`} className="contents">
                    <div
                      className={cn(
                        'flex min-h-[42px] items-center border-b border-border px-4 py-2',
                        rowBackgroundClass,
                      )}
                    >
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={range.from ?? ''}
                        onChange={(event) =>
                          updateRange(index, { from: parseTenureInputValue(event.target.value) })
                        }
                        onFocus={() => {
                          setFocusedRowIndex(index);
                          setPendingDeleteIndex(null);
                        }}
                        onBlur={() => {
                          setFocusedRowIndex((current) => (current === index ? null : current));
                          setShowValidation(true);
                        }}
                        disabled={disabled || isPendingDelete}
                        aria-invalid={shouldHighlightFrom}
                        className={cn(
                          'h-8 shadow-xs',
                          shouldHighlightFrom &&
                            'border-destructive ring-[3px] ring-destructive/20',
                        )}
                      />
                    </div>
                    <div
                      className={cn(
                        'flex min-h-[42px] items-center border-b border-border px-4 py-2',
                        rowBackgroundClass,
                      )}
                    >
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={range.to ?? ''}
                        onChange={(event) =>
                          updateRange(index, { to: parseTenureInputValue(event.target.value) })
                        }
                        onFocus={() => {
                          setFocusedRowIndex(index);
                          setPendingDeleteIndex(null);
                        }}
                        onBlur={() => {
                          setFocusedRowIndex((current) => (current === index ? null : current));
                          setShowValidation(true);
                        }}
                        disabled={disabled || isPendingDelete}
                        aria-invalid={shouldHighlightTo}
                        className={cn(
                          'h-8 shadow-xs',
                          shouldHighlightTo &&
                            'border-destructive ring-[3px] ring-destructive/20',
                        )}
                      />
                    </div>
                    <div
                      className={cn(
                        'flex min-h-[42px] items-center border-b border-border px-4 py-2 text-sm text-foreground',
                        rowBackgroundClass,
                      )}
                    >
                      {durationLabel}
                    </div>
                    <div
                      className={cn(
                        'flex min-h-[42px] items-center justify-center gap-1 border-b border-border p-2',
                        rowBackgroundClass,
                      )}
                    >
                      {isPendingDelete ? (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelDeleteRange}
                            disabled={disabled}
                            aria-label={`Cancel delete range ${index + 1}`}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleConfirmDeleteRange(index)}
                            disabled={disabled}
                            aria-label={`Confirm delete range ${index + 1}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Check className="size-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRequestDeleteRange(index)}
                          disabled={disabled || settings.ranges.length <= 1}
                          aria-label={`Delete range ${index + 1}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddRange}
                disabled={disabled || settings.ranges.length >= TENURE_DISTRIBUTION_MAX_RANGES}
                className="box-border flex !h-8 !min-h-8 w-full shrink-0 items-center justify-center gap-1.5 self-stretch !rounded-none !rounded-b-md border-0 bg-tenure-distribution-add-range-button-bg px-3 py-1.5 !text-xs font-medium leading-4 text-tenure-distribution-add-range-button-text shadow-xs hover:bg-tenure-distribution-add-range-button-bg/90 disabled:text-muted-foreground"
              >
                <Plus className="size-4" />
                Add range
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
