import { useEffect } from 'react';
import { usePartnerStore } from '@/lib/store/partner.store';
import { useGlobalLoaderStore } from '@/lib/store/globalLoader.store';
import {
  usePartnersQuery,
  useLobsQuery,
  useProductsQuery,
} from '@/lib/query/partnerConfig.queries';
import { GLOBAL_LOADER_MESSAGES } from '../constants/auth.constants';

const formatLabel = (id: string): string => {
  return id
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const usePartnerConfig = () => {
  const {
    partnerId,
    lob,
    productIds,
    setPartnerId,
    setLob,
    setPartnerOptions,
    setLobOptions,
    setProductOptions,
    setProductIds,
    setPermissions,
  } = usePartnerStore();

  const { showLoader, hideLoader } = useGlobalLoaderStore();

  const {
    data: partnersData,
    isLoading: isPartnersLoading,
    error: partnersError,
  } = usePartnersQuery();

  const {
    data: lobsData,
    isLoading: isLobsLoading,
    error: lobsError,
  } = useLobsQuery(partnerId, !!partnerId);

  const {
    data: productsData,
    isLoading: isProductsLoading,
    error: productsError,
  } = useProductsQuery(partnerId, lob, !!partnerId && !!lob);

  useEffect(() => {
    if (partnersData?.partners && partnersData.partners.length > 0) {
      const options = partnersData.partners.map((partner) => ({
        label: formatLabel(partner.id),
        value: partner.id,
      }));
      setPartnerOptions(options);

      if (!partnerId || !partnersData.partners.find((partner) => partner.id === partnerId)) {
        const firstPartnerId = partnersData.partners[0].id;
        setPartnerId(firstPartnerId);
      }
    }
  }, [partnersData, partnerId, setPartnerOptions, setPartnerId]);

  useEffect(() => {
    if (lobsData?.lobs && lobsData.lobs.length > 0) {
      const options = lobsData.lobs.map((lobItem) => ({
        label: formatLabel(lobItem.id),
        value: lobItem.id,
      }));
      setLobOptions(options);

      if (!lob || !lobsData.lobs.find((l) => l.id === lob)) {
        const firstLobId = lobsData.lobs[0].id;
        setLob(firstLobId);
      }
    }
  }, [lobsData, lob, setLobOptions, setLob]);

  useEffect(() => {
    if (productsData?.products) {
      const options = productsData.products.map((product) => ({
        label: formatLabel(product.id),
        value: product.id,
      }));
      setProductOptions(options);

      const productIds = productsData.products.map((product) => product.id);
      setProductIds(productIds);
    }
  }, [productsData, setProductOptions, setProductIds]);

  useEffect(() => {
    const partnerPermissions =
      partnersData?.partners.find((partner) => partner.id === partnerId)?.permissions ?? [];
    const lobPermissions = lobsData?.lobs.find((lobItem) => lobItem.id === lob)?.permissions ?? [];
    const productPermissions =
      productsData?.products.flatMap((product) => product.permissions) ?? [];

    const permissions = Array.from(
      new Set([...partnerPermissions, ...lobPermissions, ...productPermissions]),
    );

    if (productsData?.products || partnerPermissions.length > 0 || lobPermissions.length > 0) {
      setPermissions(permissions);
    }
  }, [
    lobsData,
    lob,
    partnerId,
    partnersData,
    productsData,
    setPermissions,
  ]);

  const isPermissionsLoading = isPartnersLoading || isLobsLoading || isProductsLoading;
  const permissionsIsReady = Boolean(partnerId && lob && productIds.length > 0);
  const hasNoData =
    !partnersData?.partners?.length || !lobsData?.lobs?.length || !productsData?.products?.length;
  const hasError = partnersError || lobsError || productsError;

  useEffect(() => {
    if (isPermissionsLoading && !permissionsIsReady) {
      showLoader(GLOBAL_LOADER_MESSAGES.PARTNER_CONFIG_LOADING);
    } else {
      hideLoader();
    }
  }, [isPermissionsLoading, permissionsIsReady, showLoader, hideLoader]);

  return {
    isPermissionsLoading,
    permissionsIsReady,
    partnerId,
    hasNoData,
    hasError,
  };
};
