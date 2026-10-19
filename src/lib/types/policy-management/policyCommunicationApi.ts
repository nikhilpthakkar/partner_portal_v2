import type { Pagination } from '@/lib/types/Global';

export type PolicyCommunicationType = 'whatsapp' | 'sms' | 'mail';

export type PolicyCommunicationStatus = 'sent' | 'failed';

export type PolicyCommunication = {
  type: PolicyCommunicationType;
  subject: string;
  date: string;
  status: PolicyCommunicationStatus;
  source: string;
  claim_number: string | null;
  target?: string;
};

export type PolicyCommunicationResponse = {
  communications: PolicyCommunication[];
  pagination: Pagination;
};

export type PolicyCommunicationFilters = {
  productIds: string[];
  policyNumber: string;
  partnerId: string;
  lob: string;
  page: number;
  page_size: number;
};
