# Verify: <branch or feature description>

**Verdict:** [PASS | PARTIAL | FAIL]

**Severity totals:** <N> CRITICAL · <N> HIGH · <N> MEDIUM · <N> LOW

> If the verdict is not PASS, **this branch must not be merged** until every CRITICAL/HIGH issue below is resolved.

---

## Specification

**Source:** `<task_doc path>` | _Self-consistency mode — no task document provided; commit messages used as spec (treated with zero trust, not accepted at face value)._

(Exhaustive list of every requirement and acceptance criterion extracted from the source. One item per line. Every claim that appears in the spec must appear here — this list is the baseline for the gap analysis.)

- requirement 1
- requirement 2
- requirement N

---

## Implementation Summary

(One paragraph grounded in the diff: what was actually built. Not what the spec says should be built — what the code shows was built. If the branch is empty or the diff is trivial, say so.)

---

## Quality Gate

**Command:** `<test command>` | _No quality-gate command provided — see Issues._

```
<captured output — truncate if longer than ~50 lines, showing head and tail>
```

**Exit code:** N — PASS | FAIL

---

## Targeted Verification Tests

(Every check designed and run against the diff in the zero-trust verification pass — independent of the quality-gate command above. If a check could not be executed, it is listed with explicit manual instructions instead of being skipped.)

| # | Behavior under test | Check | Result |
| --- | --- | --- | --- |
| 1 | `<changed function/route>` — happy path | `<command actually run, e.g. curl ... or a script>` | ✅ Confirmed — `<real output summary>` |
| 2 | `<changed function/route>` — boundary value `<e.g. empty array>` | `<command run>` | ✅ Confirmed / ❌ Failed — `<real output summary>` |
| 3 | `<changed function/route>` — concurrent/idempotency case | `<command run>` | ⚠️ UNVERIFIED — could not execute in this environment; manual steps: `<exact steps for the developer>` |

---

## Issues

(If no issues: > No gaps found — implementation matches specification, targeted verification tests pass, and no security or edge-case concerns were found.)

**Missing Requirements**

**1. [CRITICAL] <title>**

**Why this matters:** <2–4 sentences on the real-world consequence — what breaks, who is affected, what failure mode appears in production. Be honest and concrete.>

**Where in the code:**

```diff
--- a/src/path/to/file.ts
+++ b/src/path/to/file.ts
@@ -X,Y +X,Y @@
 context line
-// ⚠️ Problem: explain in one sentence why this line or its absence is wrong
-  problematic code
```

**How to fix:** <Short concrete direction — a corrected snippet, a pattern to follow, or clear prose. A junior developer must be able to act on this without asking for clarification.>

---

**Behavioral Deviations**

**2. [HIGH] <title>**

**Why this matters:** <real-world consequence>

**Where in the code:**

```diff
--- a/src/path/to/file.ts
+++ b/src/path/to/file.ts
@@ -X,Y +X,Y @@
 context line
-// ⚠️ Problem: why this diverges from the expected behavior
-  existing code
+// ✅ Fix: what the corrected version should look like
+  corrected code
```

**How to fix:** <concrete suggestion>

---

**Scope Creep**

**3. [LOW] <title>**

**Why this matters:** <consequence>

**Where in the code:**

```diff
--- a/src/path/to/file.ts
+++ b/src/path/to/file.ts
@@ -X,Y +X,Y @@
+// ⚠️ This change was not in the spec — added without documented justification
+  code added beyond scope
```

**How to fix:** <concrete suggestion>

---

**Test Failures**

**4. [HIGH] <title>**

**Why this matters:** <consequence>

**Where in the code:**

```diff
--- a/tests/path/to/test.ts
+++ b/tests/path/to/test.ts
@@ -X,Y +X,Y @@
+// ⚠️ This test is failing — the behavior it covers is either broken or untested
+  failing test code
```

**How to fix:** <concrete suggestion>

---

**Security & Edge Cases**

**5. [CRITICAL] <title>**

**Why this matters:** <what an attacker could actually achieve, or what breaks under the edge-case input — be concrete: data exposed, auth bypassed, integrity violated, service degraded>

**Where in the code:**

```diff
--- a/src/path/to/file.ts
+++ b/src/path/to/file.ts
@@ -X,Y +X,Y @@
 context line
-// ⚠️ Attack/edge case: <e.g. "user-controlled id used without an ownership check — IDOR">
-  vulnerable code
```

**How to fix:** <concrete suggestion — validation to add, check to add, library to use>

---

## Format rules (must be preserved in any override)

- Issues are numbered **globally** starting at 1, never reset per category.
- Each issue has four mandatory parts: **title with severity**, **Why this matters**, **Where in the code** (diff block with inline comments), **How to fix**.
- Comment lines in diff blocks use the file's language syntax (`//` JS/TS/Go, `#` Python/Ruby/Shell/YAML, `--` SQL). They must explain *why* the line is wrong — not what it does.
- Category headings (Missing Requirements, Behavioral Deviations, Scope Creep, Test Failures, Security & Edge Cases) are bold; numbering stays continuous across categories.
- The Targeted Verification Tests table is never omitted — every check from the zero-trust pass is listed with its real result or explicit manual instructions; nothing is marked confirmed without evidence.
- Verdict rule: PASS requires zero CRITICAL/HIGH issues; the report must say plainly when a non-PASS verdict means the branch must not be merged.
- Output is markdown, in the requested language.

---

## Acceptance Criteria Status

| #   | Criterion               | Status     |
| --- | ------------------------ | ---------- |
| 1   | (requirement from spec) | ✅ DONE    |
| 2   | (requirement from spec) | ⚠️ PARTIAL |
| 3   | (requirement from spec) | ❌ MISSING |
| 4   | (requirement from spec) | ❓ UNCLEAR / UNVERIFIED |
