# GitHub Copilot Instructions

GitHub Copilot is the general development support assistant for this repository.

## Role

Copilot supports day-to-day IDE productivity:

- inline code completion
- small code suggestions and refactors
- TypeScript help and API usage hints
- test suggestion scaffolding
- pattern-aware implementation help that matches existing code

Copilot does not own implementation direction, architecture decisions, release
coordination, production stabilization ownership, repo-wide AI governance,
automated maintenance workflows, or config standardization ownership. Copilot
does have commit, push, and tag authority per the companywide grant, scoped
to the work described below. Full roster and authority table:
[AGENTS.md](../AGENTS.md).

## Copilot Coding Alignment

When suggesting edits, keep changes small and aligned with this package:

- Preserve reactive-primitives-only scope: `signal`, `computed`, `effect`, `batch`.
- Do not suggest stores, framework adapters, router helpers, persistence, async resource layers, event buses, or devtools surface area.
- Preserve synchronous semantics and existing naming/style patterns.
- Prefer focused changes over broad rewrites.
- Avoid adding exports unless directly required for primitive reactivity.

## TypeScript, Tests, And Validation

- Keep TypeScript strict and explicit. Avoid introducing `any` unless justified.
- For behavior changes, suggest test updates in `tests/signals.test.ts`.
- Before considering work complete, run `npm run check` (typecheck, lint, build,
  test, README version-sync, ecosystem validation).

## Documentation Hygiene

- Keep `README.md` and `CHANGELOG.md` aligned with actual behavior.
- Do not document APIs that do not exist.
- Keep guidance practical and minimal; avoid speculative roadmap language in implementation changes.
