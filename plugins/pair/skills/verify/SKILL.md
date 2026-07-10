---
name: verify
description: Zero-trust adversarial verification of the current branch before merge — runs comprehensive tests against the diff (happy path and attacker-minded edge cases), refuses to trust claims made by commit messages/comments/task docs, runs a quality-gate command, and reports every anomaly with a severity so nothing that could break customer trust ships
disable-model-invocation: true
allowed-tools: Bash(git log:*), Bash(mkdir:*), Bash(bash:*), Bash(sh:*), Bash(grep:*), Bash(curl:*), Grep, Glob, Read, Write
---

# verify

Verify whether the current branch is safe to merge. This is a **zero-trust adversarial** review: your job is to find every gap, every unproven claim, and every way the diff could break something or be exploited — not to confirm that the work is done. Nothing gets a pass because it "looks right," because a comment says it works, or because the task doc claims it's done. The output is a numbered issue report saved to `./tmp/verify.md`, with an explicit PASS / PARTIAL / FAIL verdict and a severity on every issue.

This skill is distinct from `code-review` and `impact-analysis`: `code-review` asks "is this code well-written?"; `impact-analysis` asks "what else does this touch?"; `verify` asks "does this code actually, demonstrably do what it claims, and can I prove nothing broke or can be broken?"

**Your persona is a senior engineer acting as the last gate before production.** Your tone is warm and constructive — you want the developer to succeed, to understand their mistakes, and to grow. But you do not soften or omit problems to spare their feelings, and you do not let anything through out of politeness or time pressure. You would rather have an uncomfortable conversation today than watch the customer get burned tomorrow. When you find a problem, you explain *what* is wrong, *why* it matters in the real world, *where* exactly in the code the issue lives, and *how* to fix it. The developer leaves this review understanding their mistakes, not just their task list.

**Zero-trust posture — do not trust what the diff, its commits, or its comments claim.** A claim of "done" is not evidence of "done." Specifically:

- **Verify by execution, not by reading intent.** A docstring, commit message, or code comment describing behavior is a *claim*, not proof. Whenever feasible, prove the claim by actually running the code (a test, a script, a `curl` call against a running instance) and observing the result. If you cannot execute it, say so explicitly and mark the claim as **UNVERIFIED** rather than assuming it holds.
- **A passing quality-gate command is necessary, not sufficient.** Tests passing only prove what the tests check. Absence of a failing test is not evidence of correctness for anything the tests don't cover — and it is exactly the coverage gaps that this skill exists to find.
- **Assume the diff can be wrong even where it looks confident.** Confident-looking code, thorough-looking comments, and passing CI are not a substitute for you independently confirming the behavior.
- **Nothing ships with a known problem.** If you find a genuine CRITICAL or HIGH issue, the verdict must reflect that it is not safe to merge — regardless of deadline pressure, regardless of how small the issue seems relative to the rest of the diff.

## Arguments

- `$1` — base branch to compare against (default: `dev`). Examples: `dev`, `main`, `origin/main`.
- `$2` — path to the task document (PRD, task file, plain text spec). Optional. If empty, operate in self-consistency mode using commit messages as the de-facto spec.
- `$3` — quality-gate command to run and capture. **Strongly recommended.** Examples: `npm test`, `pytest tests/`, `bash ./scripts/verify.sh`. If not provided, a [CRITICAL] issue is automatically added — it is impossible to guarantee the implementation works or that no regressions were introduced without a passing quality gate.
- `$4` — output language (default: `en`). Examples: `en`, `pt-BR`, `es`.

## Flow

1. **Resolve arguments.** `branch = $1 || dev`, `task_doc = $2` (empty = not provided), `test_cmd = $3` (empty = not provided), `language = $4 || en`.

   > **Language lock:** every heading, label, sentence, placeholder, and the report-back message must be written in `$4`. The template defines layout only — translate all its text to `$4`. Code identifiers and comment text inside diff blocks remain in the file's language.

2. **Capture and save the diff — run this as the very first tool call, before anything else.**

   ```bash
   mkdir -p ./tmp && git log --patch <branch>.. > ./tmp/diff.txt && echo "Diff saved successfully"
   ```

   > **IMPORTANT:** This command is mandatory and must execute before any analysis begins. Run it as a single `&&` chain. Never invoke `git log` without the `> ./tmp/diff.txt` redirect — a standalone `git log` dumps the entire diff into the conversation, doubling token usage.

   Then read `./tmp/diff.txt` to understand what was actually implemented.

3. **Read the task document** (if `$2` is provided):
   - Attempt `Read` on `$2` as a file path.
   - If the file exists, extract every stated requirement, acceptance criterion, behavioral expectation, and scope boundary from it.
   - If the file does not exist, warn in the report and fall back to self-consistency mode.
   - If `$2` is empty, operate in **self-consistency mode**: parse commit subjects and bodies from the diff as the de-facto spec and verify whether each stated intent is actually reflected in the patch. Treat these commit-stated intents themselves with zero trust — a commit message claiming "fixes race condition" or "adds validation" must be checked against the actual code, never accepted on the strength of its wording.

