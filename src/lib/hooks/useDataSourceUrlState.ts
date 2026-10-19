'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SOURCE_QUERY_PARAM, type DataSource } from '@/lib/constants/global.constants';
import { usePartnerStore } from '@/lib/store/partner.store';
import { parseDataSource } from '@/lib/utils/dataSource.utils';

/** Reads `source` from the URL; falls back to the store when missing and LEDGER when invalid. */
export function useDataSource(): DataSource {
  const searchParams = useSearchParams();
  const dataSource = usePartnerStore((state) => state.dataSource);
  const urlSourceParam = searchParams.get(SOURCE_QUERY_PARAM);
  return urlSourceParam ? parseDataSource(urlSourceParam) : dataSource;
}

export function useDataSourceUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dataSource = usePartnerStore((state) => state.dataSource);
  const setDataSource = usePartnerStore((state) => state.setDataSource);

  const urlSourceParam = searchParams.get(SOURCE_QUERY_PARAM);
  const resolvedSource = urlSourceParam ? parseDataSource(urlSourceParam) : dataSource;

  useEffect(() => {
    if (resolvedSource !== dataSource) {
      setDataSource(resolvedSource);
    }

    const normalizedParam = urlSourceParam?.trim().toUpperCase();
    const hasValidSourceParam = normalizedParam === 'LEDGER' || normalizedParam === 'FINACKO';

    if (!hasValidSourceParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(SOURCE_QUERY_PARAM, resolvedSource);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [urlSourceParam, resolvedSource, dataSource, pathname, router, searchParams, setDataSource]);
}
