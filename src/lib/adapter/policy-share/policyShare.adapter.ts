import type {
  PolicyShareChannel,
  PolicyShareRecipient,
  PolicyShareRecipientMember,
} from '@/lib/types/policy-management';
import type {
  PolicyShareRecipientResponse,
  RecipientType,
} from '@/lib/types/policy-management/policyShareApi';
import { formatEnum } from '@/lib/utils';

export const OTHERS_RECIPIENT_ID = 'others';

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  whatsapp: 'Whatsapp',
  sms: 'SMS',
};

const RECIPIENT_TYPE_LABELS: Record<RecipientType, string> = {
  CUSTOMER: 'Customer',
  NOMINEE: 'Nominee',
  DEPENDENT: 'Dependent(s)',
  OTHERS: 'Others',
};

const RECIPIENT_SUBTITLE_MAX_LENGTH = 48;

function compactRecipientSubtitle(memberNames: string[]): string {
  if (memberNames.length === 0) {
    return '';
  }

  const fullSubtitle = memberNames.join(', ');
  if (fullSubtitle.length <= RECIPIENT_SUBTITLE_MAX_LENGTH) {
    return fullSubtitle;
  }

  return `${memberNames[0]} +${memberNames.length - 1} others`;
}

export function mapRecipientsToSharePolicyRecipients(
  recipients: PolicyShareRecipientResponse[],
): PolicyShareRecipient[] {
  const result: Record<string, PolicyShareRecipient> = {};

  recipients.forEach((r) => {
    const type = r.type;
    const title = RECIPIENT_TYPE_LABELS[type] ?? type;

    const nameWithRelation = r.relationship ? `${r.name} (${formatEnum(r.relationship)})` : r.name;
    const member: PolicyShareRecipientMember = {
      id: r.id,
      name: r.name,
      subtitle: r.relationship ? formatEnum(r.relationship) : undefined,
      email: r.email,
      whatsapp: r.whatsapp,
      sms: r.sms,
    };

    if (!result[type]) {
      result[type] = {
        id: type,
        title,
        subtitle: nameWithRelation,
        members: [member],
      };
    } else {
      result[type].members = [...(result[type].members ?? []), member];
      const memberNames = result[type].members?.map((recipientMember) => {
        return recipientMember.subtitle
          ? `${recipientMember.name} (${recipientMember.subtitle})`
          : recipientMember.name;
      });
      result[type].subtitle = compactRecipientSubtitle(memberNames ?? []);
    }
  });

  return Object.values(result);
}

export function ensureOthersRecipient(recipients: PolicyShareRecipient[]): PolicyShareRecipient[] {
  const hasOthers = recipients.some(
    (r) => r.id === OTHERS_RECIPIENT_ID || r.title.toLowerCase() === 'others',
  );
  if (hasOthers) return recipients;
  return [...recipients, { id: OTHERS_RECIPIENT_ID, title: 'Others', subtitle: undefined }];
}

export type OthersChannelValues = {
  email: string;
  whatsapp: string;
  sms: string;
};

export const DEFAULT_OTHERS_CHANNEL_VALUES: OthersChannelValues = {
  email: '',
  whatsapp: '',
  sms: '',
};

export function buildChannelsForOthers(values: OthersChannelValues): PolicyShareChannel[] {
  return [
    { id: 'email', label: CHANNEL_LABELS.email, value: values.email, checked: false },
    { id: 'whatsapp', label: CHANNEL_LABELS.whatsapp, value: values.whatsapp, checked: false },
    { id: 'sms', label: CHANNEL_LABELS.sms, value: values.sms, checked: false },
  ];
}

export type OthersSharePayload = {
  mail: string[];
  whatsapp: string[];
  sms: string[];
};

export function buildOthersSharePayload(channels: PolicyShareChannel[]): OthersSharePayload {
  const mail = channels
    .filter((c) => c.id === 'email' && c.checked && Boolean(c.value?.trim()))
    .map((c) => c.value.trim());
  const whatsapp = channels
    .filter((c) => c.id === 'whatsapp' && c.checked && Boolean(c.value?.trim()))
    .map((c) => c.value.trim());
  const sms = channels
    .filter((c) => c.id === 'sms' && c.checked && Boolean(c.value?.trim()))
    .map((c) => c.value.trim());
  return { mail, whatsapp, sms };
}

export function buildChannelsFromRecipient(
  recipient: PolicyShareRecipientResponse | undefined,
): PolicyShareChannel[] {
  if (!recipient) {
    return [];
  }

  const channels: PolicyShareChannel[] = [];

  if (recipient.email) {
    channels.push({
      id: 'email',
      label: CHANNEL_LABELS.email,
      value: recipient.email,
      checked: false,
    });
  }
  if (recipient.whatsapp) {
    channels.push({
      id: 'whatsapp',
      label: CHANNEL_LABELS.whatsapp,
      value: recipient.whatsapp,
      checked: false,
    });
  }
  if (recipient.sms) {
    channels.push({
      id: 'sms',
      label: CHANNEL_LABELS.sms,
      value: recipient.sms,
      checked: false,
    });
  }

  return channels;
}

export function buildChannelsFromRecipientMember(
  member: PolicyShareRecipientMember,
): PolicyShareChannel[] {
  const channels: PolicyShareChannel[] = [];

  if (member.email) {
    channels.push({
      id: 'email',
      label: CHANNEL_LABELS.email,
      value: member.email,
      checked: false,
    });
  }
  if (member.whatsapp) {
    channels.push({
      id: 'whatsapp',
      label: CHANNEL_LABELS.whatsapp,
      value: member.whatsapp,
      checked: false,
    });
  }
  if (member.sms) {
    channels.push({
      id: 'sms',
      label: CHANNEL_LABELS.sms,
      value: member.sms,
      checked: false,
    });
  }

  return channels;
}
