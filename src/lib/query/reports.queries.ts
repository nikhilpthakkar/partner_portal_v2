import { useQuery } from '@tanstack/react-query';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { usePartnerStore } from '@/lib/store/partner.store';
import { fetchReportsEmbedUrl } from '@/lib/services/reports/api';
import { REPORTS_DASHBOARD_KEY } from '@/lib/constants/reports.constants';

export const REPORTS_EMBED_URL_QUERY_KEY = ['reports-embed-url'];

export const useReportsEmbedUrlQuery = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery({
    queryKey: [...REPORTS_EMBED_URL_QUERY_KEY, partnerId, lob, REPORTS_DASHBOARD_KEY, productIds],
    queryFn: () =>
      fetchReportsEmbedUrl({
        partnerId,
        lob,
        productIds,
        dashboardKey: REPORTS_DASHBOARD_KEY,
      }),
    enabled: isReady && productIds.length > 0,
  });
};
