---
name: explain
description: Narrate the implementation journey of the current branch — what was done, in which order, and why each decision was made
disable-model-invocation: true
model: claude-sonnet-4-6
allowed-tools: Bash(git log:*), Bash(mkdir:*), Write, Read, Glob
---

# explain

Narrate the implementation story of the current branch commit by commit, in chronological order. The audience is the author preparing to present the PR, or a peer reviewer who wants to understand the decisions before reading the diff cold. Saved to `./tmp/explain.md`.

## Arguments

- `$1` — base branch to compare against (default: `dev`). Examples: `dev`, `main`, `origin/main`.
- `$2` — output language (default: `en`). Examples: `en`, `pt-BR`.

## Flow

1. **Resolve arguments.** `branch = $1 || dev`, `language = $2 || en`.

   > **Language lock:** every heading, label, sentence, placeholder, and the report-back message must be written in `$2`. The template defines layout only — translate all its text to `$2`. Code identifiers and comment text inside diff blocks remain in the file's language.

2. **Capture and save the diff — run this as the very first tool call, before anything else.**

   ```bash
   mkdir -p ./tmp && git log --patch --reverse <branch>.. > ./tmp/diff.txt && echo "Diff saved successfully"
   ```

   > **IMPORTANT:** This command is mandatory and must execute before any analysis begins. Run it as a single `&&` chain. Never invoke `git log` without the `> ./tmp/diff.txt` redirect — a standalone `git log` dumps the entire diff into the conversation, doubling token usage.

   `--reverse` ensures commits are read oldest-first, preserving the order of implementation. Then read `./tmp/diff.txt` to analyze the changes.

3. **Resolve the explain template** in this order (stop at the first found):
   1. `./tmp/templates/explain.md` — user project override
   2. `${CLAUDE_PLUGIN_ROOT}/skills/explain/template.md` — plugin default

   Use `Read` on each candidate in order; if the file exists, that is the active template.

4. **Analyze the diff** as someone who understands implementation choices and can reconstruct the reasoning behind them. The goal is not to judge (that is `code-review`'s job) and not to target a non-technical audience (that is `handoff`'s job). The goal is to make the implementation legible to a technical peer: what problem each step solves, why the approach was chosen over alternatives, and how the pieces connect.

   Read commits chronologically. The **commit message** (subject line and body if present) is the primary source of intent — read it carefully before looking at the patch. The patch shows *what* changed; the commit message shows *why*. Use both together to reconstruct the reasoning.

   Group related commits into logical phases (e.g. "set up the data layer", "wire up the API", "add tests") rather than creating one section per commit. If the branch has only one commit, or all commits form a single atomic change with no meaningful sub-phases, use a single phase without forcing artificial splits.

   For each phase, identify the meaningful hunks — the lines where a non-trivial decision was made. Skip trivial changes (import reordering, formatting, renaming) unless the reason is non-obvious.

   For each meaningful hunk, produce an **annotated diff block**:
   - Show the real `---`/`+++`/`@@` header and the surrounding context lines.
   - Insert a "why" comment as a `+` line immediately before the line(s) it explains.
   - Use the comment syntax of the file's language: `//` for JS/TS/Go/Java/C, `#` for Python/Ruby/Shell/YAML, `--` for SQL, `<!-- -->` for HTML/XML, etc.
   - The comment must be a single sentence explaining the *reason* for that specific change — not a description of what the line does (the code already shows that).
   - Write the comment in `$2` language.

   Example of an annotated diff block:
   ```diff
   --- a/src/auth.service.ts
   +++ b/src/auth.service.ts
   @@ -41,6 +41,8 @@
    async function findUser(email: string) {
   -  return db.query(`SELECT * FROM users WHERE email = '${email}'`)
   +  // Previne SQL injection — nunca interpolar input do usuário diretamente na query
   +  return db.query('SELECT * FROM users WHERE email = ?', [email])
    }
   ```

   Do not invent motivations not supported by the diff and commit messages. If the reason for a change is unclear, write the diff block without a "why" comment and add a note `(reason not evident from diff)`.

   After analyzing all phases, identify the **key decisions**: choices where a non-obvious approach was taken over a simpler or more common alternative. These are cross-cutting observations that span the whole branch — not summaries of individual hunks already shown above. Aim for 2–4 decisions maximum; skip this section entirely if every choice in the branch was straightforward.

5. **Format the document** following the resolved template from step 3:
   - Chronological order is mandatory — do not reorder phases.
   - Use technical language; the audience can read code.
   - Markdown output, written in `$2` language (except code identifiers and comment text within diff blocks, which follow the file's language).
   - One section per logical phase, not necessarily one per commit.
   - Each phase: short prose "What was done" + "Connects to" + the annotated diff blocks. No padding.
   - The last phase's "Connects to" field must say "End state — no further dependency" (translated to `$2`).
   - The "Key decisions" section appears once, after all phases. Omit it entirely (heading included) if there are no non-obvious decisions to report.

6. **Save the document.**
   Write the final markdown to `./tmp/explain.md`.

7. **Report back** in plain text (in `$2` language):
   - Which template was used (the file path).
   - The diff file path (`./tmp/diff.txt`).
   - The explain document path (`./tmp/explain.md`).
   - The number of commits analyzed and how many logical phases were identified.
