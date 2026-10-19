import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  exportCancellationReport,
  fetchBulkUploadEndorsementTypeApplicable,
  fetchPolicySearchCapabilities,
  fetchPolicySearchPolicies,
  fetchRecentSearchPolicies,
} from '@/lib/services/policy-management/api';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import type { ApiErrorResponse } from '@/lib/types/Global';
import type { PolicyBulkUploadEndorsementTypeApplicableResponse } from '@/lib/types/policy-management/policyBulkUploadEndorsementApi';
import { usePartnerStore } from '../store/partner.store';

export const RECENT_SEARCH_POLICIES_QUERY_KEY = ['recent-search-policies'];
export const SEARCH_POLICIES_MUTATION_KEY = ['search-policies'];
export const POLICY_SEARCH_CAPABILITIES_QUERY_KEY = ['policy-search-capabilities'];
export const EXPORT_CANCELLATION_REPORT_MUTATION_KEY = ['export-cancellation-report'];
export const BULK_UPLOAD_ENDORSEMENT_TYPE_APPLICABLE_QUERY_KEY = [
  'bulk-upload-endorsement-type-applicable',
];

export const useRecentSearchPoliciesQuery = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery({
    queryKey: [...RECENT_SEARCH_POLICIES_QUERY_KEY, partnerId, lob, productIds],
    queryFn: () =>
      fetchRecentSearchPolicies({
        partnerId,
        lob,
        productIds,
      }),
    enabled: isReady && productIds.length > 0,
  });
};

export const usePolicySearchCapabilitiesQuery = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery({
    queryKey: [...POLICY_SEARCH_CAPABILITIES_QUERY_KEY, partnerId, lob, productIds],
    queryFn: () =>
      fetchPolicySearchCapabilities({
        partnerId,
        lob,
        productIds,
      }),
    enabled: isReady && productIds.length > 0,
  });
};

type SearchPoliciesParams = {
  searchField: string;
  searchValue: string;
  page: number;
  size: number;
};

export const useSearchPoliciesMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useMutation({
    mutationKey: [...SEARCH_POLICIES_MUTATION_KEY, partnerId, lob, productIds],
    mutationFn: ({ searchField, searchValue, page, size }: SearchPoliciesParams) =>
      fetchPolicySearchPolicies({
        partnerId,
        lob,
        productIds,
        searchField,
        searchValue,
        page,
        size,
      }),
  });
};

export const useBulkUploadEndorsementTypeApplicableQuery = () => {
  const { partnerId, lob, isReady } = usePartnerConfigReady();
  const { productIds } = usePartnerStore();

  return useQuery<PolicyBulkUploadEndorsementTypeApplicableResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [
      ...BULK_UPLOAD_ENDORSEMENT_TYPE_APPLICABLE_QUERY_KEY,
      partnerId,
      lob,
      productIds[0] ?? '',
      productIds,
    ],
    queryFn: () =>
      fetchBulkUploadEndorsementTypeApplicable({
        partnerId,
        lob,
        productIds,
        plan: productIds[0] ?? '',
      }),
    enabled:
      isReady && Boolean(productIds[0]) && Array.isArray(productIds) && productIds.length > 0,
  });
};

type ExportCancellationReportParams = {
  productIds: string[];
  fromDate: string;
  toDate: string;
};

export const useExportCancellationReportMutation = () => {
  const { partnerId, lob } = usePartnerConfigReady();

  return useMutation({
    mutationKey: [...EXPORT_CANCELLATION_REPORT_MUTATION_KEY, partnerId, lob],
    mutationFn: ({ productIds, fromDate, toDate }: ExportCancellationReportParams) =>
      exportCancellationReport({
        partnerId,
        lob,
        productIds,
        fromDate,
        toDate,
      }),
  });
};
