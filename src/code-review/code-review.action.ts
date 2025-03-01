import { Prompt } from "../domain/prompt";
import type { Ask, GetLogs } from "../domain/types";

export class CodeReview {
  constructor(private readonly git: GetLogs, private readonly ai: Ask) {}
  async run(...args: string[]): Promise<void> {
    const [branch] = args;

    const logs = await this.git.getLogs(branch);
    const file = __dirname + "/code-review.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", logs);

    const response = await this.ai.ask(prompt.content);
    console.log(response);
  }
}
