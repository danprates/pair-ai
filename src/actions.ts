import type { Config, Dependencies, UseAction } from "./types";

export const useCodeReview: UseAction =
  (
    {
      getLogs,
      getPullRequestDiff,
      readFile,
      replaceKeys,
      ask,
      saveFile,
      log,
    }: Dependencies,
    config: Config
  ) =>
  async (...args: string[]) => {
    const isLink = args[0] === "--link";

    log(isLink ? "Fetching pull request diff..." : "Fetching commit logs...");
    const content = isLink
      ? await getPullRequestDiff(args[1])
      : await getLogs(args[0]);
    const language = (isLink ? args[2] : config.LANGUAGE) || config.LANGUAGE;

    const path = __dirname + "/prompts/code-review.prompt.xml";
    const file = await readFile(path);
    const customRules = config.CODE_REVIEW_RULES
      ? await readFile(config.CODE_REVIEW_RULES)
      : "";
    const prompt = replaceKeys(file, { content, language, customRules });

    log("Asking the model for a code review, this may take a while...");
    const response = await ask(prompt);

    await saveFile("./tmp/code-review.md", response);
    log("Code review generated successfully!");
  };

export const useCommit: UseAction =
  (
    {
      getDiff,
      getRecentCommits,
      log,
      ask,
      readFile,
      replaceKeys,
      commit,
    }: Dependencies,
    config: Config
  ) =>
  async (...args: string[]) => {
    const content = await getDiff();

    if (content.length === 0) {
      log("There are no changes to commit.");
      return;
    }

    const recentCommits = await getRecentCommits();
    const path = __dirname + "/prompts/commit.prompt.xml";
    const file = await readFile(path);
    const language = config.COMMIT_LANGUAGE;
    const prompt = replaceKeys(file, { content, language, recentCommits });

    log("Asking the model for a commit message, this may take a while...");
    const message = await ask(prompt);

    await commit(message);
    log("Commit created successfully!");
  };

export const usePullRequest: UseAction =
  (
    { getLogs, readFile, replaceKeys, ask, saveFile, log }: Dependencies,
    config: Config
  ) =>
  async (...args: string[]) => {
    const [branch] = args;

    log("Fetching commit logs...");
    const content = await getLogs(branch);
    const path = __dirname + "/prompts/pull-request.prompt.xml";
    const file = await readFile(path);
    const language = config.LANGUAGE;
    const templatePath =
      config.PULL_REQUEST_TEMPLATE ||
      __dirname + "/templates/pull-request.md";
    const template = await readFile(templatePath);
    const prompt = replaceKeys(file, { content, language, template });

    log("Asking the model for a pull request description, this may take a while...");
    const response = await ask(prompt);

    await saveFile("./tmp/pull-request.md", response);
    log("Pull request generated successfully!");
  };
