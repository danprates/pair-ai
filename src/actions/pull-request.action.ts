import { mkdir } from "node:fs/promises";
import { Prompt } from "../domain/prompt";
import type { DependencyInjection, UseAction } from "../domain/types";

export const usePullRequest: UseAction =
  (di: DependencyInjection) =>
  async (...args: string[]) => {
    const [branch] = args;

    const logs = await di.git.getLogs(branch);
    const file = __dirname + "/../pull-request/pull-request.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", logs);

    const response = await di.ai.ask(prompt.content);

    await mkdir("./tmp", { recursive: true });
    await Prompt.to("./tmp/pull-request.md", response);
    di.console.log("Pull request generated successfully!");
  };
