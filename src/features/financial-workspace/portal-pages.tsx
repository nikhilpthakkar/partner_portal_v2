'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Overview from '@/features/overview';
import Reports from '@/features/reports';
import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import { FinancialStatements } from './statements-screen';
import { useFinancialWorkspace } from './provider';
import { SourceLine } from './common';
export function PortalOverview() {
  const { partner } = useParams<{ partner: string }>();
  const { snapshot } = useFinancialWorkspace();
  return (
    <>
      <div className="mx-6 mt-5 flex items-center justify-between gap-4 rounded-lg bg-muted p-3 text-xs">
        <p>
          Existing overview · sample operational charts. Financial KPIs use the same permitted VAN
          snapshot as Financials ({snapshot.cutoff.slice(0, 10)}).
        </p>
        <Link
          className="text-share-policy-primary underline whitespace-nowrap"
          href={`/${partner}/dashboard/financials`}
        >
          Open financials
        </Link>
      </div>
      <div className="mx-6 mt-3">
        <SourceLine />
      </div>
      <Overview />
    </>
  );
}
export function PortalReports() {
  const [tab, setTab] = useState('statements');
  return (
    <>
      <div className="px-6 pt-4">
        <UnderlineTabs
          value={tab}
          onValueChange={setTab}
          tabs={[
            { value: 'statements', label: 'Financial statements' },
            { value: 'reports', label: 'Business reports' },
          ]}
        />
      </div>
      {tab === 'statements' ? (
        <FinancialStatements />
      ) : (
        <>
          <p className="px-6 pt-4 text-xs text-muted-foreground">
            Existing report workflow · local sample report.
          </p>
          <Reports />
        </>
      )}
    </>
  );
}
