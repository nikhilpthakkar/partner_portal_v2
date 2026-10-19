'use client';

import DateRangePicker from '@/components/molecules/DateRangePicker';
import MetricCard from '@/components/molecules/MetricCard';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import PromoCard from '@/components/molecules/PromoCard';
import { DatadogComponentRenderTracker } from '@/components/datadog/DatadogComponentRenderTracker';
import ClaimsTrendCard from '@/components/organisms/ClaimsTrendCard';
import GwpTrendCard from '@/components/organisms/GwpTrendCard';
import AvgPremiumTrendCard from '@/components/organisms/AvgPremiumTrendCard';
import AvgSiTrendCard from '@/components/organisms/AvgSiTrendCard';
import GeoDistributionCard from '@/components/organisms/GeoDistributionCard';
import TenureDistributionCard from '@/components/organisms/TenureDistributionCard';
import { STATIC_OVERVIEW_RESPONSE } from '@/lib/services/overview/static';
import {
  useClaimsTableQuery,
  useKeyMetricsKpisQuery,
  useOverviewCardsQuery,
  useRegisterCapabilityInterestMutation,
} from '@/lib/query/overview.queries';
import { useOverviewCoverFilterOptions } from '@/lib/hooks/overview/useOverviewCoverFilterOptions';
import { useOverviewLayout } from '@/lib/hooks/overview/useOverviewLayout';
import { ChartComponentId } from '@/lib/constants/overviewComponents.constants';
import { mapKpiComponentsToCards } from '@/lib/adapter/overview/kpi.adapter';
import { mapOverviewCardsToPromoCards } from '@/lib/adapter/overview/promoCards.adapter';
import { useOverviewStore } from '@/lib/store/overview.store';
import { useUserProfileStore } from '@/lib/store/userProfile.store';
import { layoutIncludesChart, normalizeChartComponentId } from '@/lib/utils/overview/overviewChart.utils';
import { mapClaimsTableApiToCard } from '@/lib/adapter/overview/claimsTable.adapter';
import { useEffect, useMemo, useState } from 'react';
import { METRIC_SKELETON_COUNT, PROMO_SKELETON_COUNT } from '@/lib/constants/overview.constants';
import MetricCardSkelton from '@/components/molecules/skeltons/MetricCardSkelton';
import GraphCardSkelton from '@/components/molecules/skeltons/GraphCardSkelton';
import PromoCardSkelton from '@/components/molecules/skeltons/PromoCardSkelton';
import ErrorCard from '@/components/molecules/ErrorCard';
import { getKeyMetricsTitle, getLastUpdatedLabel } from '@/lib/utils/helpers';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackDashboardOverviewException,
  trackDashboardOverviewView,
  trackDashboardRegisterInterest,
} from '@/lib/segment/track/dashboard';

