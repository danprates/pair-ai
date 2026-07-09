# Impact Analysis: <branch or feature description>

**Scope:** diff against `<base branch or PR>` — <N> files changed.

**Severity totals:** <N> CRITICAL · <N> HIGH · <N> MEDIUM · <N> LOW

> If any CRITICAL finding is listed below, **do not push this branch** until it is resolved.

---

## Summary

(2–4 sentences: what this change does at a high level, and the single biggest blast-radius risk found below — the one thing the developer should manually verify before pushing.)

---

## Impacted Routes

(One entry per impacted route. If none, write: `No HTTP routes are impacted by this change.`)

### `<METHOD> <path>` — **[SEVERITY]**

**Reached through:** `<route file>` → `<handler>` → ... → `<changed file>:<line>` _(show the call chain only if the route reaches the change indirectly)_

```bash
curl -X <METHOD> "<BASE_URL><path>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "field": "example value"
  }'
```

**What to check in the response:** <one line — the specific thing that changed and how to recognize a correct vs. broken response>

---

## API Contract Changes

(One entry per route/operation whose request or response shape changed. If none, write: `No request/response contract changes were found in this diff.`)

### `<METHOD> <path>` — **[SEVERITY]**

**What changed:** <one line — e.g. "field `status` renamed to `state`", "new field `internal_notes` now included in the response">

**Request — Before:**

```json
{ "field": "old shape example" }
```

**Request — After:**

```json
{ "field": "new shape example" }
```

**Response — Before:**

```json
{ "field": "old shape example" }
```

**Response — After:**

```json
// ⚠️ note anything that looks like an unintentional data exposure here
{ "field": "new shape example" }
```

---

## Impacted Database Objects

(One entry per table/migration/procedure. If none, write: `No database objects are impacted by this change.`)

### `<table_or_object_name>` — **[SEVERITY]**

**Query/migration — Before:**

```sql
-- old statement, in full, even for a "trivial" change like a type cast
```

**Query/migration — After:**

```sql
-- new statement, in full — compare column order, types, nullability, rounding/truncation, defaults
```

**Other references found in code:** `<file path>:<line>` — <one line on what that code does with this object, and whether it still holds after the change>

**Existing-row risk:** <does this migration/change break rows written before it? state explicitly, including "none" if additive and safe>

---

## Consumers of the Change (Silent-Bug Check)

(One entry per changed symbol that has discoverable consumers. If a changed symbol has no consumers, list it once with "No consumers found in the codebase.")

**`<changed function/class/type>`** — changed in `<file>:<line>`

| Consumer        | Status     | Severity          | Why                                                           |
| --------------- | ---------- | ----------------- | ------------------------------------------------------------- |
| `<file>:<line>` | ✅ OK      | [LOW]             | <one line>                                                    |
| `<file>:<line>` | ⚠️ AT RISK | [MEDIUM]          | <one line — what could break and why it needs a manual check> |
| `<file>:<line>` | ❌ BROKEN  | [HIGH]/[CRITICAL] | <one line — the specific inconsistency found>                 |

---

## Data-Shape Change Impact

(If no data-shape change: `No change to how data is saved or serialized was found in this diff.`)

**What changed:** <field added/removed/renamed, serialization format, default value, enum set, unit/precision — with file:line> — **[SEVERITY]**

**Readers found downstream:**

- `<file>:<line>` — <service/job/API/report that reads this data, and whether it still works against the new shape>

**Mixed-data window:** <explicit statement of whether rows/messages written before and after this change coexist safely, or what breaks when they don't>

---

## Trust & Safety Findings

(Data leaks, misinterpretation of intent, or malicious-pattern indicators found under the zero-trust review pass. If genuinely none found: `No data-leak, misinterpretation, or malicious-pattern indicators were found in this diff.`)

### **[SEVERITY] <title>**

**File:** `<file>:<line>`

```<language>
<the exact snippet in question>
```

**Why this is a concern:** <concrete explanation — what data could leak, who could be affected, why the code's stated purpose does not match what it actually does, or what a bad actor could achieve with this>

**What to confirm before pushing:** <the specific manual check or the specific person to ask>

---

## Other Notes

(Config/env vars, feature flags, cache invalidation, queue contract changes, cross-package shared types. If none beyond the above: `Nothing further to flag.`)

- **[SEVERITY]** <note>

---

## Format rules (must be preserved in any override)

- Every route, database object, and consumer entry must cite a concrete file path (and line when useful) — no unverified claims.
- Every finding in every section carries a severity label — `[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, or `[LOW]` — no exceptions.
- Every API contract change is shown as explicit `Before`/`After` JSON blocks — never described in prose only.
- Every SQL/migration change is shown as explicit `Before`/`After` SQL blocks, including changes that look trivial (type casts, widened lengths, reordered columns) — never described in prose only.
- The Trust & Safety section is never omitted — if nothing is found, it says so explicitly.
- Every `curl` command must be complete and runnable as written; unresolved values are called out in prose before the block, not left as broken placeholders inside it.
- Consumer status uses exactly three labels: ✅ OK, ⚠️ AT RISK, ❌ BROKEN.
- Sections with nothing to report keep their heading and state that explicitly — never omitted, never padded.
- Output is markdown, in the requested language, except code identifiers, paths, table/column names, SQL, JSON payloads, and `curl` commands.
