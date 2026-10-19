'use client';

import LabeledSelect from '../molecules/LabeledSelect';
import { usePartnerStore } from '@/lib/store/partner.store';
import { AppImage } from '../atoms/AppImage';
import MultiSelect from '../molecules/MultiSelect';
import { usePartnerConfig } from '@/lib/hooks/usePartnerConfig';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DETAILS_ROUTES } from '@/lib/constants/global.constants';
import { appendSourceQueryParam, getDataSourceFromSearch } from '@/lib/utils/dataSource.utils';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { getSegmentPageContextFromPathname } from '@/lib/segment/pageContext';
import {
  trackGlobalPartnerFilterChange,
  trackGlobalProductFilterChange,
} from '@/lib/segment/track/navigation';
import { segmentPartnerBaseFromPartner } from '@/lib/segment';
import { usePartnersQuery } from '@/lib/query/partnerConfig.queries';
import {
  getPartnerApiLogoUrl,
  getPartnerMeta,
  PARTNER_META,
} from '@/lib/constants/partnerMeta.constants';

export function HeaderBar() {
  const {
    partnerId,
    lob,
    productIds,
    productOptions,
    partnerOptions,
    setPartnerId,
    setLob,
    setLobOptions,
    setProductOptions,
    setProductIds,
  } = usePartnerStore();
  usePartnerConfig();
  const { data: partnersData } = usePartnersQuery();
  const pathname = usePathname();
  const isSettingsPage = pathname.includes('/dashboard/settings');
  const segmentBase = useSegmentPartnerBase();
  const segmentBaseRef = useRef(segmentBase);

  useEffect(() => {
    segmentBaseRef.current = segmentBase;
  }, [segmentBase]);

  const pageContext = () => getSegmentPageContextFromPathname(pathname);

  const handlePartnerChange = (newPartnerId: string) => {
    trackGlobalPartnerFilterChange(segmentBaseRef.current, {
      ...pageContext(),
      value: newPartnerId,
    });
    setLob('');
    setLobOptions([]);
    setProductOptions([]);
    setProductIds([]);
    setPartnerId(newPartnerId);
    let targetPath = `/${newPartnerId}/dashboard/overview`;
    if (pathname) {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const isDetailsRoute = segments.some((segment) =>
          DETAILS_ROUTES.includes(segment as (typeof DETAILS_ROUTES)[number]),
        );
        if (!isDetailsRoute) {
          segments[0] = newPartnerId;
          targetPath = `/${segments.join('/')}`;
        }
      }
    }
    window.location.assign(
      appendSourceQueryParam(
        targetPath,
        window.location.search,
        getDataSourceFromSearch(window.location.search),
      ),
    );
  };

  const selectedPartner = partnersData?.partners.find((partner) => partner.id === partnerId);
  const fallbackIconSrc = PARTNER_META[partnerId]?.iconSrc;
  const { name: activePartnerName, iconSrc: activePartnerIconSrc } = getPartnerMeta(
    partnerId,
    getPartnerApiLogoUrl(selectedPartner),
  );
  const [logoSrc, setLogoSrc] = useState(activePartnerIconSrc);

  useEffect(() => {
    setLogoSrc(activePartnerIconSrc);
  }, [activePartnerIconSrc]);

  return (
    <header className="border-border flex items-center justify-between border-b px-6 py-2">
      <div className="flex items-center gap-2">
        {logoSrc ? (
          <div className="text-foreground flex size-8 items-center justify-center shadow-xs overflow-hidden">
            <AppImage
              src={logoSrc}
              alt={activePartnerName}
              width={32}
              height={32}
              className="size-8 object-contain"
              onError={() => {
                if (fallbackIconSrc && logoSrc !== fallbackIconSrc) {
                  setLogoSrc(fallbackIconSrc);
                }
              }}
            />
          </div>
        ) : null}
        <span className="text-foreground text-sm font-semibold uppercase tracking-[0.04em]">
          {activePartnerName}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <LabeledSelect
          label="Partner"
          value={partnerId}
          onValueChange={handlePartnerChange}
          options={partnerOptions.map((option) => ({
            ...option,
            label: PARTNER_META[option.value]?.name ?? option.label,
          }))}
          placeholder="Select partner"
          disabled={partnerOptions.length === 0}
          searchable
          searchPlaceholder="Search partner"
        />
        {isSettingsPage ? null : (
          <MultiSelect
            label="Products"
            values={productIds}
            options={productOptions}
            onValuesChange={(next) => {
              trackGlobalProductFilterChange(segmentPartnerBaseFromPartner(lob, partnerId, next), {
                ...pageContext(),
                value: next.join(','),
              });
              setProductIds(next);
            }}
            placeholder="Select products"
            searchPlaceholder="Search products"
            disabled={productOptions.length === 0}
            contentClassName="min-w-multi-select-content-width"
          />
        )}
      </div>
    </header>
  );
}
