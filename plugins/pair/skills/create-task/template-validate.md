# Validate: <feature name>

**Status:** TODO
**Suite:** `<suite-dir>`

## What was built

(Brief summary of the feature. List each implementation task and what it was supposed to deliver.)

| Task            | What it implemented |
| --------------- | ------------------- |
| `001-<slug>.md` | (one-line summary)  |
| `002-<slug>.md` | (one-line summary)  |

---

## Acceptance criteria

(Collect every acceptance criterion from every implementation task in this suite. Add integration and end-to-end checks that span multiple tasks — these cannot live in individual tasks without creating dependencies.)

**From implementation tasks:**

- [ ] _(from 001) Falsifiable condition._
- [ ] _(from 002) Falsifiable condition._

**End-to-end / integration:**

- [ ] _(Spans multiple tasks — e.g. "full flow from X to Y returns Z")_

---

## Verification plan

**Regression check** _(run first — must pass before any feature checks)_

```bash
# Run the existing test suite
<test-command>
# Expected: all tests pass, exit 0
```

**Feature verification** _(happy path)_

```bash
# Test the full end-to-end flow
# exact command
# Expected: <output>
```

**Failure cases**

```bash
# Test at least one failure scenario
# exact command
# Expected: <output>
```

---

## Report

After running all checks above, output exactly one of:

- **PASS** — all criteria met, all tests green. List each check with a one-line result.
- **FAIL** — one or more criteria not met. For each failure: what was checked, what was expected, what actually happened.
