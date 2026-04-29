---
name: code-review
description: Review the diff between current branch and a base branch, saving a numbered report
disable-model-invocation: true
model: claude-opus-4-7
allowed-tools: Bash(git log:*), Bash(mkdir:*), Write, Read
---

# code-review

Produce a code review of everything on the current branch that is not on the base branch. The review is saved to `./tmp/code-review.md` with issues numbered globally so the user can reference them by number ("fix 2", "ignore 3").

## Arguments

- `$1` — base branch to compare against (default: `dev`). Examples: `dev`, `main`, `origin/main`.
- `$2` — output language (default: `en`). Examples: `en`, `pt-BR`.

## Flow

1. **Resolve arguments.** `branch = $1 || dev`, `language = $2 || en`.

2. **Capture and save the diff.**

   ```bash
   mkdir -p ./tmp && git log --patch --graph <branch>.. > ./tmp/diff.txt
   ```

   Then read `./tmp/diff.txt` to analyze the changes.

3. **Resolve the review template** in this order (stop at the first found):
   1. `./tmp/templates/code-review.md` — user project override
   2. `${CLAUDE_PLUGIN_ROOT}/skills/code-review/template.md` — plugin default

   Use `Read` on each candidate in order; if the file exists, that is the active template.

4. **Analyze the diff** as a senior engineer who has seen production incidents firsthand. Your role is the trusted friend who tells hard truths before they become 3am alerts — not after. Do not soften or omit concerns to be polite. Provide feedback **only** on points that were NOT achieved — do not praise what works.

   Assign a severity label to every issue:
   - **[CRITICAL]** — can cause data loss, security breach, service outage, or irreversible damage in production.
   - **[HIGH]** — likely to cause significant degradation, data exposure, or bugs under real load or adversarial input.
   - **[MEDIUM]** — real risk that may not surface immediately but will eventually hurt.
   - **[LOW]** — code quality, style, or minor correctness issues with low production impact.

   Pay extra attention to **Security**, **Performance**, and **Database** — treat every finding in those three categories as potentially production-critical until the context clearly shows it is mitigated.

   - **Design**
     - Do the interactions between parts of the code make sense?
     - Does the change integrate well into the existing system?
     - Is it the right time to add this functionality?

   - **Functionality**
     - Does the change achieve what the developer intended?
     - Is it beneficial for end-users and future developers?
     - Concurrency issues: deadlocks, race conditions, shared mutable state.
     - Edge cases silently swallowed or not handled.

   - **Complexity**
     - Is the code more complex than it needs to be?
     - Can it be simplified?
     - Signs of over-engineering or speculative features?

   - **Tests**
     - Are adequate tests included (unit, integration, e2e)?
     - Are the tests correct, sensible, and useful?
     - Do they fail when the code is wrong and stay valid under future changes?
     - Are critical paths (auth, payments, data mutations) covered?

   - **Code style**
     - Are variable/function/class names descriptive?
     - Any unnecessary or redundant code?
     - Leftover `console.log` / `alert` / debug statements?

   - **Comments**
     - Do comments explain the _why_, not the _what_?
     - Any outdated comments or TODOs to remove?

   - **Commits**
     - Are commits clear and concise?
     - Do they follow Conventional Commits?

   - **Security** — default to [HIGH] or [CRITICAL] unless context clearly shows mitigation:
     - Hard-coded credentials, API keys, tokens, or secrets anywhere in the code.
     - Files that must never be committed: `.env*`, private keys (`*.pem`, `*.key`, `id_rsa`), cloud service account JSON, auth tokens, local configs with secrets. Flag for immediate removal from the branch and rotation of any exposed secret.
     - Unvalidated or unsanitized user input passed to queries, shell commands, file paths, or HTML output (SQL/NoSQL injection, XSS, path traversal, command injection).
     - Missing or bypassable authentication/authorization on sensitive operations (broken access control, IDOR).
     - JWT issues: `none` algorithm accepted, missing expiration, weak or hard-coded secret.
     - Sensitive data returned in API responses or written to logs (passwords, PII, tokens).
     - Missing rate limiting or brute-force protection on auth or sensitive endpoints.
     - SSRF: user-controlled URLs fetched server-side without allowlist validation.
     - Mass assignment: request body bound to a model without an explicit allowlist of fields.
     - Error messages that leak stack traces, internal paths, or system details to the client.

   - **Performance** — flag anything that will degrade under real production load:
     - N+1 query patterns: a DB/API call inside a loop. Always [HIGH].
     - Queries or API calls without `LIMIT`/pagination that can return unbounded result sets.
     - Blocking/synchronous operations where async would prevent thread starvation.
     - In-memory operations on datasets that will grow (sorting, filtering without pushing work to the DB).
     - Missing caching or memoization for expensive, repeated, or rarely-changing computations.
     - Regex patterns susceptible to catastrophic backtracking on untrusted input.
     - Independent I/O operations that could run in parallel but run sequentially.
     - Large response payloads returned without compression, streaming, or pagination.

   - **Database** — default to [HIGH] or [CRITICAL] unless context clearly shows mitigation:
     - N+1 queries (also flag under Performance).
     - Queries missing `WHERE` clauses or using unbounded `SELECT *` on tables that will grow.
     - Missing indexes on columns used in `WHERE`, `JOIN`, or `ORDER BY` for new queries.
     - Multiple related writes executed without a wrapping transaction — partial failures corrupt data.
     - Migrations that lock tables: adding a NOT NULL column without a default on a large table, renaming or dropping a column still referenced by running code, index creation without `CONCURRENTLY`.
     - Raw string interpolation in SQL, even inside ORMs via `raw()`/`query()` — SQL injection risk.
     - No rollback handling when a step inside a transaction fails.
     - Cascade deletes or updates that could silently affect large volumes of related data.
     - Soft-delete patterns applied inconsistently — queries that forget to filter out deleted records.
     - Storing large blobs (images, files, documents) in the database instead of object storage.

5. **If there are NO issues**, write exactly this line (translated to `$2` language) as the entire review body:

   > No points of attention in the code

6. **Otherwise, format the review** following the resolved template from step 3. Mandatory rules that override the template:
   - **Every issue gets a sequential number starting at 1, counted globally across all categories.** Do NOT reset numbering per category. This is how the user references issues ("ignore 2", "fix 3").
   - Each issue number must be followed by its severity label: `1. [CRITICAL]`, `2. [HIGH]`, etc.
   - Group issues by category heading (bold markdown), but keep the global numbering continuous across groups.
   - Each issue: one-line title with severity, short explanation of the **real-world consequence** if not fixed, and when relevant a code diff block showing the before/after with file path.
   - Simple, direct language — name the risk plainly. Markdown output. Written in `$2`.

7. **Save the review.**
   Write the final markdown to `./tmp/code-review.md`.

8. **Report back** in plain text (in `$2` language):
   - Which template was used (the file path).
   - The diff file path (`./tmp/diff.txt`).
   - The review file path (`./tmp/code-review.md`).
   - A summary line: `Found N issues (1..N). Reference by number to act on them.` (adapt to the language).
