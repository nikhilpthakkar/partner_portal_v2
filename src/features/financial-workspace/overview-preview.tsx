'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BarChart3, LineChart } from 'lucide-react';
import MetricCard from '@/components/molecules/MetricCard';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import { Card } from '@/components/ui/card';
import { STATIC_OVERVIEW_RESPONSE } from '@/lib/services/overview/static';
import { money } from './domain';
import { useFinancialWorkspace } from './provider';

/** Local companion to the existing Overview. Its live implementation remains src/features/overview. */
export function OverviewPreview() {
  const { partner } = useParams<{ partner: string }>();
  const { snapshot, view } = useFinancialWorkspace();
  const base = `/${partner}/dashboard`;
  const available = view.balances.reduce((sum, item) => sum + item.available, 0);
  const canShowFloat = snapshot.dataState === 'ready' && view.actor.capabilities.includes('view');
  const { welcomeSubtitle, businessSummaryTitle, newFeaturesTitle } = STATIC_OVERVIEW_RESPONSE;

  return (
    <div className={`${PAGE_LAYOUT_CLASS} pb-10 pt-6`}>
      <PageHeading title="Welcome" subtitle={welcomeSubtitle} />
      <p className="text-xs text-muted-foreground">Local preview · sample overview figures</p>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-pagination-text">Key metrics · October 2026</h2>
          <span className="text-sm text-pagination-text-muted">Sample period</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard card={{ label: 'Total policies issued', value: '1,248' }} />
          <MetricCard card={{ label: 'Gross premium', value: '₹12,48,000' }} />
          <Link
            href={`${base}/financials`}
            className="block rounded-metric-card focus-visible:outline-2 focus-visible:outline-share-policy-primary"
            aria-label="Open financials to inspect float balance"
          >
            <MetricCard
              card={{
                label: 'Float balance',
                value: canShowFloat ? money(available) : '—',
                infoText: 'View the financial dashboard for VAN level balances and source status.',
              }}
              className="h-full"
            />
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-pagination-text">{businessSummaryTitle}</h2>
          <span className="text-sm text-pagination-text-muted">Current month · sample data</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="min-h-72 rounded-xl border-border bg-card p-6">
            <div className="flex items-center gap-2 font-semibold">
              <BarChart3 className="size-5 text-share-policy-primary" />
              Gross premium & policy count trend
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              The live overview keeps its configurable business charts.
            </p>
            <div className="mt-8 flex h-36 items-end justify-around gap-4 border-b border-border px-3">
              {[38, 53, 47, 70, 62, 84, 76].map((height, index) => (
                <div
                  key={index}
                  className="w-9 rounded-t-md bg-share-policy-primary/70"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-around text-xs text-muted-foreground">
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </Card>
          <Card className="min-h-72 rounded-xl border-border bg-card p-6">
            <div className="flex items-center gap-2 font-semibold">
              <LineChart className="size-5 text-balance-coverage-current" />
              Claims trend by status
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Policy and claims performance remain part of Overview.
            </p>
            <div className="mt-8 flex h-36 items-end justify-around gap-4 border-b border-border px-3">
              {[52, 60, 49, 72, 67, 79, 86].map((height, index) => (
                <div
                  key={index}
                  className="w-9 rounded-t-md bg-balance-coverage-current/75"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-around text-xs text-muted-foreground">
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-pagination-text">{newFeaturesTitle}</h2>
        <p className="text-sm text-pagination-text-muted">No features available yet.</p>
      </section>
    </div>
  );
}
