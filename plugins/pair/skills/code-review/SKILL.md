---
name: code-review
description: Review the diff between current branch and a base branch, saving a numbered report
disable-model-invocation: true
model: claude-opus-4-7
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(mkdir:*), Write, Read
---

# code-review

Produce a code review of everything on the current branch that is not on the base branch. The review is saved to `./tmp/code-review.md` with issues numbered globally so the user can reference them by number ("fix 2", "ignore 3").

## Arguments

- `$1` — base branch to compare against (default: `dev`). Examples: `dev`, `main`, `origin/main`.
- `$2` — output language (default: `en`). Examples: `en`, `pt-BR`.

## Flow

1. **Resolve arguments.** `branch = $1 || dev`, `language = $2 || en`.

2. **Capture the diff.**

   ```bash
   git log --patch --graph <branch>..
   ```

3. **Save the diff for inspection.**

   ```bash
   mkdir -p ./tmp
   ```

   Write the output of step 2 to `./tmp/diff.txt`.

4. **Resolve the review template** in this order (stop at the first found):
   1. `./tmp/templates/code-review.md` — user project override
   2. `${CLAUDE_PLUGIN_ROOT}/skills/code-review/template.md` — plugin default

   Use `Read` on each candidate in order; if the file exists, that is the active template.

5. **Analyze the diff** using the following reference criteria (the nine categories from the original pair-ai prompt). Provide feedback **only** on points that were NOT achieved — do not praise what works.
   - **Design**
     - Do the interactions between parts of the code make sense?
     - Does the change integrate well into the existing system?
     - Is it the right time to add this functionality?
   - **Functionality**
     - Does the change achieve what the developer intended?
     - Is it beneficial for end-users and future developers?
     - Are there potential concurrency issues (deadlocks, race conditions)?
   - **Complexity**
     - Is the code more complex than it needs to be?
     - Can it be simplified?
     - Signs of over-engineering or speculative features?
   - **Tests**
     - Are adequate tests included (unit, integration, e2e)?
     - Are the tests correct, sensible, useful?
     - Do they fail when the code is wrong and stay valid under future changes?
   - **Code style**
     - Are variable/function/class names descriptive?
     - Any unnecessary or redundant code?
     - Leftover `console.log` / `alert` statements?
   - **Comments**
     - Do comments explain the _why_, not the _what_?
     - Any outdated comments or TODOs to remove?
   - **Commits**
     - Are commits clear and concise?
     - Do they follow Conventional Commits?
   - **Security**
     - Hard-coded sensitive data, weak credential handling, missing authn/authz on private requests, unvalidated user input, unsanitized special characters, error messages leaking info, sensitive data in logs, unsafe file uploads.
     - Files that should not be committed: `.env*`, credentials, private keys (`*.pem`, `*.key`, `id_rsa`), auth tokens, cloud service account JSON, local config with secrets, build artifacts, large binaries, or anything matching common secret patterns. Flag these for immediate removal from the branch and rotation of any leaked secret.
   - **Performance**
     - Inefficient algorithms, memory leaks, wasteful CPU loops, missing indexes or pagination on queries, missing caching/memoization for expensive work, unparallelized opportunities, unoptimized network requests.

6. **If there are NO issues**, write exactly this line (translated to `$2` language) as the entire review body:

   > No points of attention in the code

7. **Otherwise, format the review** following the resolved template from step 4. Mandatory rules that override the template:
   - **Every issue gets a sequential number starting at 1, counted globally across all categories.** Do NOT reset numbering per category. This is how the user references issues ("ignore 2", "fix 3").
   - Group issues by category heading (bold markdown), but keep the global numbering continuous across groups.
   - Each issue: one-line title, short explanation, and when relevant a code diff block showing the before/after with file path.
   - Simple, objective language. Markdown output. Written in `$2`.

8. **Save the review.**
   Write the final markdown to `./tmp/code-review.md`.

9. **Report back** in plain text (in `$2` language):
   - Which template was used (the file path).
   - The diff file path (`./tmp/diff.txt`).
   - The review file path (`./tmp/code-review.md`).
   - A summary line: `Found N issues (1..N). Reference by number to act on them.` (adapt to the language).
