'use client';

import { useEffect } from 'react';
import { REPORTS_HEADER } from '@/lib/constants/reports.constants';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import { useReportsEmbedUrlQuery } from '@/lib/query/reports.queries';
import Skeleton from '@/components/ui/skeleton';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { trackReportsPageView } from '@/lib/segment/track/reports';

export default function Reports() {
  const segmentBase = useSegmentPartnerBase();
  const { data, isLoading, isError } = useReportsEmbedUrlQuery();
  const embedUrl = data?.data?.embedUrl ?? '';

  useEffect(() => {
    trackReportsPageView(segmentBase);
  }, [segmentBase]);

  return (
    <div className={PAGE_LAYOUT_CLASS}>
      <PageHeading title={REPORTS_HEADER.title} subtitle={REPORTS_HEADER.subtitle} />

      {isLoading && (
        <Skeleton className="h-full min-h-160 w-full rounded-lg bg-muted" aria-hidden />
      )}
      {!isLoading && isError && (
        <div className="flex min-h-160 items-center justify-center text-sm text-destructive">
          {'Unable to load reports dashboard. Please try again later.'}
        </div>
      )}
      {!isLoading && !isError && embedUrl && (
        <iframe
          title={`${REPORTS_HEADER.title} dashboard`}
          src={embedUrl}
          className="h-full min-h-160 w-full rounded-lg border border-muted"
        />
      )}
      {!isLoading && !isError && !embedUrl && (
        <div className="flex min-h-160 items-center justify-center text-sm text-muted-foreground">
          {'Reports dashboard is not available yet.'}
        </div>
      )}
    </div>
  );
}
