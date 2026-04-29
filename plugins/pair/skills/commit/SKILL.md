---
name: commit
description: Generate a conventional-commit message from staged changes and commit
disable-model-invocation: true
model: claude-haiku-4-5-20251001
allowed-tools: Bash(git add:*), Bash(git diff:*), Bash(git commit:*), Bash(git rev-parse:*), Bash(mkdir:*), Read
---

# commit

Generate a Conventional Commits message from the currently staged changes (auto-staging working tree first) and create the commit. Scope is extracted from the current branch name (Jira / Azure DevOps ticket id).

## Arguments

- `$1` — language for the commit subject (default: `en`). Examples: `en`, `pt-BR`, `es`.

## Flow

1. **Resolve language.** If `$1` is empty, use `en`. Otherwise use `$1` verbatim.

2. **Get current branch name.**

   ```bash
   git rev-parse --abbrev-ref HEAD
   ```

3. **Extract ticket id from the branch name** to use as commit scope. Try these regex patterns in order, stop at the first match:
   1. Jira-style: `[A-Z][A-Z0-9]+-\d+` — e.g. `JIRA-1234`, `PROJ-567`, `ABC123-45`. Uppercase prefix is required.
   2. Azure DevOps with prefix: `AB#\d+` or `#\d+` — e.g. `AB#1234`, `#567`.
   3. Azure DevOps bare number: the segment right after a type prefix that is pure digits — e.g. `feat/1234-desc` → `1234`.
   4. No match → no scope.

   If a ticket is extracted, use it **verbatim** as the scope. Never invent or normalize a scope that was not present in the branch.

4. **Stage and save the diff.**

   ```bash
   git add . && mkdir -p ./tmp && git diff --cached > ./tmp/diff.txt
   ```

   Then read `./tmp/diff.txt` to analyze the changes.

5. **Check for project commit conventions.**

   Try to read `./CLAUDE.md`. If it exists and contains a section about commit message format or conventions, use those rules as the primary format guide in step 6. If the file does not exist or has no relevant section, fall back to the default rules in step 6.

6. **Generate the commit message.**

   If project conventions were found in step 5, follow them. Otherwise apply these defaults:
   - **Format:** `type(scope): subject` if a ticket was extracted, otherwise `type: subject`.
   - **Type** (Conventional Commits): one of `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - **Scope:** only when extracted in step 3, verbatim (e.g. `JIRA-1234`).
   - **Subject:**
     - Imperative mood ("add", not "added" / "adds").
     - Starts with a lowercase letter.
     - Max **100 characters total** for the full line (`type(scope): subject`).
     - No "and" / "or".
     - No markdown, no backticks, no trailing period.
     - Written in the language requested by `$1`.
   - Output only the final line. No explanation, no quotes around it.

7. **Create the commit.**

   ```bash
   git commit -m "<generated message>"
   ```

8. **Report back** in plain text:
   - The extracted ticket (or `no ticket detected`).
   - The resulting commit SHA (from `git rev-parse HEAD` or the `git commit` output).
   - The commit message exactly as used.

## Examples

- Branch `feat/JIRA-1234-add-some-feature` → `feat(JIRA-1234): add some feature to some place`
- Branch `bugfix/PROJ-567-null-check` → `fix(PROJ-567): guard against null user`
- Branch `feature/AB#890-login-timeout` → `fix(AB#890): extend login timeout`
- Branch `feat/1234-new-page` → `feat(1234): add new page`
- Branch `feat/add-login` (no ticket) → `feat: add login form`
