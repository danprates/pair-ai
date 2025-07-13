import { mkdir } from "node:fs/promises";
import { readFile, replaceKey, saveFile } from "../domain/file";
import type { DependencyInjection, UseAction } from "../domain/types";
import { log } from "../infra/console";
import { getLogs } from "../infra/git";

export const usePullRequest: UseAction =
  (di: DependencyInjection) =>
  async (...args: string[]) => {
    const [branch] = args;

    const logs = await getLogs(branch);
    const path = __dirname + "/../pull-request/pull-request.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKey(file, "content", logs);

    const response = await di.ai.ask(prompt);

    await mkdir("./tmp", { recursive: true });
    await saveFile("./tmp/pull-request.md", response);
    log("Pull request generated successfully!");
  };
