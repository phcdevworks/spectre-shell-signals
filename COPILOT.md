# COPILOT.md - spectre-shell-signals

## Copilot Role

GitHub Copilot is a support assistant for implementation help, test suggestions,
small refactors, docs updates, and GitHub workflow support.

Copilot is support-only and does not own architecture or release decisions.

## Team Relationship

- Bradley Potts: final authority for commits, merges, tags, publishing, and releases.
- Claude Code: lead implementation and architecture owner.
- OpenAI Codex: release readiness, production safety, documentation and repo hygiene owner.
- GitHub Copilot: supporting development assistant.
- Google Jules: automated micro-maintenance only (`JULES.md`).

## Package Boundary

This package is reactive primitives only: `signal`, `computed`, and `effect`.

Do not add stores, framework adapters, router helpers, app-specific state,
async data layers, or UI responsibilities.

## Allowed Work

- Small and medium implementation support tasks.
- Focused refactors for correctness and maintainability.
- Test updates when primitive behavior changes.
- README and workflow/template quality improvements.

## Restricted Work

- Do not take ownership from Claude Code.
- Do not override Codex release-readiness oversight.
- Do not publish, merge, tag, or release.
- Do not broaden package scope.

## Validation Expectations

Primary gate: `npm run check`.

If validation fails, report the failing command and likely cause and suggest
the smallest safe fix.

## Documentation Expectations

When behavior/exports change, keep `README.md`, `CHANGELOG.md`, and GitHub
templates aligned.

## PR and Issue Support

Ensure PR notes include package-boundary checks, public API impact, validation
result, release impact, and Codex review visibility.
