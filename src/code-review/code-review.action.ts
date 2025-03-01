import { Prompt } from "../domain/prompt";
import type { GetLogs } from "../domain/types";

export class CodeReview {
  constructor(private readonly git: GetLogs) {}
  async run(...args: string[]): Promise<void> {
    const [branch] = args;

    const logs = await this.git.getLogs(branch);
    const file = __dirname + "/code-review.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", logs);
    console.log(prompt.content);
  }
}
