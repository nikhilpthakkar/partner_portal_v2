import type { Pagination } from '@/lib/types/Global';

export type ClaimCommunicationType = 'whatsapp' | 'sms' | 'mail';

export type ClaimCommunicationStatus = 'success' | 'failed';

export type ClaimCommunication = {
  type: ClaimCommunicationType;
  subject: string;
  date: string;
  status: ClaimCommunicationStatus;
  source: string;
  claim_number: string | null;
  target?: string;
};

export type ClaimsCommunicationResponse = {
  communications: ClaimCommunication[];
  pagination: Pagination;
};

export type ClaimsCommunicationFilters = {
  productIds: string[];
  claimNumber: string;
  partnerId: string;
  lob: string;
  page: number;
  pageSize: number;
};
