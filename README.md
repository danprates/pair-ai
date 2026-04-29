# Pair AI

> A Claude Code plugin for the work you do around the code.

Writing a commit message, self-reviewing before you open a PR, explaining a change to QA, onboarding a peer to a decision you made at 2am — none of that is writing code, but all of it takes time and energy. `pair` handles the writing so you can focus on the thinking.

```text
/pair:commit
/pair:code-review
/pair:pull-request
/pair:handoff
/pair:explain
```

---

## What each skill is for

- **Commit** — "What changed here?" Stages everything, reads the diff, writes a [Conventional Commits](https://www.conventionalcommits.org/) message. Your future self and your team's `git log` will thank you.
- **Code review** — "Did I miss anything?" Runs a numbered review of your branch before you ask anyone else to look at it. Catches the thing you stopped noticing after the third read.
- **Pull request** — "What does my reviewer need to know?" Generates a PR description from your commit history. Picks up your repo's existing PR template if one exists.
- **Handoff** — "What changes on your end?" Writes a knowledge-transfer document aimed at frontend developers and QA — what was done, which scenarios are covered, how to integrate, and how to validate.
- **Explain** — "Why these decisions?" Narrates the implementation story of your branch in chronological order, with annotated diff blocks showing what changed and why. Useful before a review or when onboarding a peer to a non-trivial change.

Skills that produce documents write their output to `./tmp/` so you can inspect, edit, and version it before sharing.

---

## Skills

### `/pair:commit [language]`

Stages every change in the working tree, captures the diff, and creates a commit with a Conventional Commits message.

The scope is extracted automatically from the current branch name:

| Pattern      | Example branch           | Resulting scope |
| ------------ | ------------------------ | --------------- |
| Jira ticket  | `feat/PROJ-42-add-login` | `PROJ-42`       |
| Azure DevOps | `feat/AB#42-add-login`   | `AB#42`         |
| Bare number  | `feat/42-add-login`      | `42`            |

```text
/pair:commit              # message in English (default)
/pair:commit pt-BR        # message in Portuguese
```

The raw diff is saved to `./tmp/diff.txt` for inspection before you push.

---

### `/pair:code-review [base-branch] [language]`

Reviews everything on the current branch that is not on the base branch. Issues are **numbered globally** so you can reference them in follow-up messages.

```text
/pair:code-review                        # base: dev, language: en
/pair:code-review main
/pair:code-review origin/main pt-BR
```

The report is written to `./tmp/code-review.md`. After reading it, you can tell Claude "fix 2 and 5, explain 7" without re-running the skill.

---

### `/pair:pull-request [base-branch] [language]`

Generates a pull-request description from the commits that diverge from the base branch.

```text
/pair:pull-request
/pair:pull-request main pt-BR
```

Output is saved to `./tmp/pull-request.md`.

**Template resolution order** (first match wins):

1. `./tmp/templates/pull-request.md` — your project-local override
2. `.github/pull_request_template.md` (or `PULL_REQUEST_TEMPLATE.md`, or any `*.md` inside `.github/pull_request_template/`) — your repo's convention
3. The plugin's built-in template

---

### `/pair:handoff [base-branch] [language]`

Generates a cross-area knowledge transfer document from the commits that diverge from the base branch. Written for **frontend developers and QA** — not the team that wrote the code. Covers what was done, which scenarios are handled, how to integrate, and how to implement or validate.

```text
/pair:handoff
/pair:handoff main pt-BR
```

Output is saved to `./tmp/handoff.md`.

**Template resolution order** (first match wins):

1. `./tmp/templates/handoff.md` — your project-local override
2. The plugin's built-in template

---

### `/pair:explain [base-branch] [language]`

Narrates the implementation story of the current branch in **chronological order** — what was done, in which sequence, and why each decision was made. Written for the author preparing to present the PR, or a peer reviewer who wants to understand the decisions before reading the diff cold.

Each logical phase gets its own section with annotated diff blocks: the actual code change with a comment line (using the file's language syntax — `//`, `#`, `--`, etc.) inserted right before the changed lines, explaining the reason for that specific change.

```text
/pair:explain
/pair:explain main pt-BR
```

Output is saved to `./tmp/explain.md`.

**Template resolution order** (first match wins):

1. `./tmp/templates/explain.md` — your project-local override
2. The plugin's built-in template

---

## Install

Two commands inside any Claude Code session:

```text
/plugin marketplace add danprates/pair-ai
/plugin install pair@pair
```

All skills become available in every project on that machine — no per-repo setup needed.

---

## Customizing templates

Drop a Markdown file in `./tmp/templates/` of the project you're working on to override the default template for that project only:

| File                            | Overrides                                    |
| ------------------------------- | -------------------------------------------- |
| `tmp/templates/code-review.md`  | Review format                                |
| `tmp/templates/pull-request.md` | PR description format (beats `.github/` too) |
| `tmp/templates/handoff.md`      | Handoff document format                      |
| `tmp/templates/explain.md`      | Explain document format                      |

The global issue-numbering contract in `code-review` still applies even with a custom template — issues must be numbered sequentially across all categories so follow-up references stay unambiguous.

---

## Updating

```text
/plugin marketplace update pair
```

---

## Local development

Clone this repo and, from its root:

```bash
claude --plugin-dir ./plugins/pair
```

Run `/reload-plugins` inside the session after editing any `SKILL.md` or template to pick up the change without restarting.

There is no build step or test suite. Validation happens by invoking the skill and checking the files written under `./tmp/`.

---

## License

[MIT](LICENSE)
