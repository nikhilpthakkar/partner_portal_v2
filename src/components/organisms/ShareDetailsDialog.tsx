'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { OTHERS_RECIPIENT_ID } from '@/lib/adapter/policy-share/policyShare.adapter';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import ShareRecipientCard from '@/components/molecules/ShareRecipientCard';
import ShareChannelRow from '@/components/molecules/ShareChannelRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PolicyShareSkelton from '../molecules/skeltons/PolicyShareSkelton';
import DependentAccordion from '../molecules/DependentAccordian';
import { useEffect, useRef } from 'react';

type ShareRecipient = {
  id: string;
  title: string;
  subtitle?: string;
  members?: {
    id: string;
    name: string;
    subtitle?: string;
    email: string;
    whatsapp: string;
    sms: string;
  }[];
};

type ShareChannel = {
  id: string;
  label: string;
  value: string;
  checked: boolean;
};

type ShareDetailsSearch = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

type ShareDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  descriptionHighlight?: string;
  claimBannerText?: string;
  search?: ShareDetailsSearch;
  summary?: string;
  recipients: ShareRecipient[];
  selectedRecipientId: string;
  onSelectRecipient: (id: string) => void;
  channels: ShareChannel[];
  onChannelsChange: (channels: ShareChannel[]) => void;
  dependentChannelsByMember?: Record<string, ShareChannel[]>;
  onDependentChannelsChange?: (memberId: string, channels: ShareChannel[]) => void;
  activeDependentMemberId?: string | null;
  onDependentActiveMemberChange?: (memberId: string | null) => void;
  onChannelValueChange?: (channelId: string, value: string) => void;
  showOtherRecipientNameInput?: boolean;
  otherRecipientName?: string;
  onOtherRecipientNameChange?: (value: string) => void;
  channelErrors?: Record<string, string>;
  cancelLabel: string;
  shareLabel: string;
  onCancel: () => void;
  onShare: () => void;
  canShare?: boolean;
  showCloseButton?: boolean;
  loading?: boolean;
  className?: string;
  sendSegmentEvent: () => void;
};

