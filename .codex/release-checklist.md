# Codex Release Checklist

Use this checklist before release, publish, or PR handoff work.

## Scope

- Confirm the change stays inside reactive primitives: `signal`, `computed`,
  `effect`, dependency tracking, invalidation, cleanup, disposal, tests, docs,
  packaging, or release hygiene.
- Confirm no store, framework adapter, async resource, persistence, router, DOM,
  devtools, plugin, middleware, or broad event API concept was introduced.
- Confirm no runtime export was added without a direct primitive-reactivity need.

## Worktree

- Run `git status --short`.
- Identify changes that predate Codex work and avoid overwriting them.
- Keep edits small and related to the requested release/readiness task.

## Tests

- Add or update coverage for any behavior change.
- Pay special attention to unchanged writes, computed laziness and caching,
  dependency invalidation, cleanup before effect rerun, cleanup on disposal,
  dependency switching, nested computed values, multiple subscribers, and
  self-referential protection.

## Documentation And Metadata

- Keep `README.md` aligned with actual exports and behavior.
- Keep non-goals explicit enough to prevent package drift.
- Update `CHANGELOG.md` under `[Unreleased]` for user-visible changes.
- Confirm `package.json` name, repository, bugs, homepage, exports, files, and
  scripts match this package.

## Validation

- Run `npm run check`.
- Confirm the full gate passes: typecheck, lint, build, and test.
- Do not claim success if any part fails or was skipped.

## Handoff

- Summarize changed files.
- Report validation commands and results.
- Call out unresolved risks, skipped checks, or release blockers.
- Leave commits, tags, publishing, and final review to Bradley.
