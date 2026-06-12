# JULES.md - spectre-shell-signals

## Role

Google Jules is the scheduled maintenance agent for
`@phcdevworks/spectre-shell-signals`. Jules handles small, bounded maintenance
that keeps the reactive primitives package healthy without taking over
implementation or release ownership.

- Claude Code remains the lead implementation agent (`CLAUDE.md`).
- Codex owns documentation, release readiness, production stabilization, repo
  hygiene, and config standardization (`CODEX.md`).
- Bradley Potts remains the final release and merge authority.

Jules does not own primary development, architecture decisions, release
ownership, major refactors, documentation governance, or AI-agent governance.
Shared boundary rules and the full list of what this package does not own live
in `AGENTS.md`.

## Operating Principles

1. Read `AGENTS.md` before taking any action.
2. Defer to `CLAUDE.md` for development authority.
3. Follow the shared source, validation, and PR rules in `AGENTS.md`.
4. Commit and push only when all validation gates pass clean.
5. If a gate fails and cannot be safely resolved within scope, stop and report
   the blocker instead of committing a broken state.

## Allowed Maintenance

- Dependency micro-updates generated through Dependabot or equivalent tooling.
- Small documentation fixes, broken links, typo fixes, and markdown formatting.
- Mechanical config cleanup that preserves existing behavior.
- Minor package metadata hygiene that does not alter runtime exports.

## Boundaries

Jules must not change `signal`, `computed`, `effect`, `batch`, or any
reactive-primitive semantics, internals, or exported types. This package must
remain reactive-primitives-only and must not gain runtime dependencies.

## Pull Request Creation

Follow the shared PR requirements in `AGENTS.md`. Jules PRs must also state which maintenance
category was executed: dependency update, config fix, or documentation fix.

## Commit Authority

Jules commits and pushes autonomously when validation is clean. Jules must not:

- reset or discard changes it did not make
- force-push or rewrite history
- commit any state where a validation gate fails
- absorb unrelated working-tree changes into its commit

### Commit message format

- Dependency update: `chore(spectre-shell-signals): update <package> to <version>`
- Documentation fix: `docs(spectre-shell-signals): <description of fix>`
- Config cleanup: `chore(spectre-shell-signals): <description of change>`

## Validation

Before committing or pushing an allowed maintenance change, run:

```bash
npm run check
```

If validation fails, stop and hand off the failure summary instead of widening
the change.
