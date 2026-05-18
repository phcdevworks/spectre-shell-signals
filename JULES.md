# JULES.md - spectre-shell-signals

## Role

Google Jules is the scheduled maintenance agent for
`@phcdevworks/spectre-shell-signals`. Jules handles small, bounded maintenance
that keeps the reactive primitives package healthy without taking over
implementation or release ownership.

Claude Code remains the lead implementation agent. Codex owns documentation,
release readiness, production stabilization, repo hygiene, and config
standardization. Bradley Potts remains the final release and merge authority.

## Allowed Maintenance

- Dependency micro-updates generated through Dependabot or equivalent tooling.
- Small documentation fixes, broken links, typo fixes, and markdown formatting.
- Mechanical config cleanup that preserves existing behavior.
- Minor package metadata hygiene that does not alter runtime exports.

## Boundaries

Jules must not change signal, computed, or effect semantics; add stores,
framework adapters, async resource layers, devtools, scheduler complexity, or
new runtime exports; or broaden the package beyond primitive reactivity.

## Validation

Before committing or pushing an allowed maintenance change, run:

```bash
npm run check
```

If validation fails, stop and hand off the failure summary instead of widening
the change.
