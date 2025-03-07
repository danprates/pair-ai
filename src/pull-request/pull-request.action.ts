import { mkdir } from "node:fs/promises";
import { Prompt } from "../domain/prompt";
import type { Action, Ask, GetLogs, Log } from "../domain/types";

export class PullRequest implements Action {
  constructor(
    private readonly git: GetLogs,
    private readonly console: Log,
    private readonly ai: Ask
  ) {}

  async run(...args: string[]): Promise<void> {
    const [branch] = args;

    const logs = await this.git.getLogs(branch);
    const file = __dirname + "/../pull-request/pull-request.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", logs);

    const response = await this.ai.ask(prompt.content);

    await mkdir("./tmp", { recursive: true });
    await Prompt.to("./tmp/pull-request.md", response);
    this.console.log("Pull request generated successfully!");
  }
}
