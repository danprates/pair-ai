import { Prompt } from "../domain/prompt";
import type { Action, DependencyInjection } from "../domain/types";

/**
 * This class is responsible for committing changes using the Conventional Commits standard
 */
export class CommitAction implements Action {
  constructor(private readonly di: DependencyInjection) {}

  async run(...args: string[]): Promise<void> {
    const diff = await this.di.git.getDiff();

    if (diff.length === 0) {
      this.di.console.log("There are no changes to commit.");
      return;
    }

    const file = __dirname + "/../commit/commit.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", diff);

    const message = await this.di.ai.ask(prompt.content);

    await this.di.git.commit(message);
  }
}
