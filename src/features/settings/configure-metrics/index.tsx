'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PageHeading } from '@/components/molecules/PageHeading';
import {
  CONFIGURE_METRICS_CHART_CATALOG,
  CONFIGURE_METRICS_KPI_CATALOG,
  CONFIGURE_METRICS_NAV_ITEMS,
  CONFIGURE_METRICS_PAGE_HEADER,
  getAllConfigureMetricsChartIds,
  getAllConfigureMetricsKpiIds,
  parseEnabledChartIdsFromConfig,
  parseEnabledKpiIdsFromConfig,
  type ConfigureMetricsCatalogItem,
} from '@/lib/constants/configureMetrics.constants';
import { POLICIES_BY_TENURE_DISTRIBUTION_CHART_ID } from '@/lib/constants/tenureDistribution.constants';
import TenureDistributionChartCard from './TenureDistributionChartCard';
import {
  DEFAULT_TENURE_DISTRIBUTION_SETTINGS,
  hasTenureDistributionValidationErrors,
  type TenureDistributionSettings,
} from '@/lib/types/overview/tenureDistribution';
import { useOverviewConfigQuery } from '@/lib/query/overview/overviewConfig.queries';
import { useUpdateOverviewConfigMutation } from '@/lib/query/overview/overviewConfig.mutations';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { buildPartnerOverviewConfigurationRequest, parseTenureDistributionSettingsFromOverviewConfig } from '@/lib/utils/overview/overviewConfig.utils';
import { cn } from '@/lib/utils';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackSettingsLoadException,
  trackSettingsPageView,
  trackSettingsSave,
  trackSettingsSaveException,
  trackSettingsSearch,
  trackSettingsSwitchNav,
  trackSettingsToggleChart,
  trackSettingsToggleKpi,
  trackSettingsValidationException,
} from '@/lib/segment/track/settings';

