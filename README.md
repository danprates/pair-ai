# Pair AI

Pair AI is a CLI tool that helps you in your routine tasks.

## Dependencies

Before running the CLI, you need to have the following dependencies installed:

- Bun: See [bun.sh](https://bun.sh) for installation instructions.
- Git: Normally installed by default on macOS and Linux.
- OpenRouter API Key: You can get it [here](https://openrouter.ai/settings/keys).

Now just export your OpenRouter API Key as an environment variable:

```bash
echo "export OPENROUTER_API_KEY=your-api-key" >> ~/.bashrc
```

## Installation

To install dependencies for `pair-ai`, run:

```bash
bun install
```

## Usage

To run the CLI during development, use:

```bash
bun run dev
```

To compile the CLI into an executable:

```bash
bun run compile
```

After compiling, the executable will be available at `dist/pair` and automatically copied to `~/.local/bin`. You should then be able to run it directly from your terminal:

```bash
pair commit
```

## Commands

- `pair commit`: Commits changes using the Conventional Commits standard.
- `pair code-review --branch <branch>`: Analyzes the code in the specified branch and suggests improvements.
- `pair code-review --link <url> [--lang <language>] [--severity <level>]`: Analyzes a pull request diff from a link.
- `pair pull-request --branch <branch>`: Creates a pull request description based on the changes in the specified branch.
- `pair explain --branch <branch>`: Explains, in plain language, what changed in the specified branch.
- `pair explain --link <url> [--lang <language>]`: Explains, in plain language, what changed in a pull request diff.

## Scripts

- `dev`: Runs the CLI in development mode with live reloading using `bun run --watch src/pair.ts`.
- `compile`: Compiles the TypeScript code into a standalone executable using `bun build`.
- `test`: Runs tests using `bun test`.
- `test:watch`: Runs tests in watch mode using `bun test --watch`.

## License

[MIT](LICENSE)
