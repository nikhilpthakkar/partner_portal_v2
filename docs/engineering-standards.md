## Engineering Standards

This document summarizes the coding standards and practices for the Embedded Partner Portal frontend. It complements the existing `README.md` and Cursor rules in `.cursor/rules`.

## Architecture and Boundaries

- Keep dependency flow: `app` -> `features` -> `components` + `lib`
- Route logic lives only in `src/app`
- Feature orchestration stays in `src/features`
- Shared UI belongs in `src/components`
- API data normalization happens in `src/lib/adapter`

## Data and State

- Server data: React Query hooks in `src/lib/query`
- Client UI state: Zustand stores in `src/lib/store`
- API calls live in `src/lib/services`
- Components do not fetch data or access stores directly

## Components

- Functional components only
- Prefer React Server Components; use `"use client"` only when required
- Components are reusable and receive data via props
- Follow component levels: `atoms` -> `molecules` -> `organisms` -> `templates`
- Prefer shadcn/ui and Radix UI primitives

## Styling and Tokens

- Tailwind-first, no inline styles
- No hardcoded px/hex/rgba in components
- Use Tailwind v4 token utilities generated from `@theme`
- Do not add 1:1 custom classes for tokens
- SCSS only when necessary and only in `src/styles`

## TypeScript and Naming

- Strict TypeScript, avoid `any` and `unknown`
- Shared types go in `src/lib/types`
- Folders use `kebab-case`
- `.ts` (non-component) files use `camelCase`
- `.tsx` component files use `PascalCase`
- Hooks use `camelCase` starting with `use`

## Quality and Tooling

- Keep files small and composable
- Do not refactor unless asked
- Run `pnpm lint` and `pnpm format:check` before release
- Follow Conventional Commits in `guidelines/COMMIT_MESSAGE.md`
