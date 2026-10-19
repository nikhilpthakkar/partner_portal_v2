# Partner Portal Frontend — Agent Context

Service: **embedded-partner-portal-frontend** (Next.js Partner Portal UI).

Repo: Next.js 16 app. Local API traffic goes through an Express proxy to the UAT BFF.

---

## Local running setup

How to run the Partner Portal UI locally against the UAT BFF.

### Prerequisites

- Node.js + **pnpm** (`packageManager`: `pnpm@11.0.8`)
- VPN / network access to `*.internal.ackodev.com` (UAT BFF)
- Dependencies installed: `pnpm install`

### Environment (`.env.local`)

Create `.env.local` at the repo root (gitignored — do not commit):

```bash
NEXT_PUBLIC_ENV=staging
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_LOCAL_AUTH_BYPASS=true
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_ENV` | Environment label (`staging` for local) |
| `NEXT_PUBLIC_BASE_PATH` | Path prefix; leave empty for local |
| `NEXT_PUBLIC_LOCAL_AUTH_BYPASS` | Skip cookie/login gate locally |

**Auth bypass** (`NEXT_PUBLIC_LOCAL_AUTH_BYPASS=true`):

- `src/proxy.ts` — skips access/refresh cookie redirect
- `src/lib/utils/auth.ts` — `isAuthenticated()` returns true
- `src/lib/services/axios-client/index.ts` — skips 401 → login redirect

API auth still comes from the local proxy via `x-auth-user-id` (not browser cookies).

### Start commands (two terminals)

**1. API proxy** (port **9001**):

```bash
pnpm proxy
# same as: node src/lib/services/serverConfig/apiProxy.js
```

**2. Next.js app** (port **3000**):

```bash
# Prefer direct binary if `pnpm dev` hits JSON parse issues:
./node_modules/.bin/next dev

# or:
pnpm dev
```

Open: http://localhost:3000

### How the local proxy works

File: `src/lib/services/serverConfig/apiProxy.js`

- Listens on `http://localhost:9001`
- FE Axios base URL on localhost → `http://localhost:9001/api` (`getDomainOrigin()` in `src/lib/services/serverConfig/index.ts`)
- Strips `/api` prefix, forwards to UAT BFF (`embedded-partner-portal-bff-uat.internal.ackodev.com`)
- Injects `x-auth-user-id` for BFF auth

**Local-only config:** `AUTH_USER_ID` in `apiProxy.js` is a hardcoded local proxy identity (use a placeholder like `your.user@example.com` locally). Do **not** commit personal/prod user IDs or secrets into PRs.

### Common pitfalls

| Symptom | Likely cause |
|---------|----------------|
| Empty `productIds` / partner config never loads; queries stay disabled (`enabled: … productIds.length > 0`) | Proxy down, VPN off, or BFF products call failing — partner store never hydrates |
| Redirected to `/` or login | `NEXT_PUBLIC_LOCAL_AUTH_BYPASS` not `true` / missing `.env.local` (restart Next after changing env) |
| CORS / network errors to BFF | Proxy not running on 9001, or no UAT network access |
| `pnpm dev` JSON parse errors | Use `./node_modules/.bin/next dev` instead |

### What NOT to commit

- `.env.local` (includes local auth bypass and any tokens/credentials)
- Personal emails / user IDs in `apiProxy.js` intended only for your machine
- Secrets, OAuth client secrets, or production auth material

Keep proxy/auth-bypass overrides local unless the team explicitly wants a shared, secret-free local-dev pattern in the PR.

---

## Related services

| Service | Role |
|---------|------|
| `embedded-partner-portal` | UAT/prod BFF behind the local proxy |

See also: `README.md` (broader project docs), `docs/auth-management.md`.
