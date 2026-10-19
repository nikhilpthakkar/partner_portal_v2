export type CommunicationLogStatus = 'Success' | 'Failed';

export type CommunicationLogRow = {
  id: string;
  type: string;
  subject: string;
  date: string;
  status: CommunicationLogStatus;
  target: string;
  recipientType: string;
};

/** Minimal API shape for policy and claim communication list items */
export type CommunicationLogApiItem = {
  type?: string;
  subject?: string;
  date?: string;
  status?: string;
  target?: string;
};
