import { useMemo, useState } from 'react';
import type { PolicyShareChannel } from '@/lib/types/policy-management';
import {
  DEFAULT_OTHERS_CHANNEL_VALUES,
  OTHERS_RECIPIENT_ID,
  buildChannelsForOthers,
  buildChannelsFromRecipient,
  buildChannelsFromRecipientMember,
  buildOthersSharePayload,
  ensureOthersRecipient,
  mapRecipientsToSharePolicyRecipients,
  type OthersChannelValues,
} from '@/lib/adapter/policy-share/policyShare.adapter';
import { useClaimShareStore } from '@/lib/store/claimShare.store';
import {
  useClaimShareTriggerMutation,
  useGetAllClaimRecipientsQuery,
} from '@/lib/query/claimsDetail.queries';
import { isValidEmail, isValidIndianMobile, VALIDATION_MESSAGES } from '@/lib/utils/validation';

export function useClaimShareDialog() {
  const { claimNumber, openShareDialog, closeShareDialog } = useClaimShareStore();
  const { data: recipientsResponse, isLoading: isRecipientsLoading } =
    useGetAllClaimRecipientsQuery();
  const triggerShareMutation = useClaimShareTriggerMutation();

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareRecipientId, setShareRecipientId] = useState('');
  const [channelsByRecipient, setChannelsByRecipient] = useState<
    Record<string, PolicyShareChannel[]>
  >({});
  const [dependentChannelsByMember, setDependentChannelsByMember] = useState<
    Record<string, PolicyShareChannel[]>
  >({});
  const [activeDependentMemberId, setActiveDependentMemberId] = useState<string | null>(null);
  const [othersChannelValues, setOthersChannelValues] = useState<OthersChannelValues>(
    DEFAULT_OTHERS_CHANNEL_VALUES,
  );
  const [othersChannelErrors, setOthersChannelErrors] = useState<Record<string, string>>({});

  const apiRecipients = useMemo(() => recipientsResponse?.data ?? [], [recipientsResponse?.data]);
  const shareableApiRecipients = useMemo(
    () =>
      apiRecipients.filter((recipient) =>
        [recipient.email, recipient.whatsapp, recipient.sms].some((value) => Boolean(value)),
      ),
    [apiRecipients],
  );
  const recipients = useMemo(
    () => ensureOthersRecipient(mapRecipientsToSharePolicyRecipients(shareableApiRecipients)),
    [shareableApiRecipients],
  );

  const effectiveSelectedId = useMemo(() => {
    if (recipients.some((recipient) => recipient.id === shareRecipientId)) {
      return shareRecipientId;
    }

    return recipients[0]?.id ?? OTHERS_RECIPIENT_ID;
  }, [recipients, shareRecipientId]);

  const getChannelsForRecipient = (recipientId: string): PolicyShareChannel[] => {
    if (recipientId === 'DEPENDENT') {
      return [];
    }

    if (recipientId === OTHERS_RECIPIENT_ID) {
      const baseChannels = buildChannelsForOthers(othersChannelValues);
      const selectedChannels = channelsByRecipient[OTHERS_RECIPIENT_ID] ?? [];
      return baseChannels.map((channel) => {
        const selectedChannel = selectedChannels.find(
          (shareChannel) => shareChannel.id === channel.id,
        );
        return selectedChannel ? { ...channel, checked: selectedChannel.checked } : channel;
      });
    }

    const recipient = shareableApiRecipients.find(
      (item) => item.type === recipientId || item.id === recipientId,
    );
    const baseChannels = buildChannelsFromRecipient(recipient);
    const selectedChannels = channelsByRecipient[recipientId] ?? [];
    return baseChannels.map((channel) => {
      const selectedChannel = selectedChannels.find(
        (shareChannel) => shareChannel.id === channel.id,
      );
      return selectedChannel ? { ...channel, checked: selectedChannel.checked } : channel;
    });
  };

  const channels = useMemo(
    () => getChannelsForRecipient(effectiveSelectedId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveSelectedId, channelsByRecipient, othersChannelValues, shareableApiRecipients],
  );

  const resetShareState = () => {
    setOthersChannelValues(DEFAULT_OTHERS_CHANNEL_VALUES);
    setOthersChannelErrors({});
    setShareRecipientId('');
    setChannelsByRecipient({});
    setDependentChannelsByMember({});
    setActiveDependentMemberId(null);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      closeShareDialog();
      setShareDialogOpen(false);
      resetShareState();
      return;
    }

    setShareDialogOpen(true);
  };

  const openDialogForClaim = (
    nextClaimNumber: string,
    nextPolicyEkey: string,
    nextPolicyNumber: string,
  ) => {
    openShareDialog(nextClaimNumber, nextPolicyEkey, nextPolicyNumber);
    setShareDialogOpen(true);
    resetShareState();
  };

  const initializeDependentChannels = () => {
    const dependentRecipient = recipients.find((recipient) => recipient.id === 'DEPENDENT');
    const members = dependentRecipient?.members ?? [];
    const channelsByMember: Record<string, PolicyShareChannel[]> = {};
    members.forEach((member) => {
      const previousMemberChannels = dependentChannelsByMember[member.id];
      const memberChannels = buildChannelsFromRecipientMember(member);
      channelsByMember[member.id] =
        previousMemberChannels && previousMemberChannels.length > 0
          ? memberChannels.map((channel) => {
              const previousChannel = previousMemberChannels.find(
                (previous) => previous.id === channel.id,
              );
              return previousChannel ? { ...channel, checked: previousChannel.checked } : channel;
            })
          : memberChannels;
    });
    setDependentChannelsByMember(channelsByMember);
    const firstMemberId = members[0]?.id ?? null;
    const nextActiveMemberId =
      activeDependentMemberId && channelsByMember[activeDependentMemberId]
        ? activeDependentMemberId
        : firstMemberId;
    setActiveDependentMemberId(nextActiveMemberId);
  };

  const onSelectRecipient = (id: string) => {
    setShareRecipientId(id);

    if (id === 'DEPENDENT') {
      initializeDependentChannels();
      return;
    }

    setActiveDependentMemberId(null);
  };

  const onDependentChannelsChange = (memberId: string, channels: PolicyShareChannel[]) => {
    setDependentChannelsByMember((previous) => ({ ...previous, [memberId]: channels }));
  };

  const onDependentActiveMemberChange = (memberId: string | null) => {
    setActiveDependentMemberId(memberId);
  };

  const onChannelValueChange = (channelId: string, value: string) => {
    if (effectiveSelectedId !== OTHERS_RECIPIENT_ID) {
      return;
    }

    setOthersChannelValues((previousValues) => ({ ...previousValues, [channelId]: value }));
    setOthersChannelErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      delete nextErrors[channelId];
      return nextErrors;
    });
  };

  const setShareChannels = (updatedChannels: PolicyShareChannel[]) => {
    if (!effectiveSelectedId || effectiveSelectedId === 'DEPENDENT') {
      return;
    }

    setChannelsByRecipient((previous) => ({ ...previous, [effectiveSelectedId]: updatedChannels }));
  };

  const selectedRecipientIds = useMemo(
    () =>
      recipients
        .map((recipient) => recipient.id)
        .filter((recipientId) => {
          if (recipientId === 'DEPENDENT') {
            return Object.values(dependentChannelsByMember).some((memberChannels) =>
              memberChannels.some((channel) => channel.checked),
            );
          }

          return getChannelsForRecipient(recipientId).some((channel) => channel.checked);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      recipients,
      dependentChannelsByMember,
      channelsByRecipient,
      othersChannelValues,
      shareableApiRecipients,
    ],
  );

  const validateOthersChannels = (
    channelsToValidate: PolicyShareChannel[],
  ): Record<string, string> => {
    const errors: Record<string, string> = {};

    channelsToValidate.forEach((channel) => {
      if (!channel.checked) {
        return;
      }

      const channelValue = channel.value?.trim() ?? '';
      if (!channelValue) {
        if (channel.id === 'email') {
          errors.email = VALIDATION_MESSAGES.EMAIL_REQUIRED;
        } else {
          errors[channel.id] = VALIDATION_MESSAGES.MOBILE_REQUIRED;
        }
        return;
      }

      if (channel.id === 'email') {
        if (!isValidEmail(channelValue)) {
          errors.email = VALIDATION_MESSAGES.EMAIL_REQUIRED;
        }
      } else if (channel.id === 'whatsapp' || channel.id === 'sms') {
        if (!isValidIndianMobile(channelValue)) {
          errors[channel.id] = VALIDATION_MESSAGES.MOBILE_REQUIRED;
        }
      }
    });

    return errors;
  };

  const submitShare = () => {
    if (!claimNumber) {
      return;
    }

    let mail: string[] = [];
    let whatsapp: string[] = [];
    let sms: string[] = [];

    const mailSet = new Set<string>();
    const whatsappSet = new Set<string>();
    const smsSet = new Set<string>();

    if (selectedRecipientIds.includes(OTHERS_RECIPIENT_ID)) {
      const othersChannels = getChannelsForRecipient(OTHERS_RECIPIENT_ID);
      const validationErrors = validateOthersChannels(othersChannels);
      if (Object.keys(validationErrors).length > 0) {
        setOthersChannelErrors(validationErrors);
        return;
      }

      setOthersChannelErrors({});
      const othersPayload = buildOthersSharePayload(othersChannels);
      othersPayload.mail.forEach((value) => mailSet.add(value));
      othersPayload.whatsapp.forEach((value) => whatsappSet.add(value));
      othersPayload.sms.forEach((value) => smsSet.add(value));
    } else {
      setOthersChannelErrors({});
    }

    selectedRecipientIds.forEach((recipientId) => {
      if (recipientId === OTHERS_RECIPIENT_ID) {
        return;
      }

      if (recipientId === 'DEPENDENT') {
        Object.values(dependentChannelsByMember).forEach((memberChannels) => {
          memberChannels.forEach((channel) => {
            if (!channel.checked) {
              return;
            }
            const channelValue = channel.value.trim();
            if (!channelValue) {
              return;
            }
            if (channel.id === 'email') {
              mailSet.add(channelValue);
            } else if (channel.id === 'whatsapp') {
              whatsappSet.add(channelValue);
            } else if (channel.id === 'sms') {
              smsSet.add(channelValue);
            }
          });
        });
        return;
      }

      const recipientChannels = getChannelsForRecipient(recipientId);
      recipientChannels.forEach((channel) => {
        if (!channel.checked) {
          return;
        }
        const channelValue = channel.value.trim();
        if (!channelValue) {
          return;
        }
        if (channel.id === 'email') {
          mailSet.add(channelValue);
        } else if (channel.id === 'whatsapp') {
          whatsappSet.add(channelValue);
        } else if (channel.id === 'sms') {
          smsSet.add(channelValue);
        }
      });
    });

    mail = [...mailSet];
    whatsapp = [...whatsappSet];
    sms = [...smsSet];

    if (mail.length === 0 && whatsapp.length === 0 && sms.length === 0) {
      return;
    }

    triggerShareMutation.mutate(
      {
        claimNumber,
        emails: mail,
        whatsappNumbers: whatsapp,
        smsNumbers: sms,
      },
      {
        onSettled: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const canShare = useMemo(
    () =>
      selectedRecipientIds.some((recipientId) => {
        if (recipientId === 'DEPENDENT') {
          return Object.values(dependentChannelsByMember).some((memberChannels) =>
            memberChannels.some((channel) => channel.checked && Boolean(channel.value.trim())),
          );
        }

        return getChannelsForRecipient(recipientId).some(
          (channel) => channel.checked && Boolean(channel.value.trim()),
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRecipientIds,
      dependentChannelsByMember,
      channelsByRecipient,
      othersChannelValues,
      shareableApiRecipients,
    ],
  );

  return {
    shareDialogOpen,
    isRecipientsLoading,
    recipients,
    selectedRecipientIds,
    effectiveSelectedId,
    channels,
    dependentChannelsByMember,
    activeDependentMemberId,
    othersChannelErrors,
    setShareChannels,
    onOpenChange,
    openDialogForClaim,
    onSelectRecipient,
    onDependentChannelsChange,
    onDependentActiveMemberChange,
    onChannelValueChange,
    canShare,
    submitShare,
  };
}
