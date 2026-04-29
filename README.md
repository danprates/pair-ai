# Pair AI

> Three Claude Code skills that handle the git chores you do after every coding session.

If you use [Claude Code](https://claude.ai/code), `pair` gives you three slash commands that cover the most repetitive parts of the git workflow: writing a commit message, reviewing your changes before pushing, and drafting a pull-request description. Each one reads your actual diff — no copy-pasting, no context switching.

```text
/pair:commit
/pair:code-review
/pair:pull-request
```

---

## Why bother?

Writing a good commit message, doing an honest self-review, and drafting a PR description that reviewers actually read are all things most developers do hastily — or skip entirely. `pair` doesn't replace your judgment; it does the mechanical work so you can focus on the call.

- **Commit** — stages everything, reads the diff, and produces a [Conventional Commits](https://www.conventionalcommits.org/) message. If your branch name contains a Jira or Azure DevOps ticket, the scope is extracted automatically.
- **Code review** — compares the current branch against a base branch and produces a numbered issue list. You can then say "fix 2, ignore 3" in follow-up messages.
- **Pull request** — generates a PR description from your commit history. Picks up your repo's existing PR template if one exists.

All three skills write their output to `./tmp/` so you can inspect, edit, and version it before pushing.

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

## Install

Two commands inside any Claude Code session:

```text
/plugin marketplace add danprates/pair-ai
/plugin install pair@pair
```

The three skills become available in every project on that machine — no per-repo setup needed.

---

## Customizing templates

Drop a Markdown file in `./tmp/templates/` of the project you're working on to override the default template for that project only:

| File                            | Overrides                                    |
| ------------------------------- | -------------------------------------------- |
| `tmp/templates/code-review.md`  | Review format                                |
| `tmp/templates/pull-request.md` | PR description format (beats `.github/` too) |

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
