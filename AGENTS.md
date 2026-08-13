# Spectre Shell Signals Agent Guide

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

## Repository Snapshot

| Field | Value |
|-------|-------|
| Project team | `project-shell` |
| Repository role | Spectre reactive primitives |
| Package/artifact | `@phcdevworks/spectre-shell-signals` |
| Validation gate | `npm run check` |

## Standard Authority Model

| Agent | Role | Authority |
|-------|------|-----------|
| Claude Code | Lead implementation and validation. **No git access.** | [CLAUDE.md](CLAUDE.md) |
| OpenAI Codex | Documentation, release readiness, stabilization, and repo hygiene. Also executes all git operations for Claude Code's handed-off work | [CODEX.md](CODEX.md) |
| ChatGPT | Strategy, coordination, prompt design, and external review | Support only |
| GitHub Copilot | Development assistance | [COPILOT.md](COPILOT.md) |
| Google Jules | Bounded automated maintenance | [JULES.md](JULES.md) |

**Claude Code has zero git access in this repository, no exceptions**,
effective 2026-08-13 by explicit direction from Bradley Potts. Claude Code
must never run any git command — not even read-only ones like `git
status`/`git diff`/`git log`, and definitely not `commit`/`push`/`tag`. This
does not change Claude Code's authority to edit files, implement, or
validate — only git execution moves off of Claude Code. When work is
validated and ready, Claude Code hands off to OpenAI Codex (or Bradley Potts
directly), which executes the git operations on Claude Code's behalf.

**OpenAI Codex, GitHub Copilot, and Google Jules** have full commit, push,
and tag authority in this repository, effective 2026-07-25 by explicit
direction from Bradley Potts — see the Commit Policy section in each agent's
own guide ([CODEX.md](CODEX.md), [COPILOT.md](COPILOT.md),
[JULES.md](JULES.md)). OpenAI Codex additionally now executes git operations
for Claude Code's handed-off work in this repo. **OpenAI Codex** additionally
has release authority:
Codex cuts releases autonomously — version bump, changelog versioning,
`v<version>` git tag, and GitHub Release publish via `gh` — for every
release-ready `CHANGELOG.md [Unreleased]` section, without waiting for
per-release approval; see `CODEX.md` "Release-Readiness Checklist" for the
full procedure. **npm publishing remains Bradley Potts's sole authority** —
no agent runs `npm publish`. Bradley Potts retains ultimate ownership and
can revoke or narrow any of this at any time. This grant covers git and
release operations within each agent's own scope of work as defined above —
it does not expand what any agent is authorized to decide otherwise.
ChatGPT has no repository access and is excluded.

**A commit is not finished until it is pushed.** Every agent with git
authority (OpenAI Codex, GitHub Copilot, Google Jules) must push immediately
after committing (`git push`, including any needed `-u`/tags) as part of the
same action — never leave a commit sitting local only. This closes a
recurring gap where an agent commits and stops short of pushing, leaving work
stranded on the machine.

**Commit authorship is human-only.** No agent adds itself (or any other AI)
as a commit author or co-author — no `Co-Authored-By: Claude`/`Codex`/
`Copilot`/`Jules` trailer, no author-field changes, in this repository. The
git author/committer stays Bradley Potts (or the configured human git user)
on every commit, regardless of which agent performed the work. Push and tag
authority above does not extend to authorship attribution.


## Cross-Repo Access

This repo may be worked on standalone or alongside any combination of other
PHCDevworks repos — do not assume the company root or sibling project areas
are present. The following rules are self-contained and apply whether or not
that broader context is available.

**File access.** An agent working in this repo has full read/write access to
every file in this repo. When this repo is present alongside other
PHCDevworks repos (company root or sibling `project-*` areas), the same full
read/write access extends to those repos too — there is no per-repo access
restriction anywhere in this workspace. What differs repo-to-repo is not
*access*, it's *editorial ownership*: each repo's own `CLAUDE.md`/`AGENTS.md`
still governs what changes make sense there (design-token authority, layer
boundaries, etc.) — being able to open and edit a file is not the same as it
being this repo's job to change it.

**Cross-repo changelog and TODO/roadmap requests.** Full rules: company root
[AGENTS.md](../../AGENTS.md) § "Cross-Repo Changelog Sync" and § "Upstream
Requests and Roadmap Self-Expansion." Applied here without exception — this
repo may append `[Unreleased]` changelog entries and downstream TODO requests
to other present repos per those rules, and no AI agent creates commits, tags,
publishes packages, or merges changes in this repo or any other unless that
repo's own agent guide explicitly grants that authority.

## Standard Handoff

Every AI-prepared change should report files changed, validation performed,
public behavior or contract impact, and unresolved risks. Do not edit generated
outputs directly. Do not update [CHANGELOG.md](CHANGELOG.md) unless the change
is release-relevant.

