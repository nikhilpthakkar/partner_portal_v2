# Embedded Partner Portal Frontend

A production-oriented dashboard application for enterprise partners, built with Next.js and TypeScript.
It centralizes policy, claims, and performance workflows into a single portal with partner-scoped navigation and reusable UI primitives.

For the October 2026 frontend financial workflow preview, start with the [financial workspace handoff](docs/financial-workspace-handoff.md). It includes local setup without a BFF, persona/scenario controls, workflow walkthroughs, and backend integration contracts.

---

## Table of Contents

- [Product Overview](#product-overview)
- [Recent Updates](#recent-updates)
- [Feature Modules](#feature-modules)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Routing Map](#routing-map)
- [Authentication Flow](#authentication-flow)
- [Data Flow and State Strategy](#data-flow-and-state-strategy)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Development Scripts](#development-scripts)
- [Local API Proxy](#local-api-proxy)
- [Quality and Tooling](#quality-and-tooling)
- [Conventions and Standards](#conventions-and-standards)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap Ideas](#roadmap-ideas)
- [License](#license)

---

## Product Overview

The portal is designed for partners to monitor and operate insurance/business workflows with a consistent dashboard experience.

Core outcomes:

- Track high-level business metrics and trends
- Manage policy lifecycle views and policy-level details
- Review claims data and deep-dive into claim detail views
- Navigate partner-specific dashboard routes cleanly
- Offer reliable auth redirection and session-expiry handling

---

## Recent Updates

### May 14, 2026 - Financials Ledger Premium + Local Proxy Improvements

**Financials premium calculation**

- Updated the Financials ledger "Premium (₹)" to be: `issuanceAmount + endorsementAmount`
- Premium values are displayed rounded to **2 decimal places**

**Local API proxy / local dev**

- Local API origin detection now treats `localhost`, `127.0.0.1`, and `::1` as local and routes API calls via the proxy (`http://localhost:9001`)
- Proxy CORS allows both `http://localhost:3000` and `http://127.0.0.1:3000`

---

### April 11, 2026 - Claims Management Refactoring

**Status Management Enhancement**

Improved the claims trend and table dialog components with cleaner state management and centralized constants:

- Consolidated status group logic into a single `statusGroups` constant in `overview.constants.ts`
- Removed duplicate constants (`ALL_STATUSES`, `claimsDialogStatusOptions`)
- Simplified ClaimsTrendCard by removing complex useEffect chains (~80 lines of code removed)
- Enhanced ClaimsTableDialog with intelligent status group detection
- Added `periodType` field to `ClaimsTrendData` for better period tracking
- Improved type safety across status-related components

**Benefits:**

- Reduced code complexity and improved maintainability
- Single source of truth for status groups
- Cleaner state management with fewer side effects
- Better user experience with smoother interactions

**Files Modified:**

- `src/components/organisms/ClaimsTableDialog.tsx`
- `src/components/organisms/ClaimsTrendCard.tsx`
- `src/lib/adapter/overview/claimsTrend.adapter.ts`
- `src/lib/constants/overview.constants.ts`
- `src/lib/types/overview/index.ts`

---

## Feature Modules

### 1) Overview

- Key metrics cards
- Trends and summaries (including chart-driven insights)
- Date-range and grouping controls
- Promotional/new-feature cards

### 2) Policy Management

- Policy overview listing and search/filter interactions
- Bulk operations surface
- Policy detail drilldown with tabbed sections:
  - Policy details
  - Communication
  - Claims history
  - Endorsements
  - Health cards

### 3) Claims Management

- Claims listing and management flows
- Claim details route for deeper claim-level context

### 4) Financials

- Dedicated feature route and page shell for financial views

### 5) Export Data

- Route-level export surface for partner reporting workflows

---

## Technology Stack

### Framework and Language

- `Next.js 16` (App Router)
- `React 19`
- `TypeScript` with strict mode

### UI and Design System

- `Tailwind CSS v4`
- `shadcn/ui`
- `Radix UI`
- `lucide-react`
- Optional `sass` for targeted styling cases

### Data, State, Networking

- `@tanstack/react-query` for server state and caching
- `zustand` for client/UI state
- `axios` for API communication

### Visualization and Utilities

- `echarts` for charts
- `date-fns` for date utilities
- `js-cookie` for token storage helpers

### Developer Tooling

- `eslint`
- `prettier`
- `husky`
- `lint-staged`
- `pnpm`

---

## Architecture

The app follows a layered, feature-oriented architecture:

1. **Route layer** (`src/app`): URL structure, layouts, and route entry points
2. **Feature layer** (`src/features`): Page-level orchestration and screen logic
3. **Component layer** (`src/components`): Reusable UI building blocks
4. **Domain layer** (`src/lib`): services, adapters, query hooks, stores, constants, and types

This keeps rendering concerns separate from API contracts and minimizes coupling between UI and backend response shapes.

---

## Project Structure

```text
.
├─ src/
│  ├─ app/                               # App Router entrypoints, layouts, providers
│  │  ├─ layout.tsx                      # Root layout
│  │  ├─ page.tsx                        # Auth/bootstrap landing route
│  │  ├─ providers.tsx                   # React Query + Auth + global UI providers
│  │  └─ [partner]/dashboard/            # Partner-scoped dashboard routes
│  │     ├─ layout.tsx                   # Dashboard shell (sidebar/content)
│  │     ├─ overview/
│  │     ├─ policy-management/
│  │     │  └─ policy-details/
│  │     ├─ claims-management/
│  │     │  └─ claim-details/
│  │     ├─ financials/
│  │     └─ export-data/
│  │
│  ├─ features/                          # Route-level orchestrators (data + composition)
│  │  ├─ overview/
│  │  ├─ policy-management/
│  │  ├─ policy-details/
│  │  ├─ claims-management/
│  │  ├─ claim-details/
│  │  ├─ financials/
│  │  └─ exports/
│  │
│  ├─ components/                        # Reusable UI system
│  │  ├─ atoms/                          # Primitive presentational blocks
│  │  ├─ molecules/                      # Small composed components
│  │  ├─ organisms/                      # Complex feature-aware sections
│  │  ├─ templates/                      # Layout compositions
│  │  └─ ui/                             # shadcn/Radix base components
│  │
│  ├─ lib/                               # Domain and app infrastructure
│  │  ├─ services/                       # API clients and transport concerns
│  │  ├─ query/                          # TanStack Query hooks (server state)
│  │  ├─ store/                          # Zustand stores (client/UI state)
│  │  ├─ adapter/                        # API -> UI model mapping
│  │  ├─ hooks/                          # Shared cross-feature hooks
│  │  ├─ context/                        # React context providers
│  │  ├─ constants/                      # Reusable constants
│  │  ├─ types/                          # Shared TypeScript contracts
│  │  └─ utils/                          # Pure helper utilities
│  │
│  ├─ styles/                            # Global/shared style assets
│  └─ proxy.ts                           # Next proxy configuration entry
│
├─ components.json                       # shadcn/ui config
├─ next.config.js                        # Next.js config
├─ tsconfig.json                         # TypeScript config + path aliases
└─ package.json                          # Scripts and dependencies
```

### Placement Guide

- New route/page: add under `src/app/[partner]/dashboard/...`
- New screen orchestration: add a feature module in `src/features/...`
- New reusable UI: add in `src/components/...` at the correct level (`atoms` -> `templates`)
- New API integration: add service in `src/lib/services`, query hook in `src/lib/query`, and adapter in `src/lib/adapter`
- New app/client state: create or extend a store in `src/lib/store`
- New shared type/contract: add in `src/lib/types`

### Dependency Direction

- `app` -> `features` -> `components` + `lib`
- `features` may consume `lib`, but `lib` must not depend on `features`
- `components` should stay reusable and avoid embedding API/fetch logic
- Data normalization should happen in `adapter` layer, not in presentational components

### Naming Rules (Quick Reference)

- Folders: kebab-case
- React component files (`.tsx`): PascalCase
- Non-component TypeScript files (`.ts`): camelCase
- Hooks: camelCase starting with `use`

### If You Are Adding...

- A new dashboard screen -> `src/app/[partner]/dashboard/<route>/page.tsx` + `src/features/<feature>/index.tsx`
- A reusable chart/card/table block -> `src/components/organisms`
- A small shared control (badge/input/select/button wrapper) -> `src/components/molecules` or `src/components/atoms`
- A backend call -> `src/lib/services/<domain>/api.ts`
- A query hook around that API -> `src/lib/query/<domain>.queries.ts`
- A shape transformation for UI -> `src/lib/adapter/<domain>/*.adapter.ts`
- Shared constants for a feature -> `src/lib/constants/<feature>.constants.ts`
- Shared contract/type -> `src/lib/types/<domain>/*.ts`

---

## Routing Map

### Landing and Root

- `/` -> bootstraps auth/partner initialization flow

### Partner-scoped dashboard

- `/:partner/dashboard` -> redirects to overview
- `/:partner/dashboard/overview`
- `/:partner/dashboard/policy-management`
- `/:partner/dashboard/claims-management`
- `/:partner/dashboard/financials`
- `/:partner/dashboard/export-data`

### Detail routes

- `/:partner/dashboard/policy-management/policy-details`
- `/:partner/dashboard/claims-management/claim-details`

---

## Authentication Flow

Auth is handled client-side with context-driven orchestration:

1. Detect existing token/refresh token from cookies
2. If unauthenticated, redirect to accounts login URL (env-aware domain)
3. If callback includes `code`, exchange for tokens
4. Store tokens in cookies scoped by `NEXT_PUBLIC_BASE_PATH`
5. Handle `401` globally via Axios interceptor:
   - clear token state
   - show session-expired toast
   - trigger delayed redirect to login

This design ensures a consistent auth experience across routes.

---

## Data Flow and State Strategy

### Server state (React Query)

- Query hooks live in `src/lib/query/*`
- Retry, stale-time, and refetch behavior are centralized in providers
- Route/features consume query hooks and remain thin

### Client/UI state (Zustand)

- Feature-specific stores live in `src/lib/store/*`
- Used for view filters, dialog state, partner/user bootstrap state, and global loader behavior

### Adapter layer

- API responses are transformed in `src/lib/adapter/*`
- UI components consume normalized view models, not raw backend payloads

---

## Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_ENV=staging
NEXT_PUBLIC_BASE_PATH=
```

### Variables

- `NEXT_PUBLIC_ENV`
  - Controls login/accounts base domain selection
  - `production` -> `acko.com`
  - non-production -> `ackodev.com`

- `NEXT_PUBLIC_BASE_PATH`
  - Optional base path prefix when app is served under a subpath
  - Used for API base URL creation and cookie path scoping

---

## Getting Started

### Prerequisites

- Node.js LTS
- `pnpm`

### Installation

```bash
pnpm install
```

### Run in development

```bash
pnpm dev
```

Open: `http://localhost:3000`

### Production build (local validation)

```bash
pnpm build
pnpm start
```

---

## Development Scripts

- `pnpm dev` - start local Next.js dev server
- `pnpm build` - create optimized production build
- `pnpm start` - run production build
- `pnpm lint` - run ESLint checks
- `pnpm format` - format repository with Prettier
- `pnpm format:check` - verify formatting without changes
- `pnpm proxy` - run local Express proxy for API passthrough

---

## Local API Proxy

An optional Express proxy is available for local API development:

```bash
pnpm proxy
```

Behavior:

- Runs at `http://localhost:9001`
- Forwards requests to the configured UAT BFF target
- Preserves cookies and injects required headers for local testing

Notes:

- When the app is served from `localhost` / `127.0.0.1` / `::1`, the Axios base URL is automatically set to use the proxy (`http://localhost:9001/.../api`) so `/api/*` calls go to the backend instead of the Next dev server.

Use this when frontend development needs backend integration without changing deployed API hosts.

---

## Quality and Tooling

### Lint and format

```bash
pnpm lint
pnpm format:check
```

### Git hooks

- `husky` + `lint-staged` format staged files before commit
- Helps keep consistency across TS/JS/CSS/SCSS/JSON/MD files

---

## Conventions and Standards

### TypeScript and architecture

- Strict TypeScript across the codebase
- Avoid `any` and `unknown` in application logic
- Keep shared contracts in `src/lib/types`

### Feature boundaries

- Page orchestration in `src/features`
- Reusable presentation in `src/components`
- API and transformation logic in `src/lib/services` + `src/lib/adapter`

### State rules

- Server data -> React Query
- Client/UI interaction state -> Zustand
- Components remain presentational and reusable

### Styling

- Tailwind-first styling strategy
- Prefer design-token utilities over hardcoded values
- Use component composition over one-off custom styles

---

## Deployment Notes

- Validate environment variables per environment (`NEXT_PUBLIC_ENV`, `NEXT_PUBLIC_BASE_PATH`)
- If deploying under a path prefix, set `NEXT_PUBLIC_BASE_PATH` accordingly
- Verify auth redirect domain and cookie path behavior after deployment
- Run lint/format checks and production build before promotion

---

## Troubleshooting

- **Login redirect loop**
  - Recheck `NEXT_PUBLIC_ENV` and callback URL assumptions
  - Confirm cookies are being set on expected path (`NEXT_PUBLIC_BASE_PATH`)

- **401s keep repeating**
  - Confirm token exchange endpoint behavior and cookie persistence
  - Check whether session-expired flow is redirecting as expected

- **API failures in local**
  - Ensure `pnpm proxy` is running when needed
  - Verify frontend origin and proxy target connectivity

- **Console error: `Unexpected token '<' ... is not valid JSON`**
  - This usually means an API call received HTML (often a Next.js 404 page) instead of JSON.
  - Ensure API requests are going through the local proxy: run `pnpm proxy` and use `http://localhost:3000` (or `http://127.0.0.1:3000`) for local dev.

- **Partner routes not resolving**
  - Ensure URL contains a valid partner slug: `/:partner/dashboard/...`

---

## Roadmap Ideas

Potential improvements for future iterations:

- Add automated test suites (unit + integration + route smoke tests)
- Add Storybook for shared UI documentation
- Add API error observability and dashboard-level telemetry
- Add role/permission-aware route guards per partner capability
- Add CI quality gates for lint, build, and coverage thresholds

---

## License

Private repository.
Internal use only.