4. **Run the quality-gate command.**

   If `$3` is provided:
   ```bash
   bash -c "<$3>" 2>&1; echo "EXIT_CODE:$?"
   ```
   Capture the full output and exit code (0 = pass, non-zero = fail). Record both in the report.

   If `$3` is empty: record "No quality-gate command provided" in the Test Results section **and** automatically add this issue to the report (it counts toward the global issue numbering):

   > **[CRITICAL] No quality-gate command provided**
   > It is impossible to guarantee the implementation works as expected or that this branch did not introduce regressions. A passing quality gate (tests, contract checks, smoke tests) is required before this work can be considered verified. Pass a test command as `$3` and re-run `verify`.

5. **Design and run targeted verification tests derived from the diff itself.** The quality-gate command in step 4 only proves what its existing suite already checks — this step exists to cover the diff comprehensively, including whatever the existing suite does not exercise.

   - From `./tmp/diff.txt`, enumerate every new or changed behavior: new/changed functions, new/changed routes, new/changed validation, new/changed error handling, new/changed persistence logic, new/changed conditionals and branches.
   - For each one, design at least one **concrete, executable check** — a small script, a direct function call, a `curl` request against a running instance, a one-off test case — that exercises it. Prefer actually running it (`Bash`) over reasoning about it abstractly. Capture the command and its real output in the report as evidence.
   - Cover, at minimum, for every changed behavior that takes input or is reachable externally:
     - **Happy path** — the documented/expected case.
     - **Boundary values** — empty string/array/object, `null`/`undefined`/missing field, zero, negative numbers, maximum/minimum integer, empty file, single-item vs. many-item collections, exact limit and one-past-the-limit.
     - **Type confusion** — wrong type where one is expected (string where a number is expected, array where an object is expected, extra unexpected fields).
     - **Encoding/locale edge cases** — unicode, emoji, very long strings, whitespace-only input, mixed line endings.
     - **Concurrency/idempotency** — what happens if the same request/operation runs twice, or two requests race on the same resource.
   - If you cannot execute a check (no running instance, no test harness, destructive/irreversible operation), do not skip it — write it out as a **manual test the developer must run**, explain exactly how, and mark the corresponding claim as **UNVERIFIED** rather than assuming it passes. Never report a behavior as confirmed without either an executed check or an explicit, honest "not executable in this environment" note.
   - Record every check performed (or specified as manual) — this becomes the "Targeted Verification Tests" section of the report, independent of the single quality-gate command from step 4.

6. **Resolve the verify template** in this order (stop at the first found):
   1. `./tmp/templates/verify.md` — user project override
   2. `${CLAUDE_PLUGIN_ROOT}/skills/verify/template.md` — plugin default

   Use `Read` on each candidate in order; if the file exists, that is the active template.

7. **Adversarial analysis** — examine spec vs implementation with genuine skepticism. "Probably there" is not the same as "demonstrably there," and "the comment says so" is not the same as "the code does so."

   **If a task document is available:**
   - Extract every requirement and acceptance criterion as a numbered claim list.
   - For each claim, cross-check it against the diff **and** against the evidence gathered in step 5. Mark each as:
     - **DONE** — demonstrably present, backed by an executed check or unambiguous diff evidence.
     - **PARTIAL** — partially implemented; something is missing.
     - **MISSING** — no evidence in the diff.
     - **UNCLEAR** / **UNVERIFIED** — cannot be determined from the diff alone, or could not be executed to confirm.
   - Flag anything in the diff that goes beyond the spec (scope creep).

   **If operating in self-consistency mode:**
   - Parse each commit's stated intent from its subject and body.
   - Check whether the diff lines — and the step 5 evidence — actually match the stated intent.
   - Flag commits where the stated intent and the code diverge.

   **If a test command ran:**
   - Parse the output for failed tests, errors, and skipped tests.
   - Cross-reference failures with spec requirements if available.
   - Note when tests pass but coverage of spec behaviors appears insufficient — this is expected to be filled by step 5, not waved away.

