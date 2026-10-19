'use client';

import SimpleSelect from '@/components/molecules/SimpleSelect';
import { groupByOptions } from '@/lib/constants/overview.constants';
import type { SelectOption } from '@/lib/types/Global';
import type { GroupBy } from '@/lib/types/overview';
import { cn } from '@/lib/utils';

type ChartGroupBySelectProps = {
  value: GroupBy;
  onValueChange: (value: GroupBy) => void;
  options?: SelectOption[];
  className?: string;
  disabled?: boolean;
};

export default function ChartGroupBySelect({
  value,
  onValueChange,
  options = groupByOptions,
  className,
  disabled,
}: ChartGroupBySelectProps) {
  return (
    <SimpleSelect
      value={value}
      options={options}
      onValueChange={(nextValue) => onValueChange(nextValue as GroupBy)}
      className={cn('w-fit min-w-[7.5rem]', className)}
      disabled={disabled}
    />
  );
}
