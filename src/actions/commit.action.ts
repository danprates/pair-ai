import type { DependencyInjection, UseAction } from "../types";
import { readFile, replaceKey } from "../utils";

export const useCommit: UseAction =
  (di: DependencyInjection) =>
  async (...args: string[]) => {
    const diff = await di.git.getDiff();

    if (diff.length === 0) {
      di.console.log("There are no changes to commit.");
      return;
    }

    const path = __dirname + "/../commit/commit.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKey(file, "content", diff);

    const message = await di.ai.ask(prompt);

    await di.git.commit(message);
  };
