# Verify: <branch or feature description>

**Verdict:** [PASS | PARTIAL | FAIL]

---

## Specification

**Source:** `<task_doc path>` | _Self-consistency mode — no task document provided; commit messages used as spec._

(Exhaustive list of every requirement and acceptance criterion extracted from the source. One item per line. Every claim that appears in the spec must appear here — this list is the baseline for the gap analysis.)

- requirement 1
- requirement 2
- requirement N

---

## Implementation Summary

(One paragraph grounded in the diff: what was actually built. Not what the spec says should be built — what the code shows was built. If the branch is empty or the diff is trivial, say so.)

---

## Test Results

**Command:** `<test command>` | _No quality-gate command provided — see Issues._

```
<captured output — truncate if longer than ~50 lines, showing head and tail>
```

**Exit code:** N — PASS | FAIL

---

## Issues

(If no issues: > No gaps found — implementation matches specification.)

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

## Format rules (must be preserved in any override)

- Issues are numbered **globally** starting at 1, never reset per category.
- Each issue has four mandatory parts: **title with severity**, **Why this matters**, **Where in the code** (diff block with inline comments), **How to fix**.
- Comment lines in diff blocks use the file's language syntax (`//` JS/TS/Go, `#` Python/Ruby/Shell/YAML, `--` SQL). They must explain *why* the line is wrong — not what it does.
- Category headings (Missing Requirements, Behavioral Deviations, Scope Creep, Test Failures) are bold; numbering stays continuous across categories.
- Output is markdown, in the requested language.

---

## Acceptance Criteria Status

| #   | Criterion               | Status     |
| --- | ----------------------- | ---------- |
| 1   | (requirement from spec) | ✅ DONE    |
| 2   | (requirement from spec) | ⚠️ PARTIAL |
| 3   | (requirement from spec) | ❌ MISSING |
| 4   | (requirement from spec) | ❓ UNCLEAR |
