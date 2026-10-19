import { usePartnerStore } from '@/lib/store/partner.store';
import { useProductsQuery } from '@/lib/query/partnerConfig.queries';

/**
 * Hook to check if partner configuration is ready for API calls
 * Use this in all queries that depend on partnerId, lob, or productIds
 * to prevent premature API calls before configuration is loaded
 */
export const usePartnerConfigReady = () => {
  const { partnerId, lob } = usePartnerStore();

  const productsQuery = useProductsQuery(partnerId, lob, Boolean(partnerId && lob));

  /** Products fetch settled — use before evaluating permissions (e.g. route guard) to avoid a false "access denied" while loading. */
  const permissionsResolved =
    partnerId && lob && (productsQuery.isSuccess || productsQuery.isError);

  const isReady = !!partnerId && !!lob;

  return {
    isReady,
    partnerId,
    lob,
    permissionsResolved,
  };
};
