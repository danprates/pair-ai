---
name: guide
description: Mentor-style implementation guide for a feature — what to change, where, why we do it this way, what to watch for, and how to verify each step
disable-model-invocation: true
model: claude-sonnet-4-6
allowed-tools: Bash(mkdir:*), Bash(grep:*), Glob, Read, Write
---

# guide

Generate an implementation guide that reads like a senior developer pairing with a junior. The goal is not to hand the developer a checklist — it is to teach them **how this team thinks**: which patterns the project already uses, why those patterns exist, what trade-offs were considered, and which mistakes are easy to make. After reading the guide, the developer should be able to recognize the same kind of problem in the future and reason about it on their own. Saved to `./tmp/guide.md`.

## Arguments

- `$1` — feature description **or** path to a document (PRD, task file, plain text). Required.
  - If a file path is given and the file exists, read its full contents as the feature specification.
  - Otherwise, treat `$1` as an inline description of the feature.
- `$2` — output language (default: `en`). Examples: `en`, `pt-BR`, `es`.

## Flow

1. **Resolve arguments.** `input = $1` (required — abort with a usage message if empty), `language = $2 || en`.

2. **Read the feature specification.**
   - Attempt `Read` on `$1` as a file path.
   - If the file exists, use its contents as the feature spec.
   - If the file does not exist, treat `$1` literally as the feature description.

3. **Read the project's stated conventions** — these are authoritative and outrank anything you might infer from grepping code.

   - `CLAUDE.md` at the repository root (always read if present).
   - Any nested `**/CLAUDE.md` in directories relevant to the feature.
   - `README.md` for orientation on what the project is and how it is run.
   - Architecture or decision documents if they exist: `docs/**/*.md`, `docs/adr/**`, `docs/decisions/**`, `ARCHITECTURE.md`.

   Treat these as the **first-class source of truth** for naming, structure, testing approach, error handling, commit conventions, and any cross-cutting rule. When the guide later cites a convention, prefer "the project's `CLAUDE.md` says X" over "I observed Y in the code."

   If no `CLAUDE.md` or equivalent is present, say so in the guide and fall back to inferring conventions from the code — but flag inferences clearly so the junior knows they are conventions you reconstructed, not rules the team wrote down.

4. **Explore the codebase** to ground the guide in real files and to find concrete reference examples.

   Map the repository structure with Glob patterns relevant to the feature spec (e.g. `src/**/*.ts`, `**/*.controller.*`, `**/*.service.*`, `**/*.model.*`, `**/*.route.*`, `**/*.spec.*`). Read a representative sample of the most relevant files — aim for the layer most closely related to the feature.

   Use `grep` to locate:
   - Existing patterns the new code should follow (naming conventions, error handling style, testing approach).
   - The closest analogous feature already in the codebase. This is the most valuable thing you can find: the junior should be able to read that feature end-to-end and use it as a working template.

   Do not read every file — read enough to answer: "where does this feature fit?", "which existing feature is closest to it?", "what conventions does the project apply to that layer?", and "what are the easy mistakes a newcomer would make here?"

5. **Resolve the guide template** in this order (stop at the first found):
   1. `./tmp/templates/guide.md` — user project override
   2. `${CLAUDE_PLUGIN_ROOT}/skills/guide/template.md` — plugin default

   Use `Read` on each candidate in order; if the file exists, that is the active template.

6. **Plan the guide as a mentoring session**, not as a checklist. The guide must answer all of the following — and the *why* answers carry as much weight as the *what* answers:

   - **What is being built?** One-paragraph plain-language summary anchored in the spec.
   - **How to think about this.** The mental model. What kind of problem is this (a CRUD addition? a state-machine change? a cross-cutting concern?), how does this team usually frame it, and which conventions from `CLAUDE.md` apply. This section is where the junior learns the team's vocabulary and reasoning.
   - **Closest reference in the codebase.** The single most analogous feature already shipped — name the files, explain why it is the right reference, and tell the developer to read it before touching anything else.
   - **Implementation phases (2–5).** Each phase is an independently verifiable slice. For every phase, cover:
     - **Goal.** One sentence: what is true at the end of this phase?
     - **Files to change.** Each entry says *what* changes and *why this file rather than another* — tying the choice back to a project convention or to the reference feature.
     - **How to implement.** Concrete guidance, but explain the reasoning behind the shape of the code: why this signature, why this layer owns this logic, why this error is thrown here and not there. Show short snippets only when the shape is non-obvious — never reproduce whole files.
     - **Watch out for.** The two or three mistakes a junior is most likely to make in this phase, with the symptom each mistake produces. This is where you transfer the scar tissue of past bugs.
     - **How to verify.** The exact command, request, or assertion that proves the phase works. Specific over generic.
   - **End-to-end validation.** How to confirm the whole feature works once all phases are done.
   - **Acceptance criteria.** A checklist of conditions the feature must satisfy to be considered done.

   Throughout, write **as a senior pairing with a junior**: be patient, generous with reasoning, name trade-offs out loud ("we could have put this in the controller, but the project keeps business logic out of controllers — see `CLAUDE.md`"), and surface what looks right but isn't. The goal is for the junior to leave with a sharper sense for how this team makes decisions, not just a sequence of edits to perform.

   Ground every recommendation in something concrete: a `CLAUDE.md` line, a real file path, or a piece of the spec. If you cannot ground a recommendation, do not make it — say so and ask the junior to clarify with the team.

7. **Format the document** following the resolved template from step 5:
   - Mentoring tone throughout — explain *why*, not just *what*. Avoid sterile bullet lists where prose would teach more.
   - Every file path must be real or clearly derived from the project structure.
   - Markdown output, written in `$2` language (file paths and code identifiers always in their original form).
   - Do not pad. If a section cannot be answered honestly, keep the heading and write a single line saying so.

8. **Save the document.**

   ```bash
   mkdir -p ./tmp
   ```

   Write the final markdown to `./tmp/guide.md`.

9. **Report back** in plain text (in `$2` language):
   - Which template was used (the file path).
   - Which convention documents were consulted (e.g. `CLAUDE.md`, `docs/adr/...`). If none existed, say so.
   - The closest reference feature cited and why.
   - The guide document path (`./tmp/guide.md`).
   - How many implementation phases were identified.