function ConfigureMetricsToggleCard({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-3 rounded-md border border-border bg-card px-4">
      <span className="text-sm font-medium leading-none text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}

function ConfigureMetricsSection({
  title,
  description,
  items,
  enabledIds,
  onToggle,
  columnsClassName,
}: {
  title: string;
  description: string;
  items: ConfigureMetricsCatalogItem[];
  enabledIds: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
  columnsClassName: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={cn('grid items-start gap-3', columnsClassName)}>
        {items.map((item) => (
          <ConfigureMetricsToggleCard
            key={item.id}
            label={item.label}
            checked={enabledIds.has(item.id)}
            onCheckedChange={(checked) => onToggle(item.id, checked)}
          />
        ))}
      </div>
    </section>
  );
}

export default function ConfigureMetricsSettings() {
  const pathname = usePathname();
  const { partner } = useParams<{ partner: string }>();
  const dashboardBasePath = `/${partner}/dashboard`;
  const settingsBasePath = `${dashboardBasePath}/settings`;

  const { isReady } = usePartnerConfigReady();
  const segmentBase = useSegmentPartnerBase();
  const { data: config, isLoading, isFetching, isError, error } = useOverviewConfigQuery();
  const updateConfigMutation = useUpdateOverviewConfigMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [enabledKpiIds, setEnabledKpiIds] = useState<Set<string>>(getAllConfigureMetricsKpiIds);
  const [enabledChartIds, setEnabledChartIds] = useState<Set<string>>(getAllConfigureMetricsChartIds);
  const [tenureDistributionSettings, setTenureDistributionSettings] =
    useState<TenureDistributionSettings>(DEFAULT_TENURE_DISTRIBUTION_SETTINGS);
  const [saveAttempted, setSaveAttempted] = useState(false);

  useEffect(() => {
    trackSettingsPageView(segmentBase);
  }, [segmentBase]);

  useEffect(() => {
    if (!isError) {
      return;
    }

    trackSettingsLoadException(segmentBase, {
      exception_message: error instanceof Error ? error.message : undefined,
    });
  }, [error, isError, segmentBase]);

  useEffect(() => {
    if (!config) {
      return;
    }

    const kpiIds = parseEnabledKpiIdsFromConfig(config.kpis.map((item) => item.id));
    const chartIds = parseEnabledChartIdsFromConfig(config.charts.map((item) => item.id));

    setEnabledKpiIds(kpiIds.size > 0 ? kpiIds : getAllConfigureMetricsKpiIds());
    setEnabledChartIds(chartIds.size > 0 ? chartIds : getAllConfigureMetricsChartIds());
    setTenureDistributionSettings(parseTenureDistributionSettingsFromOverviewConfig(config));
    setSaveAttempted(false);
  }, [config]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredKpiCatalog = useMemo(
    () =>
      CONFIGURE_METRICS_KPI_CATALOG.filter((item) =>
        item.label.toLowerCase().includes(normalizedSearch),
      ),
    [normalizedSearch],
  );

  const filteredChartCatalog = useMemo(
    () =>
      CONFIGURE_METRICS_CHART_CATALOG.filter((item) =>
        item.label.toLowerCase().includes(normalizedSearch),
      ),
    [normalizedSearch],
  );

  const handleKpiToggle = (id: string, checked: boolean) => {
    trackSettingsToggleKpi(segmentBase, { entity_name: id, enabled: checked });
    setEnabledKpiIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleChartToggle = (id: string, checked: boolean) => {
    trackSettingsToggleChart(segmentBase, { entity_name: id, enabled: checked });
    setEnabledChartIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSave = () => {
    setSaveAttempted(true);
    trackSettingsSave(segmentBase);

    const isTenureChartEnabled = enabledChartIds.has(POLICIES_BY_TENURE_DISTRIBUTION_CHART_ID);
    if (
      isTenureChartEnabled &&
      hasTenureDistributionValidationErrors(tenureDistributionSettings)
    ) {
      trackSettingsValidationException(segmentBase);
      return;
    }

    updateConfigMutation.mutate(
      buildPartnerOverviewConfigurationRequest({
        kpiCatalog: CONFIGURE_METRICS_KPI_CATALOG,
        chartCatalog: CONFIGURE_METRICS_CHART_CATALOG,
        enabledKpiIds,
        enabledChartIds,
        tenureDistributionSettings,
      }),
      {
        onError: (mutationError) => {
          trackSettingsSaveException(segmentBase, {
            exception_message:
              mutationError instanceof Error ? mutationError.message : undefined,
          });
        },
      },
    );
  };

  const isSaving = updateConfigMutation.isPending;
  const isConfigLoading = !isReady || isLoading || isFetching;
  const controlsDisabled = isConfigLoading || isSaving;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 px-6 py-3">
      <PageHeading
        title={CONFIGURE_METRICS_PAGE_HEADER.title}
        subtitle={CONFIGURE_METRICS_PAGE_HEADER.subtitle}
        actions={
          <div className="relative w-full max-w-xs">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search metrics"
              className="pl-9"
            />
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 gap-6">
        <aside className="w-[210px] shrink-0">
          <nav className="flex flex-col gap-1">
            {CONFIGURE_METRICS_NAV_ITEMS.map((item) => {
              const href = `${settingsBasePath}/${item.href}`;
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={() => trackSettingsSwitchNav(segmentBase, item.id)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-foreground">Configure metrics</h2>
              <p className="text-sm text-muted-foreground">
                Select the KPIs and charts to display on the partner&apos;s overview page.
                Configuration is per product type.
              </p>
            </div>

            <ConfigureMetricsSection
              title="Key metrics"
              description="Toggle which KPI cards are visible on the overview for this product type."
              items={filteredKpiCatalog}
              enabledIds={enabledKpiIds}
              onToggle={handleKpiToggle}
              columnsClassName="grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            />

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">Charts</h3>
                <p className="text-sm text-muted-foreground">
                  Enable charts and set their default configuration. Partners can adjust filters
                  in-session but defaults persist.
                </p>
              </div>
              {filteredChartCatalog.length > 0 ? (
                <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
                  {filteredChartCatalog.map((item) => {
                    if (item.id === POLICIES_BY_TENURE_DISTRIBUTION_CHART_ID) {
                      return (
                        <TenureDistributionChartCard
                          key={item.id}
                          checked={enabledChartIds.has(item.id)}
                          onCheckedChange={(checked) => handleChartToggle(item.id, checked)}
                          settings={tenureDistributionSettings}
                          onSettingsChange={setTenureDistributionSettings}
                          disabled={controlsDisabled}
                          validateOnSave={saveAttempted}
                        />
                      );
                    }

                    return (
                      <ConfigureMetricsToggleCard
                        key={item.id}
                        label={item.label}
                        checked={enabledChartIds.has(item.id)}
                        onCheckedChange={(checked) => handleChartToggle(item.id, checked)}
                      />
                    );
                  })}
                </div>
              ) : null}
            </section>
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-end border-t border-border bg-configure-metrics-footer-bg px-6 py-3.5">
            <Button
              type="button"
              onClick={handleSave}
              disabled={controlsDisabled}
              className="bg-configure-metrics-save-button-bg text-sm font-medium leading-5 text-configure-metrics-save-button-text hover:bg-configure-metrics-save-button-bg-hover"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}
