import { mkdir } from "node:fs/promises";
import type { Dependencies, UseAction } from "../types";

export const useCodeReview: UseAction =
  ({ getLogs, readFile, replaceKey, ask, saveFile, log }: Dependencies) =>
  async (...args: string[]) => {
    const [branch] = args;

    const logs = await getLogs(branch);
    const path = __dirname + "/../code-review/code-review.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKey(file, "content", logs);

    const response = await ask(prompt);

    await mkdir("./tmp", { recursive: true });
    await saveFile("./tmp/code-review.md", response);
    log("Code review generated successfully!");
  };
