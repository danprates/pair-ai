# Task: <imperative title — e.g. "Add rate-limiting to the auth route">

TODO: adicione o status dessa task, como "TODO", "IN PROGRESS", "REVIEW", "DONE"

## Context

(One short paragraph. Why does this task exist? What problem does it solve? What does the system look like before this change, and what does it look like after? Write it the way you would explain the task to a teammate during a standup — plain language, no padding.)

---

## Reference

The closest analogous feature already in the codebase is **`<path/to/reference/feature/>`**.

(Two or three sentences on why this is the right reference: same layer? same shape of input/output? same kind of side effect? Tell the developer to read it before writing any code, and point out which parts to pay closest attention to.)

---

## Files to change

| File              | Action                   | Why this file (not another)                                                                                                                                                    |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<path/to/file>`  | create / modify / delete | (Tie the choice to a convention, to the reference feature, or to the project's layer architecture. If you cannot give a specific reason, write "TBD — confirm with the team".) |
| `<path/to/other>` | create / modify / delete |                                                                                                                                                                                |

---

## Acceptance criteria

- [ ] (Condition — specific and falsifiable. Example: "GET /users/:id returns 404 when the user does not exist.")
- [ ] (Condition — specific and falsifiable.)
- [ ] (Condition — specific and falsifiable.)

---

## Testing plan

(The exact commands, requests, or assertions that demonstrate the feature works. Include at least one happy-path case and one edge/failure case. Specific over generic.)

**Happy path**

```bash
# Example
curl -X POST /api/... -d '{"field": "value"}'
# Expected: 201 Created with { "id": "..." }
```

**Edge / failure cases**

```bash
# Example
curl -X POST /api/... -d '{}'
# Expected: 400 Bad Request with { "error": "field is required" }
```

**Regression check**

```bash
# Run the existing test suite to confirm nothing broke
npm test
```
