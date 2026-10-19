'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import { cn } from '@/lib/utils';
import { exportStatements } from './domain';
import { useFinancialWorkspace } from './provider';
import { DataGate, EmptyState, SourceLine } from './common';

export function FinancialStatements() {
  const { snapshot, view, role, failNextAction, setFailNextAction } = useFinancialWorkspace();
  const [downloadError, setDownloadError] = useState('');
  const download = (vanIds: string[]) => {
    try {
      if (failNextAction) {
        setFailNextAction(false);
        throw new Error('Statement download failed. Please retry; your scope is preserved.');
      }
      const csv = exportStatements(snapshot, role, vanIds);
      const href = URL.createObjectURL(
        new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }),
      );
      const a = document.createElement('a');
      a.href = href;
      a.download = `${snapshot.groupId}-${vanIds.length > 1 ? 'all-permitted-vans' : vanIds[0]}-statement.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      setDownloadError('');
      toast.success(
        vanIds.length > 1
          ? `${vanIds.length} VAN statements downloaded together`
          : 'Statement downloaded',
      );
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Download failed');
    }
  };
  return (
    <div className={cn(PAGE_LAYOUT_CLASS, 'pb-10 pt-6')}>
      <PageHeading
        title="Statements & reports"
        subtitle="Download a separate financial statement for each VAN in your access scope."
      />
      <DataGate>
        <SourceLine />
        {downloadError && (
          <p role="alert" className="finance-danger rounded-lg border p-4 text-sm">
            {downloadError}
          </p>
        )}
        <section className="finance-panel">
          <div className="finance-panel-head">
            <h2>VAN statements</h2>
            {view.balances.length > 1 && snapshot.dataState !== 'empty' && (
              <Button
                variant="outline"
                onClick={() => download(view.balances.map((b) => b.van.id))}
              >
                <Download /> Download all permitted VANs
              </Button>
            )}
          </div>
          {snapshot.dataState === 'empty' ? (
            <EmptyState
              title="No statements available yet"
              description="A statement becomes available once the verified opening and posted activity are available."
            />
          ) : (
            <div className="divide-y divide-border">
              {view.balances.map((b) => (
                <div
                  key={b.van.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-icon-select-accent-bg p-3">
                      <FileText className="size-5 text-share-policy-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">
                        {b.van.id} · {b.van.label}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Opening, posted movements and closing · source cutoff · mapping version
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => download([b.van.id])}>
                    <Download /> Download CSV
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </DataGate>
    </div>
  );
}
