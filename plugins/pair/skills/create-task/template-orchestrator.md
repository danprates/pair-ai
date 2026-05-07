# Orchestrator: <feature name>

**Suite:** `<suite-dir>`

## Tasks in this suite

| #   | File                  | Summary                           |
| --- | --------------------- | --------------------------------- |
| 000 | `000-orchestrator.md` | This file — coordinates execution |
| 001 | `001-<slug>.md`       | (one-line summary)                |
| ... | ...                   | ...                               |
| 999 | `999-validate.md`     | Validates the full feature        |

---

## Execution plan

Run implementation tasks in **batches of ≤ 5** using the `Agent` tool. Do not start the next batch until every task in the current batch has reported **DONE**. Run `999-validate.md` only after all batches complete.

**Batch 1** (run in parallel using the Agent tool):

- `<suite-dir>/001-<slug>.md`
- `<suite-dir>/002-<slug>.md`
- _(add up to 5 tasks per batch)_

**Batch 2** _(if more than 5 implementation tasks)_:

- `<suite-dir>/006-<slug>.md`
- ...

**Final** _(run after all batches complete)_:

- `<suite-dir>/999-validate.md`

---

## Sub-agent invocation

For each implementation task, spawn a sub-agent using the `Agent` tool with this prompt (substitute `<path>` with the actual file path):

> Read the task document at `<path>` and implement it completely. Do not ask for clarification — if something is ambiguous, make the safest choice and note it. When done, report exactly one of: **DONE**, **FAILED**, or **PARTIAL** — followed by one sentence summarizing what was done or what blocked you.

For the validation task, use the same prompt with `<suite-dir>/999-validate.md`.

---

## Failure handling

- If any task reports **FAILED** or **PARTIAL**: stop immediately. Do not start the next batch or run validation. Report to the user: the task file path, the sub-agent's one-sentence summary, and ask how to proceed.
- If all tasks in a batch report **DONE**: proceed to the next batch.
- After all implementation batches complete successfully: spawn `999-validate.md`.
- If validation reports **FAIL**: surface the per-criterion breakdown to the user.
