'use client';
import { useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { STORIES, storyComplete, type Story } from './stories';
import { Deliverables } from './deliverables';
import { useFinancialWorkspace } from './provider';
export function SimulatorStudio({
  children,
  onLaunch,
}: {
  children: ReactNode;
  onLaunch: (id: string) => void;
}) {
  const [tab, setTab] = useState('stories'),
    [search, setSearch] = useState('');
  const { configure, pending, setSelectedVan } = useFinancialWorkspace();
  const router = useRouter();
  const { partner } = useParams<{ partner: string }>();
  async function launch(story: Story) {
    await configure(story.topology, story.scenario, story.role);
    if (story.id === 'F01') setSelectedVan('all');
    onLaunch(story.id);
    router.push(`/${partner}/dashboard/${story.route}`);
  }
  return (
    <>
      <div className="flex gap-2 border-b border-border pb-3">
        {[
          ['stories', `Stories (${STORIES.length})`],
          ['controls', 'Controls'],
          ['deliverables', 'Deliverables'],
        ].map(([id, label]) => (
          <Button key={id} variant={tab === id ? 'default' : 'outline'} onClick={() => setTab(id)}>
            {label}
          </Button>
        ))}
      </div>
      {tab === 'controls' ? (
        children
      ) : tab === 'deliverables' ? (
        <Deliverables />
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="Search a persona, job, issue or story"
            aria-label="Search stories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Launching a story resets the synthetic session. Role switching in Controls preserves
            work so you can experience handoffs.
          </p>
          {STORIES.filter((s) =>
            `${s.id} ${s.title} ${s.persona} ${s.jtbd} ${s.source}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          ).map((s) => (
            <div key={s.id} className="rounded-xl border border-border p-4">
              <div className="flex justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-share-policy-primary">
                    {s.id} · {s.persona} · {s.cadence}
                  </span>
                  <h3 className="mt-1 font-semibold">{s.title}</h3>
                </div>
                <Button size="sm" disabled={pending} onClick={() => void launch(s)}>
                  Play story
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.jtbd}</p>
              <p className="mt-3 text-xs">Maps to: {s.source}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
export function StoryGuide({ id, onClose }: { id: string; onClose: () => void }) {
  const { snapshot } = useFinancialWorkspace();
  const [expanded, setExpanded] = useState(true);
  const story = STORIES.find((s) => s.id === id);
  if (!story) return null;
  const complete = storyComplete(story, snapshot);
  return (
    <section className="m-5 mb-0 rounded-xl border border-share-policy-primary/25 bg-icon-select-accent-bg/30 p-4">
      <div className="flex justify-between items-center gap-4">
        <div>
          <p className="text-xs text-share-policy-primary">
            GUIDED STORY · {story.id} · {story.persona}
          </p>
          <h2 className="mt-1 text-sm font-semibold">{story.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">
            {complete === null
              ? 'Review the expected outcome'
              : complete
                ? 'Expected state observed'
                : 'Scenario in progress'}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'Show steps'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Exit story
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-6 text-sm">
          <ol className="list-decimal pl-4 space-y-1">
            {story.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div>
            <p className="font-medium">Expected outcome</p>
            <p className="mt-1 text-muted-foreground">{story.expected}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {story.source} · Fixture clock: 17 Oct 2026, 10:42 IST
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
