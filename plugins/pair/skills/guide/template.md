# Guide: <feature name or short description>

## Overview

(One paragraph. What is being built? What problem does it solve? What is the end state when all phases are complete? Write it the way you would explain the feature to a teammate at lunch — plain language, no padding.)

---

## How to think about this

(This is where you teach the mental model. What kind of problem is this — a CRUD addition? a new event in an existing flow? a cross-cutting concern that touches every layer? Frame it the way an experienced teammate would frame it before opening a single file.

Then list the project conventions that apply, citing where each one is documented:

- **<convention name>** — <one sentence>. _Source: `CLAUDE.md` line X / `docs/adr/0007-...md`._
- **<convention name>** — <one sentence>. _Source: ..._

If no `CLAUDE.md` or equivalent exists, say so honestly: "The project does not document conventions explicitly — what follows is reconstructed from the code and should be confirmed with the team.")

---

## Closest reference in the codebase

The most analogous feature already shipped is **`<path/to/reference/feature/>`**.

(Two or three sentences explaining why this is the right reference: same layer of the stack? same shape of input/output? same kind of side effects? Tell the developer to read it end-to-end before touching anything else, and point out which parts to pay closest attention to.)

---

## Phase 1: <descriptive heading>

**Goal:** (one sentence — what is provably true at the end of this phase?)

### Files to change

| File                 | Action          | Why this file (not another)                                                                                                                                                                 |
| -------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<path/to/file.ts>`  | create / modify | (Tie the choice to a convention or to the reference feature: e.g. "the project keeps validation in `*.schema.ts` siblings — see how `user.schema.ts` is paired with `user.controller.ts`.") |
| `<path/to/other.ts>` | create / modify |                                                                                                                                                                                             |

### How to implement

(Explain the shape of the code and the reasoning behind it. Don't just say _what_ to write — say _why_ it takes that shape. Examples of the kind of reasoning to surface:

- "This belongs in the service layer because the controller in this project never touches the database directly."
- "Throw `NotFoundError` rather than returning `null` — the global error handler in `src/middleware/error.ts` translates it into a 404 automatically."
- "The function takes a `userId` rather than a full `User` object so callers don't have to hydrate one just to invoke this."

Include short snippets only when the shape is non-obvious — a function signature, a schema, a route registration. Never paste whole files.)

```typescript
// Snippet — replace with actual language and content
export async function exampleFunction(input: InputType): Promise<OutputType> {
  // ...
}
```

### Watch out for

(Two or three mistakes a junior is most likely to make in this phase. For each one, name the **symptom** so they recognize it when it happens.)

- **<mistake>** — symptom: <what breaks or looks wrong>. Fix: <how to avoid or correct>.
- **<mistake>** — symptom: <what breaks or looks wrong>. Fix: <how to avoid or correct>.

### How to verify

(The exact command, request, or assertion that proves the phase works. Specific over generic.)

```bash
# example verification
npm test -- --testPathPattern=<relevant spec>
```

---

## Phase 2: <descriptive heading>

**Goal:**

### Files to change

| File | Action | Why this file (not another) |
| ---- | ------ | --------------------------- |
|      |        |                             |

### How to implement

### Watch out for

- **<mistake>** — symptom: <what breaks or looks wrong>. Fix: <how to avoid or correct>.

### How to verify

---

## Phase N: <descriptive heading>

**Goal:**

### Files to change

| File | Action | Why this file (not another) |
| ---- | ------ | --------------------------- |
|      |        |                             |

### How to implement

### Watch out for

### How to verify

---

## End-to-end validation

(Describe how to confirm the complete feature works once all phases are done. Include the full flow to exercise, the exact commands or requests to run, and what a successful outcome looks like. If there is a test suite that covers this feature, run it here.)

```bash
# end-to-end validation commands
```

---

## Acceptance criteria

- [ ] (Condition 1 — testable, specific, not ambiguous)
- [ ] (Condition 2)
- [ ] (Condition N)
