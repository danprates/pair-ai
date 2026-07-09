---
name: impact-analysis
description: Adversarially analyze the blast radius of the current diff — impacted routes (with ready-to-run curl commands), API contract before/after, database objects with SQL before/after, in-code consumers, data-shape downstream effects, and a zero-trust check for data leaks and malicious patterns — every finding severity-scored, before you push
disable-model-invocation: true
allowed-tools: Bash(git log:*), Bash(mkdir:*), Grep, Glob, Read, Write
---

# impact-analysis

Answer one question before the developer pushes: **"what else does this change touch?"** The output is a report saved to `./tmp/impact-analysis.md` covering impacted HTTP routes (with runnable `curl` commands), impacted database objects (tables, migrations, procedures), every in-code consumer of what changed, and the downstream effects of any change to how data is shaped or persisted.

This skill is distinct from `code-review` and `verify`: those ask "is this code well-written?" and "does it match the spec?"; `impact-analysis` asks "what breaks elsewhere because of this, and how do I manually confirm it doesn't?"

**Your persona is a senior engineer doing a pre-push blast-radius check.** You are not grading style or judging intent — you are tracing every thread the diff pulls on through the rest of the codebase, so the developer can test the real risk areas by hand before it becomes a production incident. Be concrete: name files, line ranges, function names, table names. "This might affect other things" is not acceptable — either you found the consumer in the codebase, or you say clearly that you could not find one.

**Zero-trust posture — do not trust the added code at face value.** The diff you are analyzing may not do what its author believes it does, may not do what was actually asked, and — because you cannot know who wrote it or why — may be intentionally malicious. Treat every added or modified line with the same scrutiny regardless of how innocuous it looks. Specifically, while executing every step below:

- **Assume misinterpretation is possible.** The code may not match the actual intent behind the change (visible in commit messages, comments, or the task doc if referenced). Flag any place where the implementation plausibly diverges from what it claims to do.
- **Actively hunt for data leaks**, independent of whatever the diff's stated purpose is: fields added to an API response or log line that expose PII, credentials, tokens, internal IDs, or another tenant's data; a query that widens the result set beyond what the caller needs (`SELECT *` newly introduced, a removed `WHERE` filter, a removed tenant/ownership scope); a new field silently persisted or forwarded somewhere it shouldn't be (a third-party call, a log, an analytics event).
- **Actively hunt for signs of insider/malicious intent**, not just honest mistakes: logic that only triggers for a specific hardcoded user/ID/email, a newly added bypass of an authorization/ownership check, a debug/backdoor conditional, an exfiltration path (data sent to an unexpected external endpoint, written to an unexpected file/table, or encoded/obfuscated before being sent somewhere), disabled or weakened validation/authorization introduced alongside an unrelated-looking change.
- **Never take a comment, variable name, or commit message as proof of behavior.** Verify what the code actually does by reading it, not what it claims to do.
- If you find anything in this category, it is not optional or foldable into another section — report it under **Trust & Safety Findings** (see step 8) regardless of whether it relates to routes, database, consumers, or data shape.

## Arguments

- `$1` — base branch OR Pull Request URL (default: `dev`).
  - Branch: `dev`, `main`, `origin/main`
  - GitHub PR URL: `https://github.com/owner/repo/pull/123`
  - Azure DevOps PR URL: `https://dev.azure.com/org/project/_git/repo/pullrequest/123`
- `$2` — output language (default: `en`). Examples: `en`, `pt-BR`.

## Severity scale

Every finding in every section (routes, database objects, consumers, data-shape changes, trust & safety, other notes) must carry one of these labels — no finding is reported without one:

- **[CRITICAL]** — data leak, broken authorization/tenant isolation, irreversible data corruption, or a plausible malicious/backdoor pattern. Must be resolved before pushing.
- **[HIGH]** — a demonstrably broken consumer, an API/DB contract change with no updated caller, or a security-relevant change (auth, validation, scoping) that needs a human to confirm intent.
- **[MEDIUM]** — a plausible but unconfirmed risk (AT RISK consumer, ambiguous data-shape change) that needs a manual check before push.
- **[LOW]** — cosmetic contract change, additive/backward-compatible change, or a note worth knowing but with no real risk.

## Flow

