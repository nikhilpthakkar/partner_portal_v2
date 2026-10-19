export type RecipientType = 'CUSTOMER' | 'NOMINEE' | 'DEPENDENT' | 'OTHERS';

export type PolicyShareRecipientResponse = {
  id: string;
  name: string;
  relationship: string;
  email: string;
  sms: string;
  whatsapp: string;
  type: RecipientType;
};

export type PolicyShareFilters = {
  policyId: string;
  partnerId: string;
  lob: string;
};

export type PolicyShareTriggerResponse = {
  message: string;
};

export type PolicyShareTriggerPayload = {
  policyId: string;
  mail: string[];
  whatsapp: string[];
  sms: string[];
};
