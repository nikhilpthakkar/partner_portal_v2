'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/lib/types/Global';

type SegmentedTabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  tabs: SelectOption[];
  className?: string;
  triggerClassName?: string;
};

export default function SegmentedTabs({
  value,
  onValueChange,
  tabs,
  className,
  triggerClassName,
}: SegmentedTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList
        className={cn(
          'rounded-segmented-tabs bg-segmented-tabs-bg p-segmented-tabs-padding flex w-full items-center',
          className,
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'cursor-pointer rounded-segmented-tab text-segmented-tab-text data-[state=active]:bg-segmented-tab-active-bg data-[state=active]:text-segmented-tab-active-text data-[state=active]:shadow-none flex-1 px-2 py-1 text-sm font-medium',
              triggerClassName,
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
