export type HealthCardData = {
  name: string;
  policyNumber: string;
  uhid: string;
  relationship: string;
  startDate: string;
  endDate: string;
};

export type HealthCardsFilters = {
  policyId: string;
  partnerId: string;
  lob: string;
};

export type HealthCardPdfData = {
  url: string;
  fileName: string;
  expiry: number;
};

export type HealthCardPdfFilters = {
  policyId: string;
  uhid: string;
  partnerId: string;
  lob: string;
};

export type HealthCardShareRecipientChannel = {
  name: string;
  data: string;
};

export type HealthCardSharePayload = {
  policyId: string;
  uhid: string;
  email: HealthCardShareRecipientChannel[];
  sms: HealthCardShareRecipientChannel[];
  whatsapp: HealthCardShareRecipientChannel[];
};

export type HealthCardShareFilters = {
  policyId: string;
  partnerId: string;
  lob: string;
  productIds: string[];
};

export type HealthCardShareResponse = {
  success: boolean;
  message: string;
  meta: {
    filters: HealthCardShareFilters;
    timestamp: Date | string;
    traceId: string;
    errors: string[];
  };
};
