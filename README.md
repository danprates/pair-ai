# pair

Claude Code plugin providing three skills: `/pair:commit`, `/pair:code-review`, `/pair:pull-request`.

## Skills

### `/pair:commit [language]`

Stages every change in the working tree, captures the diff, and creates a commit with a [Conventional Commits](https://www.conventionalcommits.org/) message. The scope is extracted automatically from the current branch name when it contains a Jira (`JIRA-1234`) or Azure DevOps (`AB#1234`, `#1234`, or a bare number after the type prefix) ticket.

```text
/pair:commit              # default language: en
/pair:commit pt-BR        # message in Portuguese
```

Example: on branch `feat/JIRA-1234-add-login`, the resulting commit becomes `feat(JIRA-1234): add login form`.

The raw diff is saved to `./tmp/diff.txt` for inspection before you push.

### `/pair:code-review [base-branch] [language]`

Reviews everything on the current branch that is not on the base branch. The report is written to `./tmp/code-review.md` with each issue **numbered globally** so you can reference them in follow-up messages ("fix 2", "ignore 3").

```text
/pair:code-review                        # base: dev, language: en
/pair:code-review main
/pair:code-review origin/main pt-BR
```

### `/pair:pull-request [base-branch] [language]`

Generates a pull-request description from the commits that diverge from the base branch. Output is saved to `./tmp/pull-request.md`.

```text
/pair:pull-request
/pair:pull-request main pt-BR
```

The template is resolved in this order:

1. `./tmp/templates/pull-request.md` — project-local override
2. `.github/pull_request_template.md` (or `PULL_REQUEST_TEMPLATE.md`, or any `*.md` inside `.github/pull_request_template/`) — repo convention
3. The plugin's built-in template

## Install

Inside Claude Code:

```text
/plugin marketplace add danprates/pair-ai
/plugin install pair@pair
```

That's it — the three skills become available in any project.

## Customizing templates

Drop a markdown file in `./tmp/templates/` of the project you're working on to override the default template for that project only:

- `tmp/templates/code-review.md` — overrides the review format
- `tmp/templates/pull-request.md` — overrides the PR description format (also beats `.github/`)

The issue-numbering contract still applies to `code-review`, even with a custom template.

## Updating

```text
/plugin marketplace update pair
```

## Local development

Clone this repo and, from its root:

```bash
claude --plugin-dir ./plugins/pair
```

Inside the session, use `/reload-plugins` after editing any `SKILL.md` to pick up the change without restarting.

## License

[MIT](LICENSE)
