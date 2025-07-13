import { Prompt } from "../domain/prompt";
import type { DependencyInjection, UseAction } from "../domain/types";

export const useCommit: UseAction =
  (di: DependencyInjection) =>
  async (...args: string[]) => {
    const diff = await di.git.getDiff();

    if (diff.length === 0) {
      di.console.log("There are no changes to commit.");
      return;
    }

    const file = __dirname + "/../commit/commit.prompt.xml";
    const prompt = await Prompt.from(file);
    prompt.replace("content", diff);

    const message = await di.ai.ask(prompt.content);

    await di.git.commit(message);
  };
