# Partner financial workflows — local implementation

This branch integrates the proposed financial workspace into the existing Next.js portal routes and reuses its shadcn components, Euclid typography, purple actions, metric cards, table styles and design tokens. It is a frontend reference implementation with synthetic data, not a connection to banking, payout or insurance services.

## Run and review

Use Node 24 and the repository's pinned pnpm version.

```sh
pnpm install --frozen-lockfile
cp .env.financial-simulator.example .env.local
pnpm exec next dev --webpack --hostname 127.0.0.1 --port 3010
```

Open `http://127.0.0.1:3010/demo/dashboard/overview`. No VPN or API proxy is needed for this mode. The feature requires both `NODE_ENV=development` and `NEXT_PUBLIC_FINANCIAL_SIMULATOR=true`. The login redirect exemption additionally requires a loopback hostname. Analytics and live provider initialization are skipped in this mode. Production continues to use the original screens and authentication path. `.env.local` stays ignored.

Desktop is the target. The sidebar and multi-column workspace remain visible; narrow windows scroll horizontally instead of switching to a mobile navigation/layout. Use a desktop browser window around 1280px or wider for review.

The header's **Simulator** opens persona, topology and scenario controls. Loading a scenario or changing topology resets workflow changes. Navigation preserves the session; a full reload resets synthetic data. All dates, deadlines, amounts, thresholds and source IDs are fixtures. The local role **Eternal group finance · 4 VANs** illustrates an explicit cross-partner financial grant; it is not an assertion that a current user has this access.

## Integrated routes

