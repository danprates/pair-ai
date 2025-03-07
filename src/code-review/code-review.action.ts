import { mkdir } from "node:fs/promises";
import { Prompt } from "../domain/prompt";
import type { Action, DependencyInjection } from "../domain/types";
export class CodeReview implements Action {
  constructor(private readonly di: DependencyInjection) {}
  async run(...args: string[]): Promise<void> {
    const [branch] = args;

    const logs = await this.di.git.getLogs(branch);
    const file = __dirname + "/../code-review/code-review.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", logs);

    const response = await this.di.ai.ask(prompt.content);

    await mkdir("./tmp", { recursive: true });
    await Prompt.to("./tmp/code-review.md", response);
    this.di.console.log("Code review generated successfully!");
  }
}
