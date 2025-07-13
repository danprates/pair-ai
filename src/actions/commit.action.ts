import type { Dependencies, UseAction } from "../types";

export const useCommit: UseAction =
  ({ getDiff, log, ask, readFile, replaceKey, commit }: Dependencies) =>
  async (...args: string[]) => {
    const diff = await getDiff();

    if (diff.length === 0) {
      log("There are no changes to commit.");
      return;
    }

    const path = __dirname + "/../commit/commit.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKey(file, "content", diff);

    const message = await ask(prompt);

    await commit(message);
  };
