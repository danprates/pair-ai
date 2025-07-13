import { mkdir } from "node:fs/promises";
import type { DependencyInjection, UseAction } from "../types";
import { getLogs, log, readFile, replaceKey, saveFile } from "../utils";

export const useCodeReview: UseAction =
  (di: DependencyInjection) =>
  async (...args: string[]) => {
    const [branch] = args;

    const logs = await getLogs(branch);
    const path = __dirname + "/../code-review/code-review.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKey(file, "content", logs);

    const response = await di.ai.ask(prompt);

    await mkdir("./tmp", { recursive: true });
    await saveFile("./tmp/code-review.md", response);
    log("Code review generated successfully!");
  };
