import { mkdir } from "node:fs/promises";
import { Prompt } from "../domain/prompt";
import type { Ask, GetLogs } from "../domain/types";
export class CodeReview {
  constructor(private readonly git: GetLogs, private readonly ai: Ask) {}
  async run(...args: string[]): Promise<void> {
    const [branch] = args;

    const logs = await this.git.getLogs(branch);
    const file = __dirname + "/../code-review/code-review.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", logs);

    const response = await this.ai.ask(prompt.content);

    await mkdir("./tmp", { recursive: true });
    await Prompt.to("./tmp/code-review.md", response);
    console.log("Code review generated successfully!");
  }
}