This repository is maintained by PHCDevworks and contains the reactive-primitives
package of the Spectre shell system.

## Instruction Map

| File                               | Audience                     | Purpose                                                              |
| ---------------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| `AGENTS.md`                        | All agents, especially Codex | Central role model, coordination rules, verification gate          |
| `CLAUDE.md`                        | Claude Code                  | Lead-development guide for implementation, architecture, and tests |
| `CODEX.md`                         | OpenAI Codex                 | Release-readiness, production stabilization, and config posture    |
| `JULES.md`                         | Google Jules                 | Bounded automated maintenance guidance                              |
| `COPILOT.md`                       | GitHub Copilot               | Role summary and development boundaries for GitHub Copilot         |
| `.github/copilot-instructions.md`  | GitHub Copilot               | In-editor suggestion boundaries                                     |
| `.claude/settings.json`            | Claude Code runtime           | Local command denies for commit, push, tag, merge, and publish     |
| `.coderabbit.yaml`                 | CodeRabbit                    | Automated review checks aligned with package boundaries            |
| `.github/dependabot.yml`           | Dependabot / Jules handoff    | Dependency-update cadence for automated maintenance                |

## Confidential External Identities

Never record external customer, vendor, user, client-site, or private-project
identities in tracked files, git metadata, reviews, releases, issues, or
handoffs. Use anonymous role-based wording such as "a downstream integration"
or "a production consumer." Public package and platform names are allowed
only when technically required to identify a dependency or supported
integration.

**Zero tolerance, no exceptions.** This is not a case-by-case judgment call.
Every upstream vendor, customer, client, or third-party identity — regardless
of how well-known, already public, or seemingly harmless — is forbidden from
appearing in any file, commit, tag, branch name, PR, issue, roadmap, TODO, or
agent output anywhere in this repo. If a vendor name is already present
anywhere in tracked files, it must be anonymized on sight, not left in place
because it predates this rule.

## Upstream Requests and Roadmap Self-Expansion

Full directive: project-team [AGENTS.md](../AGENTS.md) "Upstream Requests and
Roadmap Self-Expansion." Applied to this repo:

- This repo is an independent peer package — it has no upstream dependency
  within this workspace; do not invent one.
- Downstream repos `spectre-shell` (app-layer bridge) and `spectre-init`
  (scaffolds against it) may append reactive-primitive requests (e.g. a new
  export needed for `spectre-tokens`/`spectre-ui`/`spectre-ui-astro`
  integration) to this repo's own `TODO.md` under `## Requested by
  Downstream`, dated and linked back to the requesting repo's
  TODO.md/ROADMAP.md. Keep that section visible and separate from
  self-planned reactive-primitives work.
- This repo's own [ROADMAP.md](ROADMAP.md) may be proactively expanded with new
  or reordered phases by the agent's own analysis — but never mark a phase
  delivered without `npm run check` passing, and never add a store, async
  layer, or framework adapter export to satisfy a downstream request — see
  "What This Package Does Not Own" above; redirect that need upstream-of-need
  instead (e.g. to the consuming package's own integration layer).
- Surface any new TODO request or roadmap expansion in the handoff for Bradley
  Potts in the same change it was made, and reflect cross-repo-relevant
  changes in the project-team's own ROADMAP.md/TODO.md.

## Shared Source Rules

These rules apply to every agent without exception.

| Path                    | Status                  | Notes                                                                         |
| ----------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `src/`                  | **May edit**            | All primitive implementation; changes require test coverage                   |
| `tests/`                | **May edit**            | Test suite is part of the contract; behavior changes require test updates     |
| `src/index.ts`          | **May edit**            | Public re-exports only; new exports require reactive-primitives justification |
| `src/internals/`        | **May edit**            | `Node` and `tracking.ts` are private - do not export them                     |
| `README.md`, other docs | **May edit**            | Keep aligned with the actual public API                                       |
| `CHANGELOG.md`          | **May edit**            | Update `[Unreleased]` for all user-visible changes                            |
| `package.json`          | **May edit**            | Version follows semver; bump when publishing                                  |
| `dist/`                 | **Never edit directly** | Always regenerated by `npm run build`; manual edits are overwritten           |
| `spectre.manifest.json` | **May edit**            | Update when exports, Spectre dependencies, or stability change                |

Full validation command: `npm run check` (typecheck + lint + build + test +
check:version-sync + check:ecosystem). All six steps must pass before any
commit or handoff.

Detailed implementation workflow lives in `CLAUDE.md`. Human contribution
workflow lives in `CONTRIBUTING.md`. Strategic direction lives in `ROADMAP.md`.

## Agent-Specific Guides

- `CLAUDE.md` - primary development authority and implementation workflow.
- `CODEX.md` - documentation, release, stabilization, and repo hygiene workflow.
- `JULES.md` - bounded automated maintenance workflow.
- `COPILOT.md` and `.github/copilot-instructions.md` - support-assistant workflow.

## Pull Request Creation

Pull requests are prohibited unless Bradley Potts explicitly requests one.
The guidance below applies only to that explicit exception.

For an explicitly requested PR, populate every section of the repo's PR
template (`.github/pull_request_template.md`):

- **Summary** - linked issue (`#N` or N/A), what changed, and why.
- **Type of Change** - check every box that applies.
- **Package Boundary Check** - confirm the change stays within reactive-primitives
  scope with no drift into stores, frameworks, or app-specific logic.
