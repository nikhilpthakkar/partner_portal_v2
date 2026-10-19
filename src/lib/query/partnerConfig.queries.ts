import { useQuery } from '@tanstack/react-query';
import { fetchPartners, fetchLobs, fetchProducts } from '@/lib/services/partnerConfig/api';
import { useAuth } from '@/lib/context/AuthContext';

export const PARTNERS_QUERY_KEY = ['partners'];
export const LOBS_QUERY_KEY = ['lobs'];
export const PRODUCTS_QUERY_KEY = ['products'];

export const usePartnersQuery = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: PARTNERS_QUERY_KEY,
    queryFn: fetchPartners,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
};

export const useLobsQuery = (partnerId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...LOBS_QUERY_KEY, partnerId],
    queryFn: () => fetchLobs(partnerId),
    enabled: enabled && !!partnerId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useProductsQuery = (partnerId: string, lobId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, partnerId, lobId],
    queryFn: () => fetchProducts(partnerId, lobId),
    enabled: enabled && !!partnerId && !!lobId,
    staleTime: 10 * 60 * 1000,
  });
};