export default function OverviewClient() {
  const segmentBase = useSegmentPartnerBase();
  const [isClaimsDialogOpen, setClaimsDialogOpen] = useState<boolean>(false);
  const [activeCapabilityId, setActiveCapabilityId] = useState<string | null>(null);
  const { userProfile } = useUserProfileStore();
  const { welcomeSubtitle, businessSummaryTitle, newFeaturesTitle } = STATIC_OVERVIEW_RESPONSE;
  const firstName = userProfile?.firstName?.trim() || 'User';
  const welcomeTitle = `Welcome, ${firstName}`;

  const {
    dateRange,
    statusGroups,
    claimsTableDateRange,
    coverIds,
    setDateRange,
    setStatusGroups,
    setClaimsTableDateRange,
    setCoverIds,
  } = useOverviewStore();

  const { layout, isLoading: isConfigLoading, isError: isConfigError, isReady: isConfigReady } =
    useOverviewLayout();

  const showClaimsTrendChart = layoutIncludesChart(
    layout.chartIds,
    ChartComponentId.CLAIMS_TREND_BY_STATUS,
  );
  const showGeoPoliciesChart = layoutIncludesChart(
    layout.chartIds,
    ChartComponentId.GEO_DISTRIBUTION_POLICIES,
  );
  const showGeoClaimsChart = layoutIncludesChart(
    layout.chartIds,
    ChartComponentId.GEO_DISTRIBUTION_CLAIMS,
  );
  const showTenureDistributionChart = layoutIncludesChart(
    layout.chartIds,
    ChartComponentId.POLICIES_BY_TENURE_DISTRIBUTION,
  );

  const {
    data: kpiComponentsData,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
  } = useKeyMetricsKpisQuery(layout.kpiIds, isConfigReady);

  const {
    coverOptions,
    isLoading: isCoveragePlanMappingLoading,
    isError: isCoveragePlanMappingError,
  } = useOverviewCoverFilterOptions(isConfigReady && showClaimsTrendChart);

  const {
    data: overviewCardsData,
    isLoading: isOverviewCardsLoading,
    isError: isOverviewCardsError,
  } = useOverviewCardsQuery();

  useEffect(() => {
    trackDashboardOverviewView(segmentBase);
  }, [segmentBase]);

  const {
    data: claimsTableData,
    isLoading: isClaimsTableLoading,
    isError: isClaimsTableError,
  } = useClaimsTableQuery(isConfigReady && showClaimsTrendChart);

  const exceptionType = useMemo(() => {
    if (isConfigError) return 'overview_config';
    if (isMetricsError) return 'key_metrics_kpis';
    if (isCoveragePlanMappingError) return 'coverage_plan_mapping';
    if (isClaimsTableError) return 'claims_table';
    if (isOverviewCardsError) return 'overview_cards';
  }, [
    isConfigError,
    isMetricsError,
    isCoveragePlanMappingError,
    isClaimsTableError,
    isOverviewCardsError,
  ]);

  useEffect(() => {
    if (
      !(
        isConfigError ||
        isMetricsError ||
        isCoveragePlanMappingError ||
        isClaimsTableError ||
        isOverviewCardsError
      ) ||
      !exceptionType
    ) {
      return;
    }
    trackDashboardOverviewException(segmentBase, {
      exception_type: exceptionType,
    });
  }, [
    isConfigError,
    isMetricsError,
    isCoveragePlanMappingError,
    isClaimsTableError,
    isOverviewCardsError,
    exceptionType,
    segmentBase,
  ]);

  const promoCards = useMemo(
    () => mapOverviewCardsToPromoCards(overviewCardsData),
    [overviewCardsData],
  );
  const { mutate: registerCapabilityInterest, isPending: isRegisteringCapabilityInterest } =
    useRegisterCapabilityInterestMutation();

  const metrics = useMemo(
    () => mapKpiComponentsToCards(kpiComponentsData, layout.kpiIds),
    [kpiComponentsData, layout.kpiIds],
  );

  const claimsTable = mapClaimsTableApiToCard(claimsTableData);
  const now = new Date();
  const keyMetricsStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const keyMetricsTitle = getKeyMetricsTitle(keyMetricsStartDate, now);
  const dynamicLastUpdatedLabel = getLastUpdatedLabel();

  const handleRegisterInterest = (capabilityId: string) => {
    if (isRegisteringCapabilityInterest) {
      return;
    }
    trackDashboardRegisterInterest(segmentBase, capabilityId);
    setActiveCapabilityId(capabilityId);
    registerCapabilityInterest(capabilityId, {
      onSettled: () => setActiveCapabilityId(null),
    });
  };

  return (
    <div className={PAGE_LAYOUT_CLASS}>
      <PageHeading title={welcomeTitle} subtitle={welcomeSubtitle} capitalizeTitle />

      {isConfigError ? (
        <ErrorCard
          title="Unable to load overview configuration"
          description="Please try again later."
        />
      ) : null}

      {isConfigLoading ? (
        <div className="flex flex-col gap-6">
          <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: METRIC_SKELETON_COUNT }, (_, index) => index).map((index) => (
              <MetricCardSkelton key={`config-metric-skeleton-${index}`} index={index} />
            ))}
          </div>
          <div className="grid w-full gap-4 lg:grid-cols-2 grid-cols-1">
            {Array.from({ length: 2 }, (_, index) => index).map((index) => (
              <GraphCardSkelton key={`config-chart-skeleton-${index}`} chartHeight={280} />
            ))}
          </div>
        </div>
      ) : null}

      {isConfigReady && layout.showKeyMetricsSection ? (
      <div className="flex flex-col gap-3">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-xl font-semibold leading-none text-pagination-text">
            {keyMetricsTitle}
          </h2>
          <p className="text-sm text-pagination-text-muted">{dynamicLastUpdatedLabel}</p>
        </div>

        <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isMetricsError ? (
            <ErrorCard
              className="col-span-full"
              title="Unable to load key metrics"
              description="Please try again later."
            />
          ) : isMetricsLoading ? (
            Array.from({ length: layout.kpiIds.length }, (_, index) => index).map((index) => (
              <MetricCardSkelton key={`metric-skeleton-${index}`} index={index} />
            ))
          ) : (
            metrics.map((card) => (
              <MetricCard key={card.componentId ?? card.label} card={card} className="w-full" />
            ))
          )}
        </div>
      </div>
      ) : null}

      {isConfigReady && layout.showBusinessSummarySection ? (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between">
          <h2 className="text-xl font-semibold leading-none text-pagination-text">
            {businessSummaryTitle}
          </h2>
          <div className="w-fit">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
        <div className="w-full grid gap-4 lg:grid-cols-2 grid-cols-1">
          {layout.chartIds.map((rawChartId) => {
            const chartId = normalizeChartComponentId(rawChartId);
            if (chartId === ChartComponentId.GWP_POLICY_COUNT_TREND) {
              return (
                <DatadogComponentRenderTracker
                  key={chartId}
                  name="overview.GwpTrendCard"
                >
                  <GwpTrendCard enabled={isConfigReady} />
                </DatadogComponentRenderTracker>
              );
            }

            if (chartId === ChartComponentId.CLAIMS_TREND_BY_STATUS) {
              return (
                <DatadogComponentRenderTracker
                  key={chartId}
                  name="overview.ClaimsTrendCard"
                >
                  <ClaimsTrendCard
                    enabled={isConfigReady && showClaimsTrendChart}
                    claimsStatus={statusGroups}
                    onClaimsStatusChange={setStatusGroups}
                    coverOptions={coverOptions}
                    coverIds={coverIds}
                    onCoverIdsChange={setCoverIds}
                    coversDisabled={isCoveragePlanMappingLoading || isCoveragePlanMappingError}
                    isCoverOptionsLoading={isCoveragePlanMappingLoading}
                    isTableLoading={isClaimsTableLoading}
                    isTableError={isClaimsTableError}
                    claimsTableData={claimsTable}
                    claimsTableDateRange={claimsTableDateRange}
                    onClaimsTableDateRangeChange={setClaimsTableDateRange}
                    dialogOpen={isClaimsDialogOpen}
                    onDialogOpenChange={setClaimsDialogOpen}
                  />
                </DatadogComponentRenderTracker>
              );
            }

            if (chartId === ChartComponentId.AVG_PREMIUM_TREND) {
              return (
                <DatadogComponentRenderTracker
                  key={chartId}
                  name="overview.AvgPremiumTrendCard"
                >
                  <AvgPremiumTrendCard enabled={isConfigReady} />
                </DatadogComponentRenderTracker>
              );
            }

            if (chartId === ChartComponentId.AVERAGE_SI_TREND) {
              return (
                <DatadogComponentRenderTracker
                  key={chartId}
                  name="overview.AvgSiTrendCard"
                >
                  <AvgSiTrendCard enabled={isConfigReady} />
                </DatadogComponentRenderTracker>
              );
            }

            if (chartId === ChartComponentId.GEO_DISTRIBUTION_POLICIES) {
              return (
                <DatadogComponentRenderTracker
                  key={chartId}
                  name="overview.GeoDistributionPoliciesCard"
                >
                  <GeoDistributionCard
                    componentId={ChartComponentId.GEO_DISTRIBUTION_POLICIES}
                    enabled={isConfigReady && showGeoPoliciesChart}
                  />
                </DatadogComponentRenderTracker>
              );
            }

            if (chartId === ChartComponentId.GEO_DISTRIBUTION_CLAIMS) {
              return (
                <DatadogComponentRenderTracker
                  key={chartId}
                  name="overview.GeoDistributionClaimsCard"
                >
                  <GeoDistributionCard
                    componentId={ChartComponentId.GEO_DISTRIBUTION_CLAIMS}
                    enabled={isConfigReady && showGeoClaimsChart}
                  />
                </DatadogComponentRenderTracker>
              );
            }

            if (chartId === ChartComponentId.POLICIES_BY_TENURE_DISTRIBUTION) {
              return (
                <DatadogComponentRenderTracker
                  key={chartId}
                  name="overview.TenureDistributionCard"
                >
                  <TenureDistributionCard enabled={isConfigReady && showTenureDistributionChart} />
                </DatadogComponentRenderTracker>
              );
            }

            return null;
          })}
        </div>
      </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold leading-none text-pagination-text">
          {newFeaturesTitle}
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {isOverviewCardsError ? (
            <ErrorCard
              className="col-span-full"
              title="Unable to load features"
              description="Please try again later."
            />
          ) : isOverviewCardsLoading ? (
            Array.from({ length: PROMO_SKELETON_COUNT }, (_, index) => index).map((index) => (
              <PromoCardSkelton key={`promo-skeleton-${index}`} index={index} />
            ))
          ) : promoCards.length === 0 ? (
            <p className="col-span-full text-sm text-pagination-text-muted">
              No features available yet.
            </p>
          ) : (
            promoCards.map((card) => (
              <PromoCard
                key={card.id}
                card={card}
                className="w-full max-w-none"
                isLoading={isRegisteringCapabilityInterest}
                activeCapabilityId={activeCapabilityId}
                onRegisterInterest={handleRegisterInterest}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