| Route under `/demo/dashboard` | Experience                                                                                                                                                                                                                                                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/overview`                   | Existing business overview structure: welcome, key metrics, performance charts and feature cards. The local preview uses clearly labeled sample business data. The live `src/features/overview` implementation is retained                                                                                                             |
| `/financials`                 | Original ledger-summary structure and columns, financial dashboard and alerts, plus a financial account selector. All permitted VANs displays separate account cards and separate ledger rows; UTR search, date range, aggregation, export and dispute selection remain. Reports and Settlement retain their original coming-soon tabs |
| `/manual-refunds`             | Focused bank payout obligations in the granted VAN scope                                                                                                                                                                                                                                                                               |
| `/reports`                    | Scoped individual VAN CSV statements, with a combined download when multiple VANs are granted                                                                                                                                                                                                                                          |

Policy and claims modules remain in the original application. Their simulator navigation explains that live source services are needed; simulated policy issuance, claims decisions and live login are outside this implementation. Existing tax, commission and non-wallet accounting flows are not replaced with invented rules.

## Review walkthroughs

| Workflow                 | How to exercise it                                                                     | Expected result                                                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Eternal all-account view | Choose Eternal, then Eternal group finance; choose All permitted VANs                  | Four account cards and four separate daily ledger rows appear. VAN-2 remains negative while the group APD can be healthy                        |
| Single-partner boundary  | Choose Partner finance in Eternal                                                      | Only Zomato VAN-1 is available; there is no All option or export of VANs 2–4                                                                    |
| Shared VAN               | Choose Cred, then Credit Vidya finance                                                 | Only VAN-2 is granted. Cred plan/source attribution is redacted; whole-VAN money is not recalculated from visible plans                         |
| Existing ledger actions  | Change date/aggregation, search a UTR, select a ledger row, raise a dispute, export    | The original table semantics remain, with the VAN column added only for all-account view. Combined CSV repeats opening and closing for each VAN |
| Failed payout            | Load Bank refund failed; open Manual refunds                                           | Obligation and failed status are visible on the separate existing destination                                                                   |
| APD escalation           | Load grace, expire grace, then expire recovery                                         | Issuance changes to blocked, then manual review. No automatic cancellation or replay                                                            |
| Submission failure       | Enable Fail the next submitted action, then raise a dispute from a selected ledger row | Error appears and the request can be retried                                                                                                    |
| Export failure           | Enable failure, then export from financials or reports                                 | Clear failure with retry; no partial file is generated                                                                                          |
| Data and access states   | Load delayed, mismatch, empty, error, loading or access removed                        | Explicit source status, guarded actions, loading skeletons, retry, missing-data explanation or access boundary                                  |
| Communications           | Open notifications and communication preview                                           | Scoped local messages and preview only; no email/SMS is sent                                                                                    |

## Access model in this reference implementation

| Persona               | Financial scope                                            | Actions                                                               |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| Partner finance       | Zomato VAN-1 in Eternal, Cred VANs in Cred                 | Raise dispute, view/export                                            |
| Eternal group finance | All four Eternal VANs under an illustrative explicit grant | Raise dispute, view/export                                            |
| Partner viewer        | Same permitted VANs                                        | View/export only                                                      |
| Partner operations    | Operational partner/plan scope                             | Issuance status and finance handoff; no balances or financial exports |
| Credit Vidya finance  | Shared Cred VAN-2                                          | Dispute/view/export; other partner attribution redacted               |
| ACKO reconciliation   | All fixture VANs                                           | View/export and dispute in this surface                               |
| ACKO Finance approver | All fixture VANs                                           | View/export in this surface                                           |

Operational grants and financial grants are separate. This local role picker is a demonstration, **not a security boundary**. Fixture snapshots include the full synthetic dataset. A real server must return only permitted data and independently authorize every action and export; never send confidential rows and rely on React to hide them.

## Developer entry points

- `src/features/financial-workspace/domain.ts`: pure money, state-transition, scope, redaction and CSV model. Integer paise throughout.
- `gateway.ts`: async adapter boundary used by the provider. The simulator accepts snapshots/roles for deterministic local transitions. A BFF implementation must derive identities and state on the server, rather than serializing these arguments as authority.
- `provider.tsx`: shared session state, stale-response guard, in-flight submission guard and injectable gateway.
- `overview-preview.tsx`: local sample of the existing Overview structure; the live overview remains in `src/features/overview`.
- `ledger.ts`: pure per-VAN ledger-summary grouping and balance calculation.
- `ledger-screen.tsx`: existing Financials ledger pattern, dashboard/alerts, all-permitted-VAN selector and separate Manual refunds view.
- `statements-screen.tsx`: scoped individual and combined statement downloads.
- `actions.tsx`: the existing dispute form, with review and validation.
- `shell.tsx`: portal shell, simulator, notifications and communication previews.
- `common.tsx` / `workspace.css`: shared status, source and empty/error components using existing tokens.
- `config.ts`: explicit development-only switch.

The live routes retain their original components behind this flag. To release the new UX, replace the simulator adapter, supply authenticated grants and approved rules, then move the new components behind the team's release flag. Do not enable the local simulator flag as a production rollout strategy.

The earlier prototype exposed Report transfer, Plan activity, Cases & approvals, Wallet group and Audit trail on Financials. Those additions were removed from the visible routes after review. The pure reference model still contains some unexposed transitions for scenario fixtures; it is not a specification to build those workflows.

## Proposed backend contract

These are integration requirements, not assertions about current BFF endpoints.

| Capability            | Required request / response semantics                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapshot              | Authenticated permitted scope, VAN openings/closings, posted entries, holds, APD state, exact deadlines, source as-of/watermarks, reconciliation status and snapshot revision                     |
| Command               | Resource ID, command payload, stable idempotency key, expected revision, supporting evidence references. Actor and grants derived from server session                                             |
| Validation            | Field errors, denied/revoked scope, duplicate reference with existing case ID, stale revision with refreshed snapshot, source unavailable, retryable service failure                              |
| Unknown outcome       | Retain the same idempotency key and look up command status before retrying. The local injected failure occurs before mutation; network timeout after commit needs this additional server protocol |
| Concurrency           | Atomically validate revision and commit. Browser in-flight guards cannot protect against two tabs, two users or competing callbacks                                                               |
| Bank/payout callbacks | Verify source event authenticity; deduplicate event/obligation IDs; correlate original payout attempts; return authoritative settlement state and ledger links                                    |
| Corrections           | Source-linked, immutable additive entries with separate maker/checker identities; no mutation of original ledger rows                                                                             |
| Mapping               | Versioned old/new memberships, destination WG, effective timestamp, source cutoff, open obligation policy, both groups' APD impact and activation result. Approval is not activation              |
| Statements            | Authorized whole-VAN opening + movements = closing at a fixed cutoff; per-entry mapping version, source reference and original correction link; redaction consistent with onscreen scope          |
| Notifications         | Server-side event templates, approved audience/recipient routing, channel preferences, deduplication, delivery status/retry and access-scoped deep links                                          |

Production adapters must also handle pagination, arbitrary periods, retention, large exports, loading/cancellation, timezone boundaries and entitlement changes during a session. Fixed fixture clocks and one-period CSVs are deliberate simulator constraints.

## Rules that still require business decisions

1. **APD basis:** booked or available, and which holds count. The simulator lets reviewers compare both; this is not approved accounting policy.
2. **Failed payout hold:** this implementation retains the obligation hold through failure/retry. The earlier atlas explored releasing on failure; that alternative is not treated as settled policy. Finance must decide release conditions before integration.
3. **Shared-VAN disclosure:** this proposal exposes the granted whole VAN balance and anonymous co-participant movements while withholding plan/source details. Confirm contractual disclosure rights.
4. **Funding ownership and escalation:** configure actual accountable users, recipients, channels, thresholds and deadlines.
5. **Mapping activation:** define destination, effective time and treatment of pending obligations. This is why mapping approval has an explicit waiting state.
6. **Recovery decisions:** Finance/Business owns post-recovery review and any policy/claims exceptions. No auto cancellation or replay is assumed.

Eternal topology follows the user's confirmed one-WG/four-VAN/separate-partner example. Cred topology follows the supplied development tracker. Documents, Figma references and the PM proposal inform the implementation; their suggestions are not treated as authoritative financial rules.

## Checks

```sh
pnpm test:financials
pnpm exec tsc --noEmit --incremental false
pnpm exec next build --webpack
```

The domain tests cover aggregation, scope/export redaction, no financial amounts for operations/revoked access, duplicate deposits, idempotent matching, refund hold/debit transitions, maker/checker, source failures, APD expiry, mapping waiting state, dispute resolution and historical mapping attribution. Browser walkthroughs validate the integrated controls and desktop layout separately.
