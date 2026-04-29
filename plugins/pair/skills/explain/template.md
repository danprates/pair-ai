# Explain: <branch name or short description>

## Overview

(One paragraph. What problem does this branch solve? What is the end state after all commits are applied?)

---

## Key decisions

- (List any decision where a non-obvious approach was chosen over a simpler or more common alternative. One bullet per decision. Format: "chose X over Y because Z.")

---

## Phase 1: <descriptive heading>

**Commits:** (list short hashes and messages that belong to this phase)

**What was done:** (describe the change in technical terms — files, functions, concepts involved)

**Connects to:** (what this phase enables or what must come after it)

**Changes:**

(For each meaningful hunk in this phase, show a diff block annotated with comment lines that explain _why_ the change was made. Use the comment syntax of the file's language — `//` for JS/TS/Go/Java, `#` for Python/Ruby/Shell, `--` for SQL, etc. Insert the "why" comment as a `+` line immediately before the line(s) it explains, so it reads naturally as code someone could keep.)

```diff
--- a/<file path>
+++ b/<file path>
@@ <hunk header> @@
 <unchanged context line>
-<removed line>
+// Why: <one sentence explaining the reason for this specific change>
+<added line>
 <unchanged context line>
```

(Repeat a diff block for each file or hunk that belongs to this phase. Skip trivial changes — formatting, imports — unless the reason is non-obvious.)

---

## Phase N: <descriptive heading>

**Commits:** (list short hashes and messages)

**What was done:**

**Connects to:** (write "End state — no further dependency" if this is the last phase)

**Changes:**

```diff
--- a/<file path>
+++ b/<file path>
@@ <hunk header> @@
 <context>
-<removed>
+// Why: <reason>
+<added>
```
