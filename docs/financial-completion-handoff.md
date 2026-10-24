# Partner Portal financial completion — review and integration handoff

This branch enhances the existing portal with a deterministic frontend reference implementation. It does not connect to FinAcko, Cashfree, banking, IAM, notification delivery or tax certificate services. All new finance stories use synthetic data and a fixed cutoff of 17 October 2026, 10:42 IST. Live integration remains off; the deployable review mode is explicitly opted in and uses the same synthetic adapter.

## Review versions

- `main`, tag `baseline-minimal-financials`: clean snapshot of the previously reviewed minimal implementation. Original ACKO revision: `d0ce37a809ffc3457f7acd529e1716df5df5b429`. No upstream Git history or local proxy identity was published.
- `codex/financial-completion`: additive financial workflow enhancements. Existing source modules are retained. The upstream HEAD was checked and matched the original revision on 19 October 2026.
- The destination repository was made private with the owner's explicit approval.

## What the comparison established

| Area              | Original portal                                                 | Minimal simulator                  | This branch                                                                                                                           |
| ----------------- | --------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Overview          | Existing configurable KPI/chart page                            | Simplified sample page             | Original component reused; financial KPI amounts from shared finance snapshot                                                         |
| Financials        | Ledger, filters, export, dispute, permission-based Edit Details | VAN cards and ledger, dispute only | Existing table pattern plus single/all/subset VANs, explicit adjustments, review, tax entry, filtered exports and calculation details |
| Edit Details      | Existing AddTransactionModal/API workflow                       | Missing                            | VAN-scoped deposit, completed refund deposit, TDS/TCS, deposit/premium correction; independent correction review                      |
| Manual refunds    | All/Initiated/Settled list, filters, details and UTR update     | Read-only obligation list          | Plan-scoped list/detail, pending/failed/paid, retry, completed bank UTR and timestamp; existing live source retained                  |
| Settings          | Configure metrics                                               | Hidden from simulator              | Original Configure metrics plus new access management module                                                                          |
| Policies / claims | Existing operational screens and API flows                      | Disabled navigation                | Original screens reachable with illustrative records; unsupported operational mutations fail explicitly, never pretend to persist     |
| Reports           | Existing report/embed workflow                                  | VAN CSV only                       | Statements plus original business reports                                                                                             |
| APD               | Backend-dependent                                               | Fixture grace/block/recovery       | Guided funding, holds, recovery and manual-review stories; fixture policy remains subject to approval                                 |
| User access       | Existing coarse permissions                                     | Hardcoded roles                    | Editable, independent VAN/plan grants, view/action examples, invite/deactivate, bounded delegation, self-edit rejection               |
| Review tooling    | None                                                            | Scenario dropdown                  | Searchable JTBD stories, observed outcomes, controls, communications, component/state library                                         |

The original portal had greater coverage of existing operational workflows than the minimal simulator. Neither the original UI nor the earlier broad prototype proved the new accounting rules were complete. Removed speculative Financials tabs (Plan activity, Cases & approvals, Wallet group, Audit trail, Report transfer) have not been restored. Necessary decisions appear within ledger/refund/settings workflows.

## Multiple wallet groups

Stories F24–F29 add a portfolio view for a user assigned to two wallet groups. A VAN belongs to exactly one group. Each group keeps its own VAN registry, ledger, source state, funding rules and issuance status. The **All** view sums available balances only from accounts the user can view, labels the result as a cross-group *view total*, and shows each group’s status separately. It withholds the combined amount if either group has stale or unreconciled data. The sum never determines issuance or funding eligibility.

Group assignment initially grants all its VANs; an administrator can narrow that grant to named VANs in Settings. Access is checked again for each group and operation. A partner super admin can rename a group or delegate the separate `manage-group` capability. The editable display name has no effect on the stable group ID, historical ledger, or mappings. Partner IDs appear as associations under each wallet group, rather than driving the navigation.

The sample portfolio deliberately uses distinct VAN identities: WG-ETERNAL has VAN-1–4; WG-LENDING has VAN-5–6. Its numbers and second group are synthetic examples for UX and contract review, not an assertion about an actual ACKO partner topology. Before integration, the BFF needs a canonical wallet-group/VAN registry, one authenticated person identity with per-group grants, group-scoped read and command routes, server-side scope checks on exports and notifications, and an auditable group-name update. The proposed shapes in `contracts.ts` carry `walletGroupId` on every financial read and command. Returning an unrestricted cross-group ledger or accepting a VAN ID without its group is outside the contract.

## Start locally

Use the Node version in `.nvmrc` and the pinned pnpm version. The ACKO package dependency may require the developer's existing authorized registry setup.

```sh
pnpm install --frozen-lockfile
cp .env.financial-simulator.example .env.local
pnpm exec next dev --webpack --hostname 127.0.0.1 --port 3010
```

