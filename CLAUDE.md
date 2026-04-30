# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Claude Code plugin called `pair` that ships six user-invocable skills:
`/pair:commit`, `/pair:code-review`, `/pair:pull-request`, `/pair:handoff`, `/pair:explain`, `/pair:guide`. There is no
application code, no build step, and no test suite — the deliverable is the
markdown `SKILL.md` files under `plugins/pair/skills/` plus their templates.

## Layout (non-obvious bits)

- [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) — marketplace manifest pointing at `./plugins/pair`.
- [`plugins/pair/.claude-plugin/plugin.json`](plugins/pair/.claude-plugin/plugin.json) — plugin manifest (`name`, `version`).
- [`plugins/pair/skills/<skill>/SKILL.md`](plugins/pair/skills/) — each skill is a markdown file with YAML frontmatter. Frontmatter fields that matter:
  - `allowed-tools` — the skills are deliberately restricted to narrow `Bash(git …:*)` invocations plus `Write`/`Read`/`Glob`. Keep additions minimal when editing.
  - `disable-model-invocation: true` — these skills only run when the user types `/pair:<name>`; the model must not auto-invoke them.
- `plugins/pair/skills/code-review/template.md`, `plugins/pair/skills/pull-request/template.md`, `plugins/pair/skills/handoff/template.md`, `plugins/pair/skills/explain/template.md`, and `plugins/pair/skills/guide/template.md` — the built-in output templates referenced inside the skills via `${CLAUDE_PLUGIN_ROOT}`.
- [`NOTES.md`](NOTES.md) — Portuguese roadmap of planned skills (`handoff`, `explain`, `guide`, `create-prd`, `create-epic`, `create-task`, `verify`). Treat as backlog, not spec.
- `tmp/` is gitignored; it holds the user-project output of the skills (`diff.txt`, `code-review.md`, `pull-request.md`, `handoff.md`, `explain.md`, `guide.md`) and is also the location users use to override templates (`tmp/templates/<skill>.md`).

## Local development loop

```bash
claude --plugin-dir ./plugins/pair
```

Inside that session, run `/reload-plugins` after editing any `SKILL.md` or
template to pick up changes without restarting. There is no lint/build/test
to run — validation happens by invoking the skill and checking the files
written under `./tmp/`.

## Cross-skill contracts (don't break these)

- **Output paths are part of the public contract.** `commit` writes `./tmp/diff.txt`; `code-review` writes `./tmp/diff.txt` and `./tmp/code-review.md`; `pull-request` writes `./tmp/diff.txt` and `./tmp/pull-request.md`; `handoff` writes `./tmp/diff.txt` and `./tmp/handoff.md`; `explain` writes `./tmp/diff.txt` and `./tmp/explain.md`; `guide` writes `./tmp/guide.md` only (no diff — it is prospective). Users rely on these paths — do not rename them.
- **Template resolution order is fixed** and must be preserved when editing either skill:
  1. `./tmp/templates/<skill>.md` (user project override)
  2. For `pull-request` only: `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE.md`, then first `*.md` inside `.github/{pull_request_template,PULL_REQUEST_TEMPLATE}/`.
  3. `${CLAUDE_PLUGIN_ROOT}/skills/<skill>/template.md` (plugin default)
- **Global issue numbering** in `code-review` is load-bearing: issues are numbered sequentially across all categories (never reset per category) so users can say "fix 2 / ignore 3". Any template override — including user overrides in `tmp/templates/code-review.md` — must preserve this. The default template restates this rule in its "Format rules" section; keep that restatement in sync with the skill.
- **Commit scope extraction order** in `commit` (first match wins): Jira `[A-Z][A-Z0-9]+-\d+` → Azure DevOps `AB#\d+` / `#\d+` → bare digits after a type prefix (e.g. `feat/1234-…`). Scope is used verbatim — never normalize or invent one.
- **Commit subject limit** is 100 characters for the full `type(scope): subject` line, imperative mood, lowercase first letter, no trailing period, no "and"/"or".
- All skills accept a trailing **language argument** (`en` default, e.g. `pt-BR`, `es`); the output (commit message / review body / PR description / handoff / explain / guide document) must be written in that language while the skill's own status report can follow suit.

## When adding a new skill

- Create `plugins/pair/skills/<name>/SKILL.md` with `disable-model-invocation: true` and a narrowly-scoped `allowed-tools` list.
- If it produces a document, write it under `./tmp/<name>.md` and resolve templates in the same three-step order (`./tmp/templates/<name>.md` → any repo-convention path if relevant → `${CLAUDE_PLUGIN_ROOT}/skills/<name>/template.md`).
- The skill itself should end by reporting back which template was used and the output path(s), matching the pattern of the existing three.
- Bump `plugins/pair/.claude-plugin/plugin.json#version` when the change is user-visible.
