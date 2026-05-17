# Codex Project Profile

This directory contains optional project-local Codex guidance for
`@phcdevworks/spectre-shell-signals`.

OpenAI Codex reads `AGENTS.md` files for persistent guidance. The repository
root `AGENTS.md` is the normal project instruction file. This `.codex/AGENTS.md`
file is an optional Codex-home profile for sessions where Bradley wants Codex to
operate explicitly as the release/readiness counterpart.

## Use

From the repository root:

```bash
CODEX_HOME=$(pwd)/.codex codex "Summarize the current instructions."
```

With that profile active, Codex loads `.codex/AGENTS.md` as global guidance and
then loads the repository root `AGENTS.md` as project guidance.

## Files

- `AGENTS.md` defines Codex's release-agent role for this package.
- `release-checklist.md` captures the production-readiness gate Codex should
  apply before release or PR handoff work.

Do not store secrets, tokens, local credentials, or machine-specific paths in
this directory.

Reference: https://developers.openai.com/codex/guides/agents-md