Open `/demo/dashboard/financials`. Desktop is the review target. Local simulator mode requires `NEXT_PUBLIC_FINANCIAL_SIMULATOR=true`. A separately opted-in synthetic review build is also available; normal production builds retain authentication. Local environment files and dependency caches stay ignored.

Use **Simulator → Stories** to launch a scenario. Launch resets the synthetic session. Switching personas in **Controls** preserves the session for maker/approver and access handoffs. Reloading resets fixtures. Invited users become selectable in Controls; this is a local preview, not a sent invitation.

Use **Deliverables** for 18 event templates with email, in-app and SMS variants; preview/queued/delivered/failed/suppressed delivery specimens; empty, filtered, loading, service failure, revoked access, delayed source, validation, duplicate and unknown-outcome specimens; and new UI compositions.

## Accounting invariants implemented in the reference model

All amounts are integer paise. For each VAN:

`Closing = Opening + Deposits + Deposit adjustments − Completed deposit refunds − Premium + Premium adjustments + Float refunds + Bank refund credits − Settled bank payouts + TDS + TCS`

`Held = unsettled bank obligations + unreleased refunds to float raised during grace`

`Available = Closing − Held`

Charges are not invented. TDS/TCS are manual verified credits; statutory rate calculation, tax base determination, certificate ingestion/matching and reconciliation are backend/business dependencies.

- A cancellation to bank credits booked money and creates a matching hold. Failure and retry retain it. Settlement debits exactly once and releases it; available money is unchanged by that settlement.
- Manual settlement requires a failed provider obligation, a unique bank UTR and completed timestamp no earlier than cancellation and no later than the snapshot. The BFF must prove no provider attempt is still in flight.
- A completed refund of excess deposit debits on actual bank movement time. It is separate from policy refunds.
- Corrections are additive, link to the original source, retain effective/posted dates and require a different Finance approver. No mutation of the original entry.
- Batch cancellation validates all rows before any write. Each accepted policy produces its own obligation. The sample accepts `DEMO-POL-*`; production must obtain eligibility, amount and destination from the cancellation service, not trust the uploaded amount.
- Refund-to-float grace holds release only after verified funding makes the group eligible without using those holds. This rule is a source-document proposal awaiting Finance approval.
- APD counts distinct member VANs once. Selection totals never drive group issuance. No automatic cancellation or replay follows recovery expiry.
- Ledger exports use the displayed date/account/search filters. Transaction CSV contains only entries in those ledger periods. Per-period opening plus displayed movements reconciles to closing; effective dates do not rewrite historical postings.
- Shared-VAN totals include all ledger money while restricted policy/source attribution is withheld. The server must apply the same disclosure policy to every view and export.

## Source-to-workflow coverage

See `coverage-matrix.csv` and `src/features/financial-workspace/stories.ts`. The seven float-balance problem areas are mapped to executable stories. The user-provided Eternal topology is one WG, four VANs and separate partner IDs. Cred V2 sharing follows the supplied users tracker.

Documents are evidence and proposals, not automatic approval. The reference model chooses explicit behavior for review. These decisions still need Finance/Product confirmation before release:

1. Available balance versus booked balance as the canonical APD basis and exact eligible hold types.
2. Failed-bank hold release policy and treatment of grace-period refunds to float.
3. Correction approval thresholds and the identities authorized to post/approve taxes or offline money.
4. Disclosure rights for a shared VAN's full money while source attribution is restricted.
5. Grace/recovery durations, threshold configuration, reminder recipients/channels, claims exceptions and recovery cancellation decisions.
6. Tax treatment, certificate reconciliation, charges, backdated posting and period-close policy.

## Backend integration boundary

`gateway.ts` is the local adapter boundary. The simulator accepts a snapshot and a role to run deterministic transitions; **do not send those as authority to production**. The server derives actor and grants from the authenticated session. `contracts.ts` documents the proposed transport shapes without claiming existing BFF endpoints support them.

Required services:

| Service           | Responsibility                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Snapshot / ledger | Authoritative postings, openings, holds, source watermark, reconciliation, revision, fiscal periods, paging and export jobs          |
| Commands          | Atomic authorization, expected revision, idempotency key, validation, immutable audit and command outcome lookup                     |
| Payout            | Verified callback authenticity; correlation to obligation and attempt; deduplication; retry eligibility and true completed timestamp |
| Cancellation      | Approved per-policy amount/destination, bulk validation, claims exceptions, partial external payout outcomes                         |
| Entitlements      | Independent VAN and plan grants, module action permissions, invite delivery, hierarchy, revocation and authoritative audit           |
| APD               | Whole-group state machine, configured deadlines, reminder stop/reset, recovery reports; no UI-driven issuance decision               |
| Notifications     | Approved event/audience templates, deduplicated schedules, secure deep links, delivery state and retry                               |
| VAN registry      | Ackcelerator/VAM generation, onboarding, versioned plan mapping and activation; outside this portal UI                               |

