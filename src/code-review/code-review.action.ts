import { mkdir } from "node:fs/promises";
import { Prompt } from "../domain/prompt";
import type { DependencyInjection, UseAction } from "../domain/types";

export const useCodeReview: UseAction =
  (di: DependencyInjection) =>
  async (...args: string[]) => {
    const [branch] = args;

    const logs = await di.git.getLogs(branch);
    const file = __dirname + "/../code-review/code-review.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", logs);

    const response = await di.ai.ask(prompt.content);

    await mkdir("./tmp", { recursive: true });
    await Prompt.to("./tmp/code-review.md", response);
    di.console.log("Code review generated successfully!");
  };
