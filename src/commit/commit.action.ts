import { Prompt } from "../domain/prompt";
import type { Action, Ask, CommitMessage, GetDiff, Log } from "../domain/types";

/**
 * This class is responsible for committing changes using the Conventional Commits standard
 */
export class CommitAction implements Action {
  constructor(
    private readonly git: GetDiff & CommitMessage,
    private readonly console: Log,
    private readonly ai: Ask
  ) {}

  async run(...args: string[]): Promise<void> {
    const diff = await this.git.getDiff();

    if (diff.length === 0) {
      this.console.log("There are no changes to commit.");
      return;
    }

    const file = __dirname + "/../commit/commit.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", diff);

    const message = await this.ai.ask(prompt.content);

    await this.git.commit(message);
  }
}
