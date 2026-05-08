---
name: pull-request
description: Generate a PR description from commits between the current branch and a base branch
disable-model-invocation: true
context: fork
model: claude-sonnet-4-6
allowed-tools: Bash(git log:*), Bash(mkdir:*), Write, Read, Glob
---

# pull-request

Generate a pull-request description from the commits on the current branch that diverge from a base branch. The description is saved to `./tmp/pull-request.md`, following (in order of preference) a user override, the repo's GitHub PR template, or the skill's default template.

## Arguments

- `$1` — base branch to compare against (default: `dev`). Examples: `dev`, `main`, `origin/main`.
- `$2` — output language (default: `en`). Examples: `en`, `pt-BR`.

## Flow

1. **Resolve arguments.** `branch = $1 || dev`, `language = $2 || en`.

   > **Language lock:** every heading, label, sentence, placeholder, and the report-back message must be written in `$2`. The template defines layout only — translate all its text to `$2`.

2. **Capture and save the diff.**

   ```bash
   mkdir -p ./tmp && git log --patch --graph <branch>.. > ./tmp/diff.txt
   ```

   Then read `./tmp/diff.txt` to analyze the changes.

3. **Resolve the PR template** in this order (stop at the first found):
   1. `./tmp/templates/pull-request.md` — user project override
   2. GitHub convention, checked in this order:
      - `.github/pull_request_template.md`
      - `.github/PULL_REQUEST_TEMPLATE.md`
      - `.github/pull_request_template/` or `.github/PULL_REQUEST_TEMPLATE/` — if it is a directory, use the first `*.md` inside (check with `Glob` pattern `.github/{pull_request_template,PULL_REQUEST_TEMPLATE}/*.md`).
   3. `${CLAUDE_PLUGIN_ROOT}/skills/pull-request/template.md` — plugin default

   Use `Read` on each candidate in order. The first existing file wins.

4. **Generate the PR description** following the resolved template:
   - **The PR title is mandatory.** Every output must begin with a title line, regardless of template. No exceptions.
   - Fill every section of the template using what the diff from step 2 actually shows. Do not invent content; if a section cannot be filled from the diff, keep the heading with a brief honest placeholder like `N/A` or a single-line summary.
   - Use simple, clear, objective, concise language.
   - Markdown output.
   - Written in `$2` language.
   - Write only what fits the description — no long commit-by-commit walkthroughs.

   **If the skill default (template 3.iii) is the active template**, follow its format exactly: the title line must be tagged as `# [Feat|Fix|Refactor|Test|Chore|Docs|Style|Perf|Build|CI|Revert|WIP] <title>`, with sections `## Context`, `## Changes`, `## Observations`.

5. **Save the description.**
   Write the final markdown to `./tmp/pull-request.md`.

6. **Report back** in plain text (in `$2` language):
   - Which template was used (the file path).
   - The diff file path (`./tmp/diff.txt`).
   - The PR description file path (`./tmp/pull-request.md`).
