import type { Role, Scenario, Topology, Snapshot } from './domain';
export interface Story {
  id: string;
  title: string;
  persona: string;
  jtbd: string;
  cadence: string;
  source: string;
  topology: Topology;
  role: Role;
  scenario: Scenario;
  route: string;
  steps: string[];
  expected: string;
  check:
    | 'scope'
    | 'settled'
    | 'retry'
    | 'correction'
    | 'tax'
    | 'funded'
    | 'blocked'
    | 'review'
    | 'dispute'
    | 'access'
    | 'bulk'
    | 'source'
    | 'manual';
}
export const STORIES: Story[] = [
  {
    id: 'F01',
    title: 'Review Eternal’s four financial accounts',
    persona: 'Group finance',
    jtbd: 'Know which business needs funding while understanding group issuance status.',
    cadence: 'Start of day',
    source: 'Float problem 6 · Eternal confirmed topology',
    topology: 'eternal',
    role: 'eternal-group-finance',
    scenario: 'healthy',
    route: 'financials',
    steps: [
      'Choose All permitted VANs.',
      'Inspect negative Blinkit alongside the other three accounts.',
      'Choose two VANs and compare their selection total.',
      'Open a ledger row and download the filtered statement.',
    ],
    expected:
      'Four distinct VAN balances; each counted once. A negative VAN does not independently block a funded group.',
    check: 'scope',
  },
  {
    id: 'F02',
    title: 'Read a shared VAN with restricted attribution',
    persona: 'Credit Vidya finance',
    jtbd: 'Reconcile the account I fund without exposing another partner’s policy details.',
    cadence: 'Daily reconciliation',
    source: 'Users tracker · Cred / Credit Vidya V2',
    topology: 'cred',
    role: 'credit-vidya',
    scenario: 'healthy',
    route: 'financials',
    steps: [
      'Open VAN-2.',
      'Inspect a ledger row.',
      'Compare the co-participant premium and your own premium.',
      'Download transaction CSV.',
    ],
    expected:
      'Whole-VAN balance stays exact; Cred plan, policy and source attribution are restricted. VAN-1 is absent.',
    check: 'scope',
  },
  {
    id: 'F03',
    title: 'Add a verified deposit',
    persona: 'ACKO reconciliation',
    jtbd: 'Record confirmed funding with a unique UTR and actual date.',
    cadence: 'As funds arrive',
    source: 'Float problem 3 · Master p8',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'healthy',
    route: 'financials',
    steps: [
      'Select VAN-1 → Edit Details → Add deposit.',
      'Enter ₹10,000, DEMO-NEW-UTR-100, 17 Oct 10:40 IST and a reason.',
      'Review and confirm.',
      'Try the same UTR again to see duplicate protection.',
    ],
    expected: 'One ₹10,000 credit. Duplicate reference changes nothing.',
    check: 'manual',
  },
  {
    id: 'F04',
    title: 'Explain a premium correction',
    persona: 'Partner finance',
    jtbd: 'Understand why a prior month’s premium changed and reconcile today’s ledger.',
    cadence: 'Month close',
    source: 'Float problem 1',
    topology: 'eternal',
    role: 'partner-finance',
    scenario: 'correction',
    route: 'financials',
    steps: [
      'Open Balance breakdown.',
      'Click the October row.',
      'Inspect the September effective date, posted date and original reference.',
      'Compare net posted premium on Overview.',
    ],
    expected:
      'The correction is separate from premium issuance; Overview and Financials use the same permitted premium entries.',
    check: 'correction',
  },
  {
    id: 'F05',
    title: 'Post and independently approve a correction',
    persona: 'ACKO poster → Finance approver',
    jtbd: 'Correct an error without overwriting financial history.',
    cadence: 'Exception / month close',
    source: 'Float problems 1 and 7',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'healthy',
    route: 'financials',
    steps: [
      'Edit Details → Correct an existing entry → Premium correction; enter 1250, DEMO-CORR-001, select an original source and explain the error.',
      'Confirm: balance remains unchanged.',
      'In Simulator Controls switch to ACKO Finance approver without resetting.',
      'Review the pending ledger entry and approve with a reason.',
    ],
    expected: 'One separate signed adjustment is posted after a different user approves.',
    check: 'correction',
  },
  {
    id: 'F06',
    title: 'Reconcile TDS and TCS credits',
    persona: 'ACKO reconciliation',
    jtbd: 'Account for verified tax credits distinctly from cash received.',
    cadence: 'Month close / certificate receipt',
    source: 'Float problem 4 · Master p9',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'tax',
    route: 'financials',
    steps: [
      'Inspect non-zero TDS and TCS in the ledger.',
      'Use Edit Details → Add TDS with a new evidence reference.',
      'Review the balance breakdown and transaction CSV.',
    ],
    expected:
      'Tax credits increase balance once and remain separately classified. Rates and certificate service are backend inputs.',
    check: 'tax',
  },
  {
    id: 'F07',
    title: 'Record a completed refund of excess deposit',
    persona: 'ACKO reconciliation',
    jtbd: 'Recognise money leaving the bank on the completed transfer date.',
    cadence: 'On bank settlement',
    source: 'Float problem 3 · Master p8',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'healthy',
    route: 'financials',
    steps: [
      'Edit Details → Refund deposit.',
      'Enter ₹2,000, a unique bank UTR and completed date.',
      'Review the debit before confirming.',
      'Open Balance breakdown → Refund deposit.',
    ],
    expected:
      'One debit on the actual movement date. Future dates and duplicate references are rejected.',
    check: 'manual',
  },
  {
    id: 'F08',
    title: 'Track a pending customer refund',
    persona: 'Finance / refund operations',
    jtbd: 'Keep customer money reserved while the provider is processing it.',
    cadence: 'Daily payout checks',
    source: 'Float problem 2 · Master refund V2',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'refund-pending',
    route: 'manual-refunds',
    steps: [
      'Open refund details; note pending status and no completed date.',
      'Check Financials: bank refund credit and held funds, with available unchanged.',
      'Use Controls → Payout succeeds.',
      'Reopen the refund and ledger.',
    ],
    expected:
      'Success adds one bank debit and releases one hold; available is unchanged by settlement.',
    check: 'settled',
  },
  {
    id: 'F09',
    title: 'Recover a failed payout',
    persona: 'ACKO payout operations',
    jtbd: 'Retry safely without paying twice or releasing the obligation.',
    cadence: 'Exception queue',
    source: 'Float problem 2',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'refund-failed',
    route: 'manual-refunds',
    steps: [
      'View details → Retry payout.',
      'Enter evidence that beneficiary details were corrected.',
      'Confirm: status returns to pending and hold stays.',
      'Use Controls → Payout succeeds and check Settled.',
    ],
    expected: 'The same obligation moves failed → pending → paid, with one credit and one debit.',
    check: 'settled',
  },
  {
    id: 'F10',
    title: 'Complete a manual bank refund',
    persona: 'ACKO payout operations',
    jtbd: 'Link a confirmed offline payment to the failed provider obligation.',
    cadence: 'Exception queue',
    source: 'Float problems 2 and 3',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'offline-refund',
    route: 'manual-refunds',
    steps: [
      'View details → Update UTR details.',
      'Enter DEMO-OFFLINE-100 and 17 Oct 10:42 IST with settlement evidence.',
      'Confirm; inspect completed timestamp and UTR.',
      'Check Settled and the VAN ledger.',
    ],
    expected: 'No debit at initiation. One debit on bank completion and one released hold.',
    check: 'settled',
  },
  {
    id: 'F11',
    title: 'Validate a cancellation batch',
    persona: 'ACKO reconciliation',
    jtbd: 'Process approved policy refunds with a traceable outcome for each row.',
    cadence: 'Cancellation batch',
    source: 'Float problem 5',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'bulk-refund',
    route: 'manual-refunds',
    steps: [
      'Open Bulk refunds, choose VAN-1 and continue.',
      'Review the two fixture policies and choose Bank.',
      'Submit and inspect the new requests in Manual refunds.',
      'Try a duplicate policy in a new batch; the complete batch is rejected before posting.',
    ],
    expected:
      'One bank credit and held obligation per accepted policy. No partial writes for an invalid batch.',
    check: 'bulk',
  },
  {
    id: 'F12',
    title: 'Hold refunds to float during grace',
    persona: 'Finance owner',
    jtbd: 'Avoid restoring issuance using funds that remain ineligible during grace.',
    cadence: 'Funding incident',
    source: 'Float problem 5 · proposed grace hold',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'grace-refund',
    route: 'financials',
    steps: [
      'Inspect booked, held and available on VAN-1.',
      'Note the wallet group remains in grace.',
      'Use Controls → Confirm recovery funding.',
      'Check that the grace hold is released and issuance resumes.',
    ],
    expected:
      'Refund credit does not clear grace by itself. Verified funding clears the negative group before release.',
    check: 'funded',
  },
  {
    id: 'F13',
    title: 'Escalate grace to recovery review',
    persona: 'Finance owner / operations',
    jtbd: 'Know when issuance stops and who must act after recovery expires.',
    cadence: 'Funding incident',
    source: 'Master APD SOP p29–53',
    topology: 'eternal',
    role: 'partner-finance',
    scenario: 'grace',
    route: 'financials',
    steps: [
      'Read the funding deadline and in-app notice.',
      'Use Controls → Expire grace.',
      'Use Controls → Expire recovery.',
      'Inspect communications in Deliverables.',
    ],
    expected: 'Group-level block then manual review. No automatic policy cancellation or replay.',
    check: 'review',
  },
  {
    id: 'F14',
    title: 'Restore issuance after funding',
    persona: 'Finance owner',
    jtbd: 'Confirm funding restored the group and understand what must be retried.',
    cadence: 'Funding incident',
    source: 'Master APD reset SOP',
    topology: 'eternal',
    role: 'eternal-group-finance',
    scenario: 'blocked',
    route: 'financials',
    steps: [
      'Inspect the group block.',
      'Use Controls → Confirm recovery funding.',
      'Read the restored status and notification.',
    ],
    expected:
      'Positive verified group funding restores issuance. Previously blocked requests need a new request.',
    check: 'funded',
  },
  {
    id: 'F15',
    title: 'Investigate an unmatched bank credit',
    persona: 'ACKO reconciliation',
    jtbd: 'Avoid crediting money until the bank reference is matched to the VAN.',
    cadence: 'Daily reconciliation',
    source: 'Float problem 3',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'unmatched',
    route: 'financials',
    steps: [
      'Inspect Deposits awaiting match.',
      'Use the pending bank-credit action to verify its reference and match.',
      'Review the posted entry.',
    ],
    expected: 'The pending credit affects balance only after verified match, once.',
    check: 'manual',
  },
  {
    id: 'F16',
    title: 'Raise a scoped discrepancy',
    persona: 'Partner finance',
    jtbd: 'Report a discrepancy with enough context for Finance to resolve it.',
    cadence: 'Reconciliation exception',
    source: 'Float problem 1 / existing dispute',
    topology: 'eternal',
    role: 'partner-finance',
    scenario: 'healthy',
    route: 'financials',
    steps: [
      'Select one or more ledger periods in a single VAN.',
      'Raise dispute with a reason.',
      'Review and confirm.',
      'Inspect its status in the financial alerts.',
    ],
    expected: 'The dispute records the selected VAN and periods; it does not alter any balance.',
    check: 'dispute',
  },
  {
    id: 'F17',
    title: 'Manage independent grants',
    persona: 'Partner super admin',
    jtbd: 'Give a colleague only the accounts and plans needed for their job.',
    cadence: 'Onboarding / monthly access review',
    source: 'Users tracker · float problem 7',
    topology: 'cred',
    role: 'super-admin',
    scenario: 'access-review',
    route: 'settings/access-management',
    steps: [
      'Edit Partner finance · view only.',
      'Grant only VAN-2 and no operational plans; keep View and Export.',
      'Review and save.',
      'Switch persona to that user without resetting; inspect Financials and Manual refunds.',
    ],
    expected:
      'VAN-2 is visible, while operational refund records are inaccessible. Financial access does not imply plan access.',
    check: 'access',
  },
  {
    id: 'F18',
    title: 'Deactivate a colleague’s access',
    persona: 'Partner super admin',
    jtbd: 'Remove departed staff access without changing ledger ownership.',
    cadence: 'Offboarding',
    source: 'Float problem 7',
    topology: 'eternal',
    role: 'super-admin',
    scenario: 'healthy',
    route: 'settings/access-management',
    steps: [
      'Edit Partner finance · view only → Deactivate access.',
      'Review and confirm.',
      'Switch to that persona without resetting.',
    ],
    expected: 'Balances, statements and operational data disappear; ledger entries remain intact.',
    check: 'access',
  },
  {
    id: 'F19',
    title: 'Read only means no financial mutation',
    persona: 'Account manager / finance viewer',
    jtbd: 'Help a partner investigate without receiving money movement powers.',
    cadence: 'Support review',
    source: 'Role matrix / users tracker',
    topology: 'eternal',
    role: 'account-manager',
    scenario: 'healthy',
    route: 'financials',
    steps: [
      'Inspect a statement and export it.',
      'Check that Edit Details and Raise dispute are absent.',
      'Open Settings → Access management.',
    ],
    expected:
      'Read and export are available. Posting, approving and user administration are unavailable.',
    check: 'scope',
  },
  {
    id: 'F20',
    title: 'Recover from a service failure',
    persona: 'Partner finance',
    jtbd: 'Retry without losing my work or duplicating a request.',
    cadence: 'Any submitted action',
    source: 'Failure-state design',
    topology: 'eternal',
    role: 'partner-finance',
    scenario: 'healthy',
    route: 'financials',
    steps: [
      'Controls → Fail the next submitted action.',
      'Select a ledger row and raise a dispute.',
      'Confirm; the error preserves the form.',
      'Retry the same form.',
    ],
    expected: 'One successful dispute after retry. No balance change.',
    check: 'dispute',
  },
  {
    id: 'F21',
    title: 'Handle unverified source data',
    persona: 'Partner finance',
    jtbd: 'Distinguish an old number from a trustworthy current balance.',
    cadence: 'Source delay',
    source: 'Float problem 1 · reconciliation',
    topology: 'eternal',
    role: 'partner-finance',
    scenario: 'mismatch',
    route: 'financials',
    steps: [
      'Inspect source mismatch and unverified status.',
      'Check Overview: unverified financial values are withheld.',
      'Use Controls → Sources refresh.',
    ],
    expected: 'Status becomes verified only after the simulated source refresh.',
    check: 'source',
  },
  {
    id: 'F22',
    title: 'Resolve an interrupted response without duplicate posting',
    persona: 'ACKO reconciliation',
    jtbd: 'Find out whether a request completed before deciding to retry.',
    cadence: 'Network interruption',
    source: 'Idempotency and unknown-outcome contract',
    topology: 'eternal',
    role: 'reconciliation',
    scenario: 'healthy',
    route: 'financials',
    steps: [
      'Controls → Interrupt response after commit.',
      'Use Edit Details to add a deposit with a unique UTR.',
      'Confirm; the response is interrupted and resubmission is blocked.',
      'Check request status in the dialog; the original entry appears once.',
    ],
    expected:
      'A lost response never means an automatic retry. Outcome lookup confirms the original operation.',
    check: 'manual',
  },
  {
    id: 'F23',
    title: 'Recognise a group with APD disabled',
    persona: 'Finance owner / operations',
    jtbd: 'Understand whether a negative balance automatically changes issuance eligibility.',
    cadence: 'Configuration review',
    source: 'Master APD enabled/disabled per wallet group',
    topology: 'eternal',
    role: 'eternal-group-finance',
    scenario: 'apd-disabled',
    route: 'financials',
    steps: [
      'Select all permitted VANs and inspect the negative selection total.',
      'Read the automatic funding restrictions banner.',
      'Open Controls: automatic grace/recovery transitions are unavailable.',
    ],
    expected:
      'The financial ledger remains visible while automatic APD rules are inactive. A negative balance is not shown as a triggered block.',
    check: 'manual',
  },
  ...(['empty', 'error', 'loading', 'no-access', 'stale'] as Scenario[]).map(
    (scenario, i): Story => ({
      id: `S0${i + 1}`,
      title: (
        {
          empty: 'New account without financial history',
          error: 'Data load failure and retry',
          loading: 'Waiting for financial data',
          'no-access': 'Access revoked during a session',
          stale: 'Delayed source snapshot',
        } as Record<string, string>
      )[scenario],
      persona: 'Partner finance',
      jtbd: 'Understand why information is unavailable and the appropriate next step.',
      cadence: 'System exception',
      source: 'Source/access state design',
      topology: 'eternal',
      role: 'partner-finance',
      scenario,
      route: 'financials',
      steps: [
        'Read the state-specific explanation.',
        scenario === 'no-access'
          ? 'Contact the access administrator; a refresh cannot restore a grant.'
          : scenario === 'empty'
            ? 'No opening balance is fabricated; wait for verified data.'
            : 'Use retry / source refresh and compare the result.',
      ],
      expected: 'No silent zero, false success or hidden access escalation.',
      check: 'manual',
    }),
  ),
];
export function storyComplete(story: Story, s: Snapshot): boolean | null {
  switch (story.check) {
    case 'settled':
      return s.cases.some((c) => c.kind === 'refund' && c.status === 'paid');
    case 'correction':
      return s.movements.some((m) => m.kind === 'premium-adjustment' && !!m.corrects);
    case 'tax':
      return s.movements.some((m) => m.kind === 'tds') && s.movements.some((m) => m.kind === 'tcs');
    case 'funded':
      return (
        ['healthy', 'low'].includes(s.apd) &&
        s.audit.some((a) => a.title.includes('Funding confirmed'))
      );
    case 'blocked':
      return s.apd === 'blocked';
    case 'review':
      return s.apd === 'recovery';
    case 'dispute':
      return s.cases.some((c) => c.kind === 'dispute');
    case 'access':
      return s.audit.some((a) => a.title === 'User access updated');
    case 'bulk':
      return s.cases.some((c) => c.id.startsWith('BULK-'));
    case 'source':
      return s.reconciliation === 'matched' && s.dataState === 'ready';
    default:
      return null;
  }
}
