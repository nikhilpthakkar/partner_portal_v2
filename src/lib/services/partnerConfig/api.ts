import { apiClient } from '@/lib/services/axios-client/apiClient';
import {
  PartnerListResponse,
  LobListResponse,
  ProductListResponse,
} from '@/lib/types/partnerConfig';

export const fetchPartners = async (): Promise<PartnerListResponse> => {
  return await apiClient.get('/admin/partners').then((res) => res.data);
};

export const fetchLobs = async (partnerId: string): Promise<LobListResponse> => {
  return await apiClient.get(`/admin/partners/${partnerId}/lobs`).then((res) => res.data);
};

export const fetchProducts = async (
  partnerId: string,
  lobId: string,
): Promise<ProductListResponse> => {
  return await apiClient
    .get(`/admin/partners/${partnerId}/lobs/${lobId}/products`)
    .then((res) => res.data);
};
