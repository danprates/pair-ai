import { mkdir } from "node:fs/promises";
import type { Dependencies, UseAction } from "../types";

export const usePullRequest: UseAction =
  ({ getLogs, readFile, replaceKey, ask, saveFile, log }: Dependencies) =>
  async (...args: string[]) => {
    const [branch] = args;

    const logs = await getLogs(branch);
    const path = __dirname + "/../pull-request/pull-request.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKey(file, "content", logs);

    const response = await ask(prompt);

    await mkdir("./tmp", { recursive: true });
    await saveFile("./tmp/pull-request.md", response);
    log("Pull request generated successfully!");
  };