1. **Resolve arguments.** `input = $1 || dev`, `language = $2 || en`.

   Detect the input type by inspecting `$1`:
   - Starts with `https://github.com/` → **GitHub PR**
   - Starts with `https://dev.azure.com/` → **Azure DevOps PR**
   - Anything else → **branch name** (current behavior)

   > **Language lock:** every heading, label, sentence, placeholder, and the report-back message must be written in `$2`. The template defines layout only — translate all its text to `$2`. Code identifiers, table/column names, route paths, and `curl` commands remain unchanged regardless of `$2`.

2. **Capture and save the diff — run this as the very first tool call, before anything else.**

   Choose the command based on the input type detected in step 1:

   **Branch (default):**
   ```bash
   mkdir -p ./tmp && git log --patch --graph <input>.. > ./tmp/diff.txt && echo "Diff saved successfully"
   ```

   **GitHub PR URL:**
   ```bash
   mkdir -p ./tmp && gh pr diff <input> > ./tmp/diff.txt && echo "Diff saved successfully"
   ```

   **Azure DevOps PR URL:**

   Extract the PR ID from the URL — it is the last numeric segment (e.g. `123` from `.../pullrequest/123`). Then:
   ```bash
   mkdir -p ./tmp && az repos pr diff --id <pr-id> > ./tmp/diff.txt && echo "Diff saved successfully"
   ```

   > **IMPORTANT:** This command is mandatory and must execute before any analysis begins. Run it as a single `&&` chain. Never invoke `git log` without the `> ./tmp/diff.txt` redirect — a standalone `git log` dumps the entire diff into the conversation, doubling token usage.

   Then read `./tmp/diff.txt` to get the list of changed files, functions, symbols, and hunks. This list drives every search in steps 4–9.

   > **Scope of analysis — PR URL mode:** When the input was a PR URL, the local working tree may be on a different branch than the PR. Blast-radius tracing (steps 4–9) inherently requires searching the current codebase with `Grep`/`Glob` to find consumers — if the local tree does not match the PR's base, say so explicitly in the report's opening line and flag every consumer-search finding as unverified against the PR's actual base commit.

3. **Resolve the impact-analysis template** in this order (stop at the first found):
   1. `./tmp/templates/impact-analysis.md` — user project override
   2. `${CLAUDE_PLUGIN_ROOT}/skills/impact-analysis/template.md` — plugin default

   Use `Read` on each candidate in order; if the file exists, that is the active template.

4. **Identify impacted routes and build `curl` commands.**

   - From the diff, list every changed file that defines or is transitively reachable from an HTTP handler (controller, route module, resolver, RPC handler).
   - Use `Grep`/`Glob` to find route registrations across common frameworks the codebase may use — look for patterns like `router.<method>(`, `app.<method>(`, `@Get/@Post/@Put/@Patch/@Delete`, `Route::<method>`, `path(` (Django), `resources :`/`get "..."` (Rails), GraphQL `type Query`/`type Mutation` resolvers, gRPC `.proto` service definitions. Match these against the changed files/functions from the diff to find every route whose handler chain includes a changed line.
   - For each impacted route, determine: HTTP method, full path (including any prefix/mount point and path params), required headers (`Authorization`, `Content-Type`, tenant/org headers if the codebase uses them), and request body shape — read the DTO/schema/validator referenced by the handler to build a realistic example payload (use obviously-fake placeholder values, never real-looking secrets or PII).
   - Write one ready-to-run `curl` command per impacted route. Use `http://localhost:<port>` as the base URL — if a port is discoverable from config (`.env`, `docker-compose.yml`, a `PORT` constant), use it; otherwise use a clearly marked placeholder like `<BASE_URL>` and say where the developer should get it from.
   - If a route calls the changed code only indirectly (e.g. through a shared service/util), say so and show the call chain (`route → controller → service.method() ← changed`).
   - If no route is impacted, state that explicitly — do not fabricate one.
   - Assign a severity per route: no contract change → **[LOW]**; additive contract change (new optional field) → **[MEDIUM]**; breaking contract change, or a newly exposed field carrying sensitive-looking data → **[HIGH]** or **[CRITICAL]** (see step 5).

