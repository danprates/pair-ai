import { Prompt } from "../domain/prompt";
import type { GetDiff, Log } from "../domain/types";

/**
 * This class is responsible for committing changes using the Conventional Commits standard
 */
export class CommitAction {
  constructor(private readonly git: GetDiff, private readonly console: Log) {}

  async run(): Promise<void> {
    const diff = await this.git.getDiff();

    if (diff.length === 0) {
      this.console.log("There are no changes to commit.");
      return;
    }

    const prompt = await Prompt.from("commit.prompt.xml");
    prompt.replace("content", diff);
  }
}
