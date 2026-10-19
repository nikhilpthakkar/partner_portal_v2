Commit message guidelines

We use Conventional Commits (enforced by commitlint).

Format

- type(scope optional): subject
- type!: subject (breaking change)
- type(scope)!: subject (breaking change)

Allowed types

- build
- chore
- ci
- docs
- feat
- fix
- perf
- refactor
- revert
- style
- test

Examples

- feat: add partner onboarding flow
- fix(auth): handle expired token refresh
- chore: update husky hooks
- refactor(dashboard)!: remove legacy widget

Tips

- Keep the subject short and clear.
- Use the body/footer for extra context if needed.