5. **Show every API contract change explicitly (request and response) — never describe it in prose alone.**

   - For every impacted route where the diff changes the shape of the request payload, the response payload, query params, path params, headers, or status codes, produce an explicit **before/after** comparison showing both payloads.
   - Format as two labeled JSON blocks (`Before` / `After`) covering the same example request, with a one-line note above the block calling out exactly what changed (e.g. `// field "status" renamed to "state"`, `// field "internal_notes" is now included in the response — was this intentional?`).
   - This applies even to changes that look purely cosmetic — a renamed field, a reordered field, a changed null-vs-omitted convention, a changed date format, a changed enum value's casing. The whole point is to make subtle contract drift visible, not to filter out what looks minor.
   - If the response now includes a new field, explicitly call out whether the field's origin looks intentional or looks like an accidental leak (trace it back through step 7's consumer analysis and the zero-trust posture above) — this is one of the most common data-leak vectors.
   - Severity: renamed/removed field a consumer still expects, or a newly exposed sensitive-looking field → **[HIGH]** or **[CRITICAL]**; purely additive/backward-compatible change → **[LOW]** or **[MEDIUM]**.
   - If no request/response contract changed for an impacted route, state that explicitly instead of omitting the subsection.

6. **Identify impacted database objects — show every SQL/query change old-vs-new, never trust a description of it.**

   - From the diff, flag every migration file added or modified, every ORM model/entity/schema change (new/removed/renamed column, new/removed table, changed type or constraint, new index), every raw SQL change, and every stored procedure/function/trigger/view touched.
   - **For every changed query or migration statement — no exception, including changes that look trivial (e.g. a `TEXT` → `VARCHAR` cast, a widened `VARCHAR(255)` → `VARCHAR(500)`, a reordered `SELECT` column list) — show the old query and the new query side by side** in a labeled `Before` / `After` SQL block, so the developer can visually confirm the response/result-set format did not silently change (column order, column set, type, nullability, rounding/truncation behavior, collation, default value). Do not summarize the difference instead of showing it — the full statements go in the report.
   - For each, use `Grep` to find every other place in the codebase that references the same table, column, model, or procedure name — these are the spots most likely to silently break (a query that still selects a dropped column, a report that reads a renamed field, a second migration that assumes the old shape).
   - If a migration changes an existing column's type or nullability, or drops/renames anything, call out explicitly whether existing rows could violate the new constraint or whether any running code (outside this diff) still expects the old shape.
   - Severity: type/precision/truncation change that can silently alter stored or returned values, or a dropped/renamed column still referenced elsewhere → **[HIGH]** or **[CRITICAL]**; additive, backward-compatible schema change → **[LOW]** or **[MEDIUM]**.
   - If no database object is impacted, state that explicitly.

