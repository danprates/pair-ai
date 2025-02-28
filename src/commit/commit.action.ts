import { Prompt } from "../domain/prompt";
import type { Ask, GetDiff, Log } from "../domain/types";

/**
 * This class is responsible for committing changes using the Conventional Commits standard
 */
export class CommitAction {
  constructor(
    private readonly git: GetDiff,
    private readonly console: Log,
    private readonly ai: Ask
  ) {}

  async run(): Promise<void> {
    const diff = await this.git.getDiff();

    if (diff.length === 0) {
      this.console.log("There are no changes to commit.");
      return;
    }

    const file = __dirname + "/commit.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", diff);

    const response = await this.ai.ask(prompt.content);
    this.console.log(response);
  }
}
