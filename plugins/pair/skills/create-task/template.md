# Task NNN: <imperative title — e.g. "Add rate-limiting to the auth route">

**Status:** TODO

## Context

(One short paragraph. Why does this task exist? What problem does it solve? What does the system look like before this change, and after? Write it the way you would explain this to a teammate during standup — plain language, no padding.)

---

## Independence guarantee

This task has no dependencies on other tasks in this suite and can be executed in any order. Specifically: (one sentence stating which files it creates or modifies, and confirming no other task in the suite touches those same files.)

---

## Reference

The closest analogous feature in the codebase is **`<path/to/reference/>`**.

(Two or three sentences on why this is the right reference: same layer? same input/output shape? same kind of side effect? Tell the sub-agent to read it before writing any code, and point out which parts to focus on.)

---

## Files to change

| File              | Action                   | Why this file (not another)                                                                                                                                    |
| ----------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<path/to/file>`  | create / modify / delete | (Tie the choice to a convention, the reference feature, or the layer architecture. If you cannot give a specific reason, write "TBD — confirm with the team".) |
| `<path/to/other>` | create / modify / delete |                                                                                                                                                                |

---

## Acceptance criteria

- [ ] (Falsifiable condition. Example: "GET /users/:id returns 404 when the user does not exist.")
- [ ] (Falsifiable condition.)
- [ ] (Falsifiable condition.)

---

## Testing plan

**Happy path**

```bash
# Exact command
# Expected: <output>
```

**Failure case**

```bash
# Exact command
# Expected: <output>
```

---

## Sub-agent invocation

When spawning this task as a sub-agent, use this prompt verbatim:

> Read the task document at `<path-to-this-file>` and implement it completely. Do not ask for clarification — if something is ambiguous, make the safest choice and note it. When done, report exactly one of: **DONE**, **FAILED**, or **PARTIAL** — followed by one sentence summarizing what was done or what blocked you.
