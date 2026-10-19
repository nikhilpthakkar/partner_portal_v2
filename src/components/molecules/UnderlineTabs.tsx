'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/lib/types/Global';

type UnderlineTabsVariant = 'default' | 'line';

type UnderlineTabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  tabs: SelectOption[];
  className?: string;
  variant?: UnderlineTabsVariant;
};

const tabsListVariantClass: Record<UnderlineTabsVariant, string> = {
  default: 'flex w-full items-center justify-start gap-2 rounded-none bg-white px-2',
  line: 'inline-flex h-auto items-center justify-start gap-0 rounded-none bg-transparent p-0 shadow-none',
};

const tabsTriggerVariantClass: Record<UnderlineTabsVariant, string> = {
  default:
    'cursor-pointer rounded-none border-b-3 border-transparent py-2 text-md font-normal text-underline-tabs-text text-sm data-[state=active]:border-underline-tabs-border data-[state=active]:text-underline-tabs-active data-[state=active]:shadow-none',
  line:
    'h-auto cursor-pointer rounded-none border-b-2 border-transparent bg-transparent px-2 py-2 text-xs font-medium leading-none text-underline-tabs-text shadow-none data-[state=active]:border-underline-tabs-active data-[state=active]:bg-transparent data-[state=active]:text-underline-tabs-active data-[state=active]:shadow-none',
};

export default function UnderlineTabs({
  value,
  onValueChange,
  tabs,
  className,
  variant = 'default',
}: UnderlineTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className={cn(tabsListVariantClass[variant], className)}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={tabsTriggerVariantClass[variant]}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
