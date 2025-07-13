import type { Dependencies, UseAction } from "./types";

export const useCodeReview: UseAction =
  ({ getLogs, readFile, replaceKey, ask, saveFile, log }: Dependencies) =>
  async (...args: string[]) => {
    const [branch] = args;

    const logs = await getLogs(branch);
    const path = __dirname + "/prompts/code-review.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKey(file, "content", logs);

    const response = await ask(prompt);

    await saveFile("./tmp/code-review.md", response);
    log("Code review generated successfully!");
  };

export const useCommit: UseAction =
  ({ getDiff, log, ask, readFile, replaceKey, commit }: Dependencies) =>
  async (...args: string[]) => {
    const diff = await getDiff();

    if (diff.length === 0) {
      log("There are no changes to commit.");
      return;
    }

    const path = __dirname + "/prompts/commit.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKey(file, "content", diff);

    const message = await ask(prompt);

    await commit(message);
  };

export const usePullRequest: UseAction =
  ({ getLogs, readFile, replaceKey, ask, saveFile, log }: Dependencies) =>
  async (...args: string[]) => {
    const [branch] = args;

    const logs = await getLogs(branch);
    const path = __dirname + "/prompts/pull-request.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKey(file, "content", logs);

    const response = await ask(prompt);

    await saveFile("./tmp/pull-request.md", response);
    log("Pull request generated successfully!");
  };