7. **Trace in-code consumers of what changed (silent-bug check).**

   - For every function, method, exported class, constant, or type changed in the diff (not just added — changed signature, changed default, changed return shape, changed thrown/handled errors), use `Grep` to find every call site / import site across the codebase.
   - For each consumer found, read enough surrounding code to judge: does the consumer still make sense against the new behavior? Look specifically for:
     - A caller that destructures/accesses a field that was renamed or removed.
     - A caller that assumed the old return type (e.g. array vs. object, sync vs. async/Promise, present vs. now-nullable).
     - A caller relying on old error/exception behavior that now differs (a function that used to throw and now returns `null`, or vice versa).
     - A caller not present in the diff at all — meaning it was **not updated** alongside the change it depends on. This is the strongest signal of a silent bug: something that compiles/runs but now behaves incorrectly.
   - Classify each consumer as: **OK** (still correct against the new behavior), **AT RISK** (plausibly broken, needs manual check — explain why), or **BROKEN** (demonstrably inconsistent with the change).
   - Severity: BROKEN → **[HIGH]** (or **[CRITICAL]** if the broken path touches money, auth, or data integrity); AT RISK → **[MEDIUM]**; OK → **[LOW]** (recorded for completeness, not because it's a risk).
   - If a changed symbol has no discoverable consumers in the codebase (e.g. it is only exported for external packages, or is genuinely new), say so — do not invent a consumer.

8. **Trace downstream effects of data-shape changes.**

   - If the diff changes how data is **saved** (a new/removed/renamed field on a persisted model, a changed serialization format, a changed default value, a changed enum set, a changed unit or precision), trace forward from the persistence point to every reader of that same data:
     - Other services/modules that read the same table/collection/topic/cache key.
     - Background jobs, cron tasks, queue consumers, webhooks, or event listeners that process this data.
     - API responses that serialize this data outward to a frontend or a third party — is the contract still the same shape they expect?
     - Reports, exports, or analytics pipelines that read the same field.
   - Explicitly flag the **mixed-data window**: rows written before this change coexist with rows written after it. State plainly whether any reader assumes one shape and would misbehave on the other (e.g. `undefined`/`null` for a new field on old rows, an old reader crashing on a field that changed type).
   - Severity: a reader that will misbehave or misinterpret data under the mixed-data window → **[HIGH]**; purely additive and backward-compatible (readers ignore unknown fields, new field has a safe default) → **[LOW]**, but still say so explicitly — this is valuable information too, not just risk.
   - If no data-shape change is present in the diff, state that explicitly.

9. **Trust & Safety findings — data leaks, misinterpretation, and malicious-pattern check.**

   Re-read the full diff once more with the zero-trust posture from above, independent of the framing used in steps 4–8. For every finding, cite the exact file:line and quote the relevant snippet.

   - **Data leaks:** new/changed fields in responses, logs, error messages, or third-party calls that expose PII, secrets, tokens, another tenant's data, or more of the result set than the caller needs. Assign **[CRITICAL]** if the leaked data is sensitive (credentials, PII, cross-tenant data) or reachable by an unauthenticated/under-privileged caller; otherwise **[HIGH]**.
   - **Misinterpretation of intent:** places where the implementation plausibly does not match what the commit message, code comment, or referenced task describes it as doing. Assign **[MEDIUM]** or **[HIGH]** depending on how consequential the mismatch is.
   - **Malicious-pattern indicators:** hardcoded user/ID/email-specific branches, newly added bypasses of authorization/ownership checks, debug/backdoor conditionals, weakened or removed validation, data being sent/written to an unexpected destination, or values being obfuscated/encoded before being sent somewhere. Assign **[CRITICAL]** — these findings block the push regardless of how unlikely malice seems; a human must explicitly confirm intent.
   - If genuinely nothing is found in this category after this dedicated pass, state that explicitly — do not skip the section, and do not soften a real finding into a lower category to avoid flagging it.

10. **Anything else worth flagging.** Use judgment — only include items genuinely grounded in the diff, each with a one-line reason and a severity label:
    - Config/environment variable changes that need to be set in other environments before this deploys safely.
    - Feature flags introduced or removed, and what state they need to be in.
    - Cache keys/invalidation that must happen for the change to take effect.
    - Contract/schema changes to message-queue payloads (producer changed, are all consumers of that topic in this repo/monorepo updated?).
    - Changes to shared types/interfaces consumed by another package in a monorepo.

    Do not pad this section — if there is nothing beyond steps 4–9, state that explicitly.

11. **Format the report** following the resolved template from step 3:
    - Every claim must be traceable to either the diff or a specific `Grep`/`Read` result — cite the file path (and line range when useful) for every consumer, route, and database object listed.
    - Every finding in every section carries a severity label from the scale above (`[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[LOW]`) — no exceptions.
    - Every `curl` command must be complete and runnable as written (method, URL, headers, body) — no `<TODO>` placeholders inside the command itself; placeholders belong only in a preceding note (e.g. "replace `<BASE_URL>`" as a sentence, not inline in the command where it would break copy-paste... unless no value could be discovered, in which case mark the placeholder clearly).
    - Every API contract change and every SQL/migration change is shown as an explicit `Before`/`After` block, per steps 5 and 6 — never summarized in prose only.
    - Use the **OK / AT RISK / BROKEN** classification for consumers exactly as defined in step 7.
    - Markdown output. Written in `$2`, except code identifiers, paths, table/column names, SQL, JSON payloads, and `curl` commands.

12. **Save the report.**
    Write the final markdown to `./tmp/impact-analysis.md`.

13. **Report back** in plain text (in `$2` language):
    - Which template was used (the file path).
    - The diff file path (`./tmp/diff.txt`).
    - The impact-analysis report path (`./tmp/impact-analysis.md`).
    - A one-line summary: number of impacted routes, number of impacted database objects, number of consumers found (broken down by OK / AT RISK / BROKEN), whether a data-shape change was detected, and a count of findings by severity (`N CRITICAL, N HIGH, N MEDIUM, N LOW`).
    - If any `[CRITICAL]` finding exists, state plainly that this branch should not be pushed until it is resolved.