- **Public API Impact** - state whether any export was added, changed, or removed.
- **Validation** - run `npm run check` and record the result.
- **Documentation Updated** - confirm README, CHANGELOG, and docs are aligned.
- **Release Impact** - state patch / minor / major or no release impact.
- **Codex Review Needed** - flag if documentation, release notes, or hygiene
  review is warranted.

Never submit a PR with an empty body or only the template headings left unfilled.

## Mission

`@phcdevworks/spectre-shell-signals` is the minimal reactive-primitives package
for the Spectre system. It provides a small, framework-agnostic foundation for
local reactive state, derived values, and reactive effects — a tiny, predictable
reactivity layer that other Spectre packages and compatible applications can build
on without inheriting a full state-management framework.

The reactive foundation (`signal`, `computed`, `effect`, `batch`) is stable and
published. The current focus is integration: getting these primitives actively
consumed by `spectre-tokens`, `spectre-ui`, and `spectre-ui-astro`. Work in this
repository should serve that integration goal — hardening the contract, improving
integration ergonomics, and documenting consuming-package patterns.

This package must stay narrow, explicit, portable, and easy to reason about.

## Core Rules

1. Keep the public API tiny: `signal`, `computed`, `effect`, `batch`, and directly
   related types only.
2. Prefer explicit behavior over magical behavior.
3. Prefer readable internals over abstraction-heavy architecture.
4. Protect synchronous, predictable semantics.
5. Do not introduce new exports without a clear reactive-primitives justification.
6. Do not build for hypothetical future requirements.
7. Do not add framework concepts or turn primitives into a store library.
8. Tests are part of the contract — behavior changes require test updates.
9. Keep package metadata, README, and docs aligned with the actual implementation.
10. Do not expand this package into stores, async layers, persistence, or
    framework-specific behavior.
11. All `scripts/` tooling is TypeScript (`.ts`), run via
    `node --experimental-strip-types`; never add a new `.js`/`.mjs` script.

## What This Package Does Not Own

Agents must not add or expand into:

- global store architecture or app-wide state containers
- business or domain state modeling
- router or URL state
- shell orchestration or component rendering
- DOM binding helpers
- React, Vue, Solid, Astro, or framework-specific adapters
- async cache or query layers
- persistence or localStorage/sessionStorage helpers
- event buses or observable streams
- selectors as a store pattern
- middleware or plugin systems
- devtools, inspectors, dashboards, or debugging overlays
- scheduler complexity beyond minimal reactive correctness
- speculative extension hooks for future use

If a proposed feature is not directly required for `signal`, `computed`, `effect`,
dependency tracking, invalidation, cleanup, or disposal, it does not belong in
this repository.

## Repository Boundaries

This package is the reactive primitive foundation for the Spectre stack. The
consuming packages, in dependency order:

| Package                             | Role                                   | Integration target           |
| ----------------------------------- | -------------------------------------- | ---------------------------- |
| `@phcdevworks/spectre-tokens`       | Visual language and token contracts    | Reactive token values        |
| `@phcdevworks/spectre-ui`           | Token-driven styling and class recipes | Reactive component state     |
| `@phcdevworks/spectre-ui-astro`     | Astro component layer                  | Island lifecycle integration |
| `@phcdevworks/spectre-shell`        | Shell composition and runtime surface  | —                            |
| `@phcdevworks/spectre-shell-router` | Routing primitives                     | —                            |

`spectre-shell-signals` owns reactive primitives only. Do not pull responsibilities
across these lines in either direction — signals does not own rendering, routing,
tokens, or component logic.

## Ecosystem Manifest

`spectre.manifest.json` at the root is this package's declaration in the Spectre
ecosystem contract, validated by `@phcdevworks/spectre-manifest`. It records role,
layer, exports, and allowed Spectre dependency targets. `check:ecosystem` validates
it as part of `npm run check`.

Keep `spectre.manifest.json` in sync when:

- Package exports in `package.json` are added or removed
- A Spectre package dependency is added or removed
- The package stability changes

Do not add a `consumers` field — that belongs in the central
`@phcdevworks/spectre-manifest` registry.
