---
name: handoff
description: Generate a cross-area handoff document from the diff between two branches — what was done, scenarios covered, and how to integrate and implement
disable-model-invocation: true
model: claude-sonnet-4-6
allowed-tools: Bash(git log:*), Bash(gh pr diff:*), Bash(az repos pr diff:*), Bash(mkdir:*), Write, Read, Glob
---

# handoff

Generate a handoff document based on the diff between the current branch and a base branch. The audience is **another area** (frontend, QA, product) — not the developer who wrote the code. The document covers only what they need: what was done, which scenarios are handled, how to integrate, and how to implement or validate. Saved to `./tmp/handoff.md`.

## Arguments

- `$1` — base branch OR Pull Request URL (default: `dev`).
  - Branch: `dev`, `main`, `origin/main`
  - GitHub PR URL: `https://github.com/owner/repo/pull/123`
  - Azure DevOps PR URL: `https://dev.azure.com/org/project/_git/repo/pullrequest/123`
- `$2` — output language (default: `en`). Examples: `en`, `pt-BR`.

## Flow

1. **Resolve arguments.** `input = $1 || dev`, `language = $2 || en`.

   Detect the input type by inspecting `$1`:
   - Starts with `https://github.com/` → **GitHub PR**
   - Starts with `https://dev.azure.com/` → **Azure DevOps PR**
   - Anything else → **branch name** (current behavior)

   > **Language lock:** every heading, label, sentence, placeholder, and the report-back message must be written in `$2`. The template defines layout only — translate all its text to `$2`.

2. **Capture and save the diff — run this as the very first tool call, before anything else.**

   Choose the command based on the input type detected in step 1:

   **Branch (default):**
   ```bash
   mkdir -p ./tmp && git log --patch --graph <input>.. > ./tmp/diff.txt && echo "Diff saved successfully"
   ```

   **GitHub PR URL:**
   ```bash
   mkdir -p ./tmp && gh pr diff <input> > ./tmp/diff.txt && echo "Diff saved successfully"
   ```

   **Azure DevOps PR URL:**

   Extract the PR ID from the URL — it is the last numeric segment (e.g. `123` from `.../pullrequest/123`). Then:
   ```bash
   mkdir -p ./tmp && az repos pr diff --id <pr-id> > ./tmp/diff.txt && echo "Diff saved successfully"
   ```

   > **IMPORTANT:** This command is mandatory and must execute before any analysis begins. Run it as a single `&&` chain. Never invoke `git log` without the `> ./tmp/diff.txt` redirect — a standalone `git log` dumps the entire diff into the conversation, doubling token usage.

   Then read `./tmp/diff.txt` to analyze the changes.

3. **Resolve the handoff template** in this order (stop at the first found):
   1. `./tmp/templates/handoff.md` — user project override
   2. `${CLAUDE_PLUGIN_ROOT}/skills/handoff/template.md` — plugin default

   Use `Read` on each candidate in order; if the file exists, that is the active template.

4. **Analyze the diff** from the perspective of someone who needs to explain the work to a frontend developer or QA engineer. Do not include internal implementation details, infrastructure concerns, or developer-only context. Focus entirely on the four questions below:

   - **What was done?** Summarize the change in plain language. No jargon. Write as if the reader has no idea what the branch contains.
   - **Which scenarios are covered?** List every business scenario or use case this change handles. One scenario per bullet. Be concrete: "when the user does X, Y now happens."
   - **How to integrate?** Describe what changed from the consumer's perspective: new or modified endpoints, changed request/response contracts, new fields, removed fields, required headers, authentication changes. If nothing changed from the outside, say so explicitly.
   - **How to implement or validate?** Write numbered steps a frontend developer or QA can follow to use or verify this change: what to call, with what payload, what to expect back, which edge cases to probe.

5. **Format the document** following the resolved template from step 3:
   - Audience is non-backend: avoid implementation details, stack traces, migration notes, and deploy steps — they belong elsewhere.
   - Use simple, direct language. One idea per sentence.
   - Markdown output, written in `$2` language.
   - Do not invent content; base every statement on what the diff actually shows.
   - If a section cannot be answered from the diff, keep the heading and write a single honest line (e.g. `No integration changes required.`).

6. **Save the document.**
   Write the final markdown to `./tmp/handoff.md`.

7. **Report back** in plain text (in `$2` language):
   - Which template was used (the file path).
   - The diff file path (`./tmp/diff.txt`).
   - The handoff document path (`./tmp/handoff.md`).
