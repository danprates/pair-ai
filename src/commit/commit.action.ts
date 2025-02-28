import { Prompt } from "../domain/prompt";
import type { GetDiff } from "../domain/types";

/**
 * This class is responsible for committing changes using the Conventional Commits standard
 */
export class CommitAction {
  constructor(
    private readonly git: GetDiff,
    private readonly output: (message: string) => void
  ) {}

  async run(): Promise<void> {
    const diff = await this.git.getDiff();

    if (diff.length === 0) {
      this.output("There are no changes to commit.");
      return;
    }

    const prompt = await Prompt.from("commit.prompt.xml");
    prompt.replace("content", diff);
  }
}
