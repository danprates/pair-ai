import { mkdir } from "node:fs/promises";
import { Prompt } from "../domain/prompt";
import type { Action, DependencyInjection } from "../domain/types";

export class PullRequest implements Action {
  constructor(private readonly di: DependencyInjection) {}

  async run(...args: string[]): Promise<void> {
    const [branch] = args;

    const logs = await this.di.git.getLogs(branch);
    const file = __dirname + "/../pull-request/pull-request.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", logs);

    const response = await this.di.ai.ask(prompt.content);

    await mkdir("./tmp", { recursive: true });
    await Prompt.to("./tmp/pull-request.md", response);
    this.di.console.log("Pull request generated successfully!");
  }
}
