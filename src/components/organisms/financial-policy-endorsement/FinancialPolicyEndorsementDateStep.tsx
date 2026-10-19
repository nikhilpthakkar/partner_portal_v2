import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarView } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FINANCIAL_POLICY_ENDORSEMENT_HEADER } from '@/lib/constants/policyEndorsement.constants';
import { formatPolicyDateRange, getPolicyDateOnlyTime } from '@/lib/utils/policyDate.utils';

type FinancialPolicyEndorsementDateStepProps = {
  endorsementType: string;
  selectedDate?: Date;
  minSelectableDate?: Date;
  maxSelectableDate?: Date;
  allowedRangeFromDate?: string;
  allowedRangeToDate?: string;
  dateError?: string;
  onSelectDate: (date: Date | undefined) => void;
};

export const FinancialPolicyEndorsementDateStep = ({
  endorsementType,
  selectedDate,
  minSelectableDate,
  maxSelectableDate,
  allowedRangeFromDate,
  allowedRangeToDate,
  dateError,
  onSelectDate,
}: FinancialPolicyEndorsementDateStepProps) => {
  const selectDateLabel = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Pick a date';
  const dateTitle =
    FINANCIAL_POLICY_ENDORSEMENT_HEADER[
      endorsementType as keyof typeof FINANCIAL_POLICY_ENDORSEMENT_HEADER
    ]?.dateTitle ?? 'Select date';
  const allowedRangeLabel = getAllowedRangeLabel(allowedRangeFromDate, allowedRangeToDate);
  const calendarDefaultMonth = selectedDate ?? minSelectableDate ?? new Date();
  const fromYear = minSelectableDate?.getFullYear();
  const toYear = maxSelectableDate?.getFullYear();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-endorse-policy-text text-sm font-medium leading-none">{`Step 1 of 3: ${dateTitle}`}</p>
      {allowedRangeLabel ? (
        <div className="rounded-endorse-policy-notice border border-yellow-200 bg-endorse-policy-notice-bg px-4 py-3">
          <p className="text-endorse-policy-notice-text text-xs leading-none">
            {`Allowed range: ${allowedRangeLabel}`}
          </p>
        </div>
      ) : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full max-w-sm justify-start gap-2 border-endorse-policy-border bg-white px-4 text-sm font-normal shadow-xs"
          >
            <Calendar className="h-4 w-4" />
            <span>{selectDateLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-auto p-0">
          <CalendarView
            mode="single"
            selected={selectedDate}
            defaultMonth={calendarDefaultMonth}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            onSelect={onSelectDate}
            disabled={(date) => {
              const selectedDateTime = getPolicyDateOnlyTime(date);
              const minDateTime = minSelectableDate
                ? getPolicyDateOnlyTime(minSelectableDate)
                : undefined;
              const maxDateTime = maxSelectableDate
                ? getPolicyDateOnlyTime(maxSelectableDate)
                : undefined;

              return (
                (minDateTime !== undefined && selectedDateTime < minDateTime) ||
                (maxDateTime !== undefined && selectedDateTime > maxDateTime)
              );
            }}
            required
          />
        </PopoverContent>
      </Popover>
      {dateError ? <p className="text-destructive text-xs leading-none">{dateError}</p> : null}
    </div>
  );
};

const getAllowedRangeLabel = (fromDate?: string, toDate?: string) => {
  if (!fromDate || !toDate) {
    return '';
  }

  return formatPolicyDateRange(fromDate, toDate);
};
