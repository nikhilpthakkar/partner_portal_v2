'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ShareChannelRow from '@/components/molecules/ShareChannelRow';

export type ShareChannel = {
  id: string;
  label: string;
  value: string;
  checked: boolean;
};

type Dependent = {
  id: string;
  name: string;
  subtitle?: string;
};

type DependentAccordionProps = {
  dependentRecipients: Dependent[];
  activeDependentMemberId?: string | null;
  onActiveChange?: (id: string | null) => void;
  dependentChannelsByMember?: Record<string, ShareChannel[]>;
  channels: ShareChannel[];
  onToggleChannel: (channelId: string, checked: boolean) => void;
  onDependentChannelsChange?: (memberId: string, channels: ShareChannel[]) => void;
  onChannelValueChange?: (channelId: string, value: string) => void;
  channelErrors?: Record<string, string>;
};

const FALLBACK_DEPENDENT: Dependent = {
  id: 'dependent-fallback',
  name: 'Dependent',
};

function getDependents(dependents: Dependent[]): Dependent[] {
  return dependents.length > 0 ? dependents : [FALLBACK_DEPENDENT];
}

function updateChannels(
  channels: ShareChannel[],
  channelId: string,
  checked: boolean,
): ShareChannel[] {
  return channels.map((item) => (item.id === channelId ? { ...item, checked } : item));
}

export default function DependentAccordion({
  dependentRecipients,
  activeDependentMemberId,
  onActiveChange,
  dependentChannelsByMember,
  channels,
  onToggleChannel,
  onDependentChannelsChange,
  onChannelValueChange,
  channelErrors,
}: DependentAccordionProps) {
  const dependents = getDependents(dependentRecipients);

  return (
    <Accordion
      type="single"
      value={activeDependentMemberId ?? undefined}
      onValueChange={(value) => onActiveChange?.(value || null)}
      className="flex w-full flex-col gap-3"
    >
      {dependents.map((dependent) => {
        const memberChannels = dependentChannelsByMember?.[dependent.id] ?? channels;

        return (
          <AccordionItem
            key={dependent.id}
            value={dependent.id}
            className="rounded-share-policy-panel h-fit px-4 border-share-policy-panel-border border"
          >
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">
                  {dependent.subtitle
                    ? `${dependent.name} (${dependent.subtitle})`
                    : dependent.name}
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="flex flex-col gap-4">
              {memberChannels.map((channel) => (
                <ShareChannelRow
                  key={channel.id}
                  label={channel.label}
                  value={channel.value}
                  checked={channel.checked}
                  editable={false}
                  itemClassName="gap-0"
                  error={channelErrors?.[channel.id]}
                  onCheckedChange={(checked) => {
                    // Fallback → use global toggle
                    if (dependent.id === FALLBACK_DEPENDENT.id) {
                      onToggleChannel(channel.id, checked);
                      return;
                    }

                    const updated = updateChannels(memberChannels, channel.id, checked);

                    onDependentChannelsChange?.(dependent.id, updated);
                  }}
                  onValueChange={
                    onChannelValueChange
                      ? (value) => onChannelValueChange(channel.id, value)
                      : undefined
                  }
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
