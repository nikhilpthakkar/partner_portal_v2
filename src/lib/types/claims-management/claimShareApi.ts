export type ClaimShareRecipientType = 'CUSTOMER' | 'NOMINEE' | 'DEPENDENT' | 'OTHERS';

export type ClaimShareRecipientResponse = {
  id: string;
  name: string;
  relationship: string;
  email: string;
  sms: string;
  whatsapp: string;
  type: ClaimShareRecipientType;
};

export type ClaimShareTriggerResponse = {
  message: string;
};

export type ClaimShareTriggerPayload = {
  claimNumber: string;
  emails: string[];
  whatsappNumbers: string[];
  smsNumbers: string[];
};

export type ClaimShareFilters = {
  claimNumber: string;
  partnerId: string;
  lob: string;
};