export default function ShareDetailsDialog({
  open,
  onOpenChange,
  title,
  description,
  descriptionHighlight,
  claimBannerText,
  search,
  summary,
  recipients,
  selectedRecipientId,
  onSelectRecipient,
  channels,
  onChannelsChange,
  dependentChannelsByMember,
  onDependentChannelsChange,
  activeDependentMemberId,
  onDependentActiveMemberChange,
  onChannelValueChange,
  showOtherRecipientNameInput = false,
  otherRecipientName = '',
  onOtherRecipientNameChange,
  channelErrors,
  loading = false,
  cancelLabel,
  shareLabel,
  onCancel,
  onShare,
  canShare,
  showCloseButton = false,
  className,
  sendSegmentEvent,
}: ShareDetailsDialogProps) {
  const handleToggleChannel = (id: string, checked: boolean) => {
    onChannelsChange(
      channels.map((channel) => (channel.id === id ? { ...channel, checked } : channel)),
    );
  };

  const hasSearchSection = Boolean(search || summary);
  const hasClaimBanner = Boolean(claimBannerText?.trim());
  const shouldShowDependentAccordion = selectedRecipientId === 'DEPENDENT';
  const hasSelectedChannel = canShare ?? false;
  const selectedRecipient = recipients.find((recipient) => recipient.id === selectedRecipientId);
  const dependentRecipients =
    selectedRecipientId === 'DEPENDENT' ? (selectedRecipient?.members ?? []) : [];

  const sendSegmentEventRef = useRef(sendSegmentEvent);
  sendSegmentEventRef.current = sendSegmentEvent;

  useEffect(() => {
    if (open) {
      sendSegmentEventRef.current();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          'max-w-3xl mx-auto border-share-policy-border rounded-share-policy-card flex w-full flex-col gap-6 border bg-white p-6 shadow-share-policy-card',
          className,
        )}
      >
        <DialogTitle className="flex flex-col gap-1.5">
          <p className="text-share-policy-text text-lg font-semibold leading-none">{title}</p>
          {description && (
            <p className="text-share-policy-muted text-sm">
              {description}{' '}
              {descriptionHighlight && (
                <span className="text-share-policy-text">{descriptionHighlight}</span>
              )}
            </p>
          )}
        </DialogTitle>
        {hasClaimBanner && (
          <div
            role="status"
            className="flex gap-3 rounded-share-policy-info border border-share-policy-info-border bg-share-policy-info-bg p-4"
          >
            <p className="text-share-policy-info-text text-xs leading-5">{claimBannerText}</p>
          </div>
        )}
        {hasSearchSection && !loading && (
          <div className="flex flex-col gap-4">
            {search && (
              <div className="relative">
                <Search className="text-share-policy-muted absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={search.value}
                  onChange={(event) => search.onChange(event.target.value)}
                  placeholder={search.placeholder}
                  className="border-share-policy-border h-12 bg-white pr-10 rounded-md text-sm text-share-policy-text shadow-policy-search"
                />
              </div>
            )}
            {summary && (
              <div className="border-share-policy-border text-share-policy-text rounded-md border bg-muted px-4 py-3 text-sm font-medium">
                {summary}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
            {loading ? (
              <PolicyShareSkelton rowCount={3} columnCount={3} />
            ) : (
              <>
                <RecipientList
                  recipients={recipients}
                  selectedRecipientId={selectedRecipientId}
                  onSelectRecipient={onSelectRecipient}
                />
                {!shouldShowDependentAccordion ? (
                  <ChannelPanel
                    channels={channels}
                    selectedRecipientId={selectedRecipientId}
                    onToggle={handleToggleChannel}
                    onChannelValueChange={onChannelValueChange}
                    showOtherRecipientNameInput={showOtherRecipientNameInput}
                    otherRecipientName={otherRecipientName}
                    onOtherRecipientNameChange={onOtherRecipientNameChange}
                    channelErrors={channelErrors}
                  />
                ) : (
                  <DependentAccordion
                    dependentRecipients={dependentRecipients}
                    activeDependentMemberId={activeDependentMemberId}
                    onActiveChange={onDependentActiveMemberChange}
                    dependentChannelsByMember={dependentChannelsByMember}
                    channels={channels}
                    onToggleChannel={handleToggleChannel}
                    onDependentChannelsChange={onDependentChannelsChange}
                    onChannelValueChange={onChannelValueChange}
                    channelErrors={channelErrors}
                  />
                )}
              </>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 pt-3.5">
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              onClick={onShare}
              disabled={loading || !hasSelectedChannel}
              className="bg-share-policy-primary text-share-policy-primary-text hover:bg-share-policy-primary-hover"
            >
              {shareLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type RecipientListProps = {
  recipients: ShareRecipient[];
  selectedRecipientId: string;
  onSelectRecipient: (id: string) => void;
};

function RecipientList({ recipients, selectedRecipientId, onSelectRecipient }: RecipientListProps) {
  return (
    <div className="flex flex-col gap-3">
      {recipients.map((recipient) => (
        <ShareRecipientCard
          key={recipient.id}
          title={recipient.title}
          subtitle={recipient.subtitle}
          selected={recipient.id === selectedRecipientId}
          onClick={() => onSelectRecipient(recipient.id)}
        />
      ))}
    </div>
  );
}

type ChannelPanelProps = {
  channels: ShareChannel[];
  selectedRecipientId: string;
  onToggle: (id: string, checked: boolean) => void;
  onChannelValueChange?: (channelId: string, value: string) => void;
  showOtherRecipientNameInput: boolean;
  otherRecipientName: string;
  onOtherRecipientNameChange?: (value: string) => void;
  channelErrors?: Record<string, string>;
};

function ChannelPanel({
  channels,
  selectedRecipientId,
  onToggle,
  onChannelValueChange,
  showOtherRecipientNameInput,
  otherRecipientName,
  onOtherRecipientNameChange,
  channelErrors,
}: ChannelPanelProps) {
  const nameError = channelErrors?.name;

  return (
    <div className="rounded-share-policy-panel border-share-policy-panel-border border h-fit p-4">
      <div className="flex flex-col gap-4">
        {showOtherRecipientNameInput && selectedRecipientId === OTHERS_RECIPIENT_ID ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-share-policy-text text-sm font-medium">Name</p>
            <Input
              value={otherRecipientName}
              onChange={(event) => onOtherRecipientNameChange?.(event.target.value)}
              placeholder="Enter recipient name"
              className={cn(
                'border-share-policy-border h-9 rounded-md bg-white text-sm text-share-policy-text',
                nameError ? 'border-destructive' : '',
              )}
            />
            {nameError ? (
              <p className="text-destructive text-xs font-medium" role="alert">
                {nameError}
              </p>
            ) : null}
          </div>
        ) : null}
        {channels.map((channel) => (
          <ShareChannelRow
            key={channel.id}
            label={channel.label}
            value={channel.value}
            checked={channel.checked}
            onCheckedChange={(checked) => onToggle(channel.id, checked)}
            editable={selectedRecipientId === OTHERS_RECIPIENT_ID}
            onValueChange={
              onChannelValueChange ? (value) => onChannelValueChange(channel.id, value) : undefined
            }
            error={channelErrors?.[channel.id]}
          />
        ))}
      </div>
    </div>
  );
}
