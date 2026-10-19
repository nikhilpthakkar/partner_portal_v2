import { Permission } from '@/lib/constants/auth.constants';

export type Partner = {
  id: string;
  permissions: Permission[];
  display_name?: string | null;
  displayName?: string | null;
  logo_url?: string | null;
  logoUrl?: string | null;
};

export type PartnerListResponse = {
  partners: Partner[];
};

export type Lob = {
  id: string;
  permissions: Permission[];
  lob_group_id: string;
};

export type LobListResponse = {
  lobs: Lob[];
  partner_id: string;
};

export type Product = {
  id: string;
  permissions: Permission[];
};

export type ProductListResponse = {
  products: Product[];
  partner_id: string;
  lob: string;
};
