# Authorization (RBAC) in the Partner Portal frontend

This document describes how **authorization** is implemented in this service. The UI uses a **capability-based** model: the backend exposes string permissions such as `can_view_policies`, and the app stores them and gates routes and components accordingly.

This is **not** authentication (login, tokens, session). Authentication lives in auth context, cookies, and login redirect flows. **Authorization here means: “given an authenticated user, what may they see or do in the UI?”**

---

## 1. Principles

| Topic | Approach |

| **Model** | Fine-grained **permissions** (`can_*`), not named roles in the React tree. |
| **Storage** | `permissions: Permission[]` on the Zustand store `usePartnerStore` (`src/lib/store/partner.store.ts`). |
| **Source** | Permissions are **hydrated from the partner config API** when products are loaded for the selected partner and line of business (LOB); see `usePartnerConfig` (`src/lib/hooks/usePartnerConfig.ts`). |
| **Semantics** | Client-side checks are **UX and routing only**. Downstream APIs **must** enforce the same rules; the browser cannot be trusted as the authority. |

---

## 2. Permission constants

All capability keys are defined in `src/lib/constants/auth.constants.ts` as `PERMISSIONS`, with TypeScript type `Permission`.

| Constant                | Backend string (value)      |
| ----------------------- | --------------------------- |
| `VIEW_DASHBOARD`        | `can_view_dashboard`        |
| `VIEW_POLICIES`         | `can_view_policies`         |
| `VIEW_CLAIMS`           | `can_view_claims`           |
| `WRITE_CLAIMS`          | `can_write_claims`          |
| `VIEW_FINANCIALS`       | `can_view_financials`       |
| `ENDORSE_NON_FINANCIAL` | `can_endorse_non_financial` |
| `ENDORSE_FINANCIAL`     | `can_endorse_financial`     |
| `UPLOAD_BULK`           | `can_upload_bulk`           |

**Endorse actions** often require **either** financial or non-financial endorse. The app exposes `ENDORSE_ACTION_PERMISSIONS` (both strings) for use with `PermissionGate`’s `anyOf` prop (see below).

A small registry re-export for discoverability lives in `src/lib/constants/permissionRegistry.ts`.

---

## 3. How the effective permission list is built

1. User selects (or the app defaults) **partner** and **LOB**.
2. The app fetches **products** for that pair (`useProductsQuery` in `src/lib/query/partnerConfig.queries.ts`).
3. In `usePartnerConfig`, when `productsData.products` is available, the store is updated with:
   - Product options and `productIds`
   - **`permissions`**: a **deduplicated union** of every `product.permissions` entry across all returned products (`Set` + `flatMap`).

So the effective list is the **union of product-level permissions** for the current partner/LOB product set. API types may also include `permissions` on partner or LOB entities; the **current UI pipeline** derives the live list from **products** as above.

---

## 4. Core helpers (`permissionUtils`)

`src/lib/utils/permissionUtils.ts` defines:

- **`hasPermission(userPermissions, required?)`**
  - `required` may be omitted → **allow**.
  - Single `Permission` → user must **include** that string.
  - `Permission[]` → user must have **all** listed (**AND**).

- **`hasAnyPermission(userPermissions, required[])`**
  - User must have **at least one** of the listed permissions (**OR**). Used for endorse and for `PermissionGate`’s `anyOf`.

---

## 5. `PermissionGate` component

`src/components/atoms/PermissionGate.tsx` is a client component that:

- Reads `permissions` from `usePartnerStore`.
- Renders **`children`** only if checks pass; otherwise renders **`null`** (no fallback UI).

Props:

| Prop          | Meaning                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------- |
| `permission?` | Optional. Passed to `hasPermission` (single permission or **AND** array).                |
| `anyOf?`      | Optional. If non-empty, `hasAnyPermission` must pass (**OR**).                           |
| (both)        | **Both** conditions must pass: `permission` (if present) **and** `anyOf` (if non-empty). |

**Example:** bulk upload might use `permission={PERMISSIONS.UPLOAD_BULK}`. Endorse entry points use `anyOf={ENDORSE_ACTION_PERMISSIONS}` so either endorse capability is sufficient.

---

## 6. Route-level protection

- **`DashboardRouteGuard`** (`src/components/organisms/DashboardRouteGuard.tsx`) wraps dashboard page content (via `LayoutWrapper` / `DashboardLayout`).
- It uses `usePathname()` and **`getDashboardRoutePermission`** from `src/lib/constants/routePermissions.constants.ts` to map URL patterns to a required `Permission` or `Permission[]` (**AND** for arrays, same as `hasPermission`).
- **`permissionsResolved`** from **`usePartnerConfigReady`** must be true before the guard evaluates access. That avoids treating an empty permission list during the products fetch as a definitive “deny” (see next section).
- If the user lacks the required permission(s), the guard shows **`FallbackState`** with `ACCESS_DENIED_MESSAGE` from `auth.constants`.

---

## 7. `usePartnerConfigReady`

`src/lib/hooks/usePartnerConfigReady.ts` exposes:

| Field | Purpose |

| `isReady` | `true` when both `partnerId` and `lob` are set — used so dependent queries do not run too early. |
| `permissionsResolved` | `true` if partner/LOB are not both set yet **or** the **products** query has completed (success or error). Use this before interpreting `permissions` for **route-level** decisions so loading is not mistaken for “no access”. |

The products query is shared with React Query’s cache alongside `usePartnerConfig`, so this does not imply duplicate network work in normal operation.

---

## 8. Other usage patterns (non-exhaustive)

- **Sidebar** (`MainSidebar.tsx`): each nav link is wrapped in `PermissionGate` with the matching `PERMISSIONS.*`.
- **Policy management** (`features/policy-management/index.tsx`): top tabs filtered with `hasPermission`; bulk upload button uses `PermissionGate`.
- **Policy table / policy details**: endorse actions use `PermissionGate` with `anyOf={ENDORSE_ACTION_PERMISSIONS}`.
- **Claims / uploads**: e.g. `UploadRequiredBanner`, `ClaimsTrendCard` gate actions with the appropriate `PERMISSIONS`.

For a full list, search the codebase for `PermissionGate`, `hasPermission`, and `PERMISSIONS`.

---

## 9. Limitations and responsibilities

1. **Client-only enforcement** can be bypassed. All sensitive operations must return **401/403** (or equivalent) from APIs when the user lacks rights.
2. **Permission strings** must stay in sync with backend contracts; consider OpenAPI or shared packages if drift becomes an issue.
3. **Empty product lists** or **errors** in partner config produce an empty or stale permission array until state is updated; UI loaders and `permissionsResolved` are there to reduce confusing flashes, not to replace server validation.

---

## 10. File index

| Area                                 | Path                                               |
| ------------------------------------ | -------------------------------------------------- |
| Permission strings & messages        | `src/lib/constants/auth.constants.ts`              |
| Registry re-exports                  | `src/lib/constants/permissionRegistry.ts`          |
| Route ↔ permission rules             | `src/lib/constants/routePermissions.constants.ts`  |
| `hasPermission` / `hasAnyPermission` | `src/lib/utils/permissionUtils.ts`                 |
| Partner store                        | `src/lib/store/partner.store.ts`                   |
| Load products & set permissions      | `src/lib/hooks/usePartnerConfig.ts`                |
| Ready / resolved flags               | `src/lib/hooks/usePartnerConfigReady.ts`           |
| Component gate                       | `src/components/atoms/PermissionGate.tsx`          |
| Dashboard route guard                | `src/components/organisms/DashboardRouteGuard.tsx` |