The unknown-outcome story executes a local command but withholds its acknowledgment. It blocks resubmission until a lookup reveals that original result. Production must persist and resolve that request on the server; the browser's in-memory fixture is not durable idempotency.

Existing operational screen samples are separate illustrative records, not a reconciled policy system. Unsupported mutations in those original screens fail explicitly. The existing live API path remains intact when the simulator flag is off. A frontend handoff is not confirmation of real banking accuracy or operational deployment.

## Developer map

- `domain.ts`: money types, fixture scenarios, commands, holds, independent grants and guarded transitions.
- `ledger.ts`: period summaries, partial-range opening balance, CSV outputs and reconciliation.
- `provider.tsx`: async command handling, generation guard, injected failure, lost acknowledgment and outcome lookup.
- `ledger-screen.tsx` / `workflow-dialogs.tsx`: existing financial table pattern and scoped reviews.
- `manual-refunds-screen.tsx`: operational plan scope, bank status/detail, retry and manual UTR settlement.
- `access-screen.tsx`: Settings users, independent grants, review and local audit.
- `stories.ts` / `simulator-studio.tsx`: persona/JTBD/source mapping, guided tasks and observable outcomes.
- `deliverables.tsx`: communication/state/component specimens.
- `legacy-bridge.tsx` / `localDemo/adapter.ts`: local-only bridge for original portal pages; no live API call from preview mode.

## Verification

Run `pnpm test:financials`, `pnpm exec tsc --noEmit --incremental false`, ESLint on changed source files, and `pnpm exec next build --webpack`. Tests verify balanced event classification, holds/settlements, duplicate guards, approval separation, partial-period statements, access revocation and scenario fixture validity. Browser review covers actual dialog/navigation behavior separately. Keep unknown backend contracts explicit in planning and QA.

Verified after the annotated review: 33 domain/ledger/access/configuration tests passed; TypeScript, changed-file ESLint, and the production review build passed. Browser walkthroughs verified all-four-account dashboard grouping, breakdown tabs, product-attributed deposit posting, verified bank matching, direct failed-refund actions and deep links, bulk-refund submission, Settings tabs and shared-VAN restricted attribution. The compiled production-mode server returned 200 for the demo, redirected a non-demo partner route to the review entry, and returned 404 for the server API route. The simulator contains 28 stories.

## Annotated workflow review — 19 October 2026

Branch: `financials-workflow-update`, based on `codex/financial-completion`.

- The dashboard owns the VAN selector, source timestamp, selected account cards and aggregate footer. A negative account remains visibly negative even when the group is funded.
- Exceptions appear above the dashboard, with scoped bank-match, refund-bank-details, refund-history and dispute-resolution actions. No healthy APD banner is presented to partners.
- The ledger defaults to Summary columns, with a Balance breakdown tab. Date and aggregation controls sit alongside the existing ledger section tabs. One download icon exports the filtered ledger; transaction-level export remains available in the ledger service for integration, with no duplicate toolbar CTA.
- Edit ledger details retains the four original entry choices and mapped Products selection. Product attribution is validated against VAN mapping and operational grants, without splitting or duplicating the account balance. Existing-entry corrections require a separate approver.
- Bulk refunds now starts on Manual refunds (F11); the account chooser precedes the policy batch. Failed refund alerts deep-link to the specific refund for history, retry and UTR recording.
- Settings uses top tabs and full-width content for both Access management and Configure metrics. Confirmation buttons use the existing brand colour.

## Deploy this synthetic review branch

Use an isolated review deployment. All data is synthetic and session-local; refreshing resets the scenario. No bank transfers, customer messages or live partner changes are sent.

1. Checkout `financials-workflow-update`.
2. Install with `pnpm install --frozen-lockfile` using Node 22+ and pnpm 11. The existing ACKO private package registry must be reachable and authorized on the build runner; no registry credentials are committed here.
3. Build with `pnpm build:review` (sets both `NEXT_PUBLIC_FINANCIAL_SIMULATOR=true` and `NEXT_PUBLIC_FINANCIAL_REVIEW=true` at build time).
4. Start with `pnpm start`. Open `/demo/dashboard/financials`, then Workflow simulator → Stories.

On a hosting service, set the build command to `pnpm build:review` and start command to `pnpm start`. Alternatively supply both flags at **build time** with the normal build command. A prebuilt live bundle cannot be switched into review mode by setting runtime-only flags.

Review mode confines page requests to `/demo/dashboard/`, redirects other page paths to the synthetic Financials screen, disables the server API proxy, uses the local adapter for legacy data, and skips live analytics/auth providers. A normal build without the review flag keeps the live authentication path. Do not enable this mode on a live partner deployment.