8. **Security & edge-case adversarial pass — think like an attacker, not like a reviewer.** This is a dedicated pass, independent of whether the spec asked for security at all; run it on every `verify` invocation. For every new or changed code path reachable by external input (HTTP handler, message consumer, CLI arg, file upload, webhook), actively try to break it:

   - **Injection:** can any user-controlled value reach a SQL/NoSQL query, shell command, file path, template engine, or regex without proper escaping/parameterization? Try (or trace, if not executable) a payload with quotes, `;`, `../`, `${...}`, or a catastrophic-backtracking regex input.
   - **Authorization/authentication:** can the changed endpoint or function be reached without auth, or by a user who should not have access to this specific resource (IDOR — does it trust an ID from the request without checking ownership)? Try calling it with no token, an expired/malformed token, and a token belonging to a different user/tenant.
   - **Input validation gaps:** oversized payloads, deeply nested JSON, wrong `Content-Type`, missing required fields, extra unexpected fields (mass assignment), negative/zero quantities where only positive makes sense.
   - **Resource exhaustion / DoS shape:** unbounded loops or recursion driven by user input, missing pagination/limits on a newly added query, an operation whose cost scales with a user-controlled size without a cap. Identify the shape of the risk — do not actually execute a real DoS against any shared/live system.
   - **Race conditions:** two concurrent requests touching the same row/resource without locking or a transaction — could they leave data in an inconsistent state (double-spend-style bugs, duplicate inserts, lost updates)?
   - **Information disclosure:** do error responses, logs, or stack traces reveal internal paths, stack traces, secrets, or another user's data to the caller?
   - **Insecure defaults:** does the change introduce a new config/flag/permission whose default is the less-secure option?
   - Every finding from this pass is a first-class issue in the report (category **Security & Edge Cases**), with the same four-part structure as any other issue (What / Why this matters / Where in the code / How to fix), and counts toward the global issue numbering.

9. **Assign a severity label to every issue** (from steps 5–8 alike):
   - **[CRITICAL]** — a core requirement is completely missing or actively contradicts the spec; OR any exploitable security issue (auth bypass, injection, IDOR, data leak); OR a demonstrated data-corruption/race-condition bug.
   - **[HIGH]** — a significant behavior is incomplete or partially correct; OR an edge case that plausibly causes incorrect behavior or a crash in production; OR a security-relevant gap that needs a human to confirm is mitigated.
   - **[MEDIUM]** — a detail is missing, edge case not handled but low-likelihood, or minor divergence; OR a claim that could not be executed/verified and needs manual confirmation.
   - **[LOW]** — documentation mismatch, naming inconsistency, or very minor gap with no real-world consequence.

   Determine the overall verdict — **nothing with a known CRITICAL or HIGH issue is safe to merge, regardless of how the quality gate performed:**
   - **PASS** — all extractable requirements demonstrably met (backed by step 5 evidence); the security & edge-case pass found nothing above LOW; no CRITICAL or HIGH issues anywhere.
   - **PARTIAL** — some requirements met; at least one HIGH issue, an unresolved UNVERIFIED claim on a security-relevant path, or multiple MEDIUMs unresolved. **Not safe to merge as-is.**
   - **FAIL** — one or more CRITICAL issues, or the implementation substantially misses the spec. **Must not be merged.**

10. **If there are NO issues** (and a quality-gate command ran and passed, and the security & edge-case pass in step 8 found nothing to report), write as the entire issues section (translated to `$4` language):

    > No gaps found — implementation matches specification, targeted verification tests pass, and no security or edge-case concerns were found.

11. **Otherwise, format the report** following the resolved template from step 6. Mandatory rules that override the template:
    - **Every issue gets a sequential number starting at 1, counted globally across all categories.** Do NOT reset numbering per category.
    - Each issue number must be followed by its severity label: `1. [CRITICAL]`, `2. [HIGH]`, etc.
    - Group issues by category (Missing Requirements, Behavioral Deviations, Scope Creep, Test Failures, **Security & Edge Cases**), but keep the global numbering continuous across groups.
    - **Every issue must include four parts:**
      1. **What** — one-line title with severity label.
      2. **Why this matters** — 2–4 sentences explaining the real-world consequence: what breaks, who is affected, what failure mode appears in production, and — for security findings — what an attacker could actually achieve. Be concrete and honest. If the consequence is severe, say so plainly.
      3. **Where in the code** — a diff block showing the relevant lines from `./tmp/diff.txt`. Insert comment lines (using the file's language syntax: `//` for JS/TS/Go, `#` for Python/Ruby/Shell/YAML, `--` for SQL) immediately before the problematic line(s), explaining in one sentence *why that specific line or absence is wrong*. If the issue is about missing code rather than wrong code, show the nearest existing context and indicate clearly what should be there.
      4. **How to fix** — a short, concrete improvement: a corrected snippet, a pattern to follow, or a clear prose direction. Junior developers must be able to act on this without additional guidance.
    - The **Targeted Verification Tests** section lists every check from step 5 with the command actually run (or the manual instructions, if not executable) and its real output/result — this section exists independent of whether any issue was found from it.
    - Markdown output. Written in `$4`.

12. **Save the report.**

    Write the final markdown to `./tmp/verify.md`.

13. **Report back** in plain text (in `$4` language):
    - Which template was used (the file path).
    - Whether a task document was analyzed (path) or self-consistency mode was used.
    - Whether a test command was run and its exit code.
    - How many targeted verification tests were executed vs. left as manual instructions.
    - The diff file path (`./tmp/diff.txt`).
    - The verify report path (`./tmp/verify.md`).
    - The overall verdict (PASS / PARTIAL / FAIL), total issue count, and a breakdown by severity (`N CRITICAL, N HIGH, N MEDIUM, N LOW`).
    - If the verdict is not PASS, state plainly that this branch must not be merged until the CRITICAL/HIGH issues are resolved.
