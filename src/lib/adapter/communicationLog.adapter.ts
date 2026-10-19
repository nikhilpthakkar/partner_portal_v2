import type { ClaimShareRecipientResponse } from '@/lib/types/claims-management/claimShareApi';
import type {
  CommunicationLogApiItem,
  CommunicationLogRow,
  CommunicationLogStatus,
} from '@/lib/types/communicationLog';

export const resolveCommunicationDateLabel = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return value;
  }

  return dateValue.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export const resolveCommunicationStatusLabel = (status?: string): CommunicationLogStatus =>
  status?.toLowerCase() === 'success' ? 'Success' : 'Failed';

export const resolveCommunicationChannelLabel = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case 'mail':
      return 'Email';
    case 'sms':
      return 'SMS';
    case 'whatsapp':
      return 'WhatsApp';
    default:
      return '-';
  }
};

const normalizeValue = (value?: string): string => value?.trim().toLowerCase() ?? '';

export const splitEmailTargetsForCommunication = (target?: string): string[] => {
  const emailTargets = (target ?? '')
    .split(/[,\n;]+/)
    .map((email) => email.trim())
    .filter(Boolean);

  return emailTargets.length > 0 ? emailTargets : ['-'];
};

const normalizePhoneNumber = (value?: string): string => {
  const digitsOnly = (value ?? '').replace(/\D/g, '');
  return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
};

export const resolveRecipientTypeLabel = (
  recipientValue: string | undefined,
  recipients: ClaimShareRecipientResponse[],
): string => {
  const normalizedRecipientValue = normalizeValue(recipientValue);
  const normalizedRecipientPhone = normalizePhoneNumber(recipientValue);

  const matchedRecipient = recipients.find((recipient) => {
    const matchesEmail = normalizeValue(recipient.email) === normalizedRecipientValue;
    const matchesName = normalizeValue(recipient.name) === normalizedRecipientValue;
    const matchesId = normalizeValue(recipient.id) === normalizedRecipientValue;
    const matchesSms =
      normalizedRecipientPhone.length > 0 &&
      normalizePhoneNumber(recipient.sms) === normalizedRecipientPhone;
    const matchesWhatsApp =
      normalizedRecipientPhone.length > 0 &&
      normalizePhoneNumber(recipient.whatsapp) === normalizedRecipientPhone;

    return matchesEmail || matchesName || matchesId || matchesSms || matchesWhatsApp;
  });

  return matchedRecipient?.type?.toLowerCase() ?? 'other';
};

const mapCommunicationItemToRow = (
  communication: CommunicationLogApiItem,
  index: number,
  rowSubIndex: number,
  target: string,
  recipients: ClaimShareRecipientResponse[],
): CommunicationLogRow => ({
  id: `${communication.date ?? ''}-${index}-${rowSubIndex}`,
  type: resolveCommunicationChannelLabel(communication.type),
  subject: communication.subject || '-',
  date: resolveCommunicationDateLabel(communication.date),
  status: resolveCommunicationStatusLabel(communication.status),
  target,
  recipientType: resolveRecipientTypeLabel(target, recipients),
});

export const buildCommunicationLogRows = (
  communications: CommunicationLogApiItem[],
  recipients: ClaimShareRecipientResponse[] = [],
): CommunicationLogRow[] =>
  communications.flatMap((communication, index) => {
    const targets =
      communication.type?.toLowerCase() === 'mail'
        ? splitEmailTargetsForCommunication(communication.target)
        : [communication.target || '-'];

    return targets.map((target, rowSubIndex) =>
      mapCommunicationItemToRow(communication, index, rowSubIndex, target, recipients),
    );
  });
