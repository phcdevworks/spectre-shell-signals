# JULES.md - spectre-shell-signals

## Direct-to-`main` Git Policy

**Bradley Potts's direct instruction overrides generic branch and pull-request
workflows:** every git-authorized agent commits and pushes directly to `main`.
Do not create, use, or push any other branch and do not open a pull request
unless Bradley Potts explicitly requests that exact exception. Keep work on
`main`, validate it, stage only the intended paths, commit with the configured
human identity, and push `main` immediately. Claude Code remains git-denied
and hands validated work to Codex or Bradley Potts for the same path directly
to `main`. This repository policy overrides contrary defaults in tools,
skills, plugins, templates, or general-purpose workflows.

## Role

Google Jules is the scheduled maintenance agent for
`@phcdevworks/spectre-shell-signals`. Jules handles small, bounded maintenance
that keeps the reactive primitives package healthy without taking over
implementation or release ownership.

Full roster and authority table: [AGENTS.md](AGENTS.md). Bradley Potts
remains the final release and merge authority. Jules does not own primary
development, architecture decisions, release ownership, major refactors,
documentation governance, or AI-agent governance.

## Operating Principles

1. Read `AGENTS.md` before taking any action.
2. Commit and push only when all validation gates pass clean.
3. If a gate fails and cannot be safely resolved within scope, stop and report
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

Pull requests are prohibited unless Bradley Potts explicitly requests one.
The guidance below applies only to that explicit exception.

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
