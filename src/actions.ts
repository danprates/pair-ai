import { parseArgs } from "./args";
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
      printJson,
    }: Dependencies,
    config: Config,
  ) =>
  async (...args: string[]) => {
    const { link, branch, lang, severity = "low" } = parseArgs(args);

    const isLink = link !== undefined;

    log(isLink ? "Fetching pull request diff..." : "Fetching commit logs...");
    const content = isLink
      ? await getPullRequestDiff(link)
      : await getLogs(branch);
    const language = (isLink ? lang : config.LANGUAGE) || config.LANGUAGE;

    const path = __dirname + "/prompts/code-review.prompt.xml";
    const file = await readFile(path);
    const customRules = config.CODE_REVIEW_RULES
      ? await readFile(config.CODE_REVIEW_RULES)
      : "";
    const prompt = replaceKeys(file, {
      content,
      language,
      customRules,
      severity,
    });

    log("Asking the model for a code review, this may take a while...");
    const response = await ask(prompt);

    const outputFile = "./tmp/code-review.md";
    await saveFile(outputFile, response);

    printJson({
      ok: true,
      action: "code-review",
      message: `Code review generated successfully and saved to ${outputFile}.`,
      file: outputFile,
    });
  };

export const useExplain: UseAction =
  (
    {
      getLogs,
      getPullRequestDiff,
      readFile,
      replaceKeys,
      ask,
      saveFile,
      log,
      printJson,
    }: Dependencies,
    config: Config,
  ) =>
  async (...args: string[]) => {
    const { link, branch, lang } = parseArgs(args);

    const isLink = link !== undefined;

    log(isLink ? "Fetching pull request diff..." : "Fetching commit logs...");
    const content = isLink
      ? await getPullRequestDiff(link)
      : await getLogs(branch);
    const language = (isLink ? lang : config.LANGUAGE) || config.LANGUAGE;

    const path = __dirname + "/prompts/explain.prompt.xml";
    const file = await readFile(path);
    const prompt = replaceKeys(file, { content, language });

    log("Asking the model for an explanation, this may take a while...");
    const response = await ask(prompt);

    const outputFile = "./tmp/explain.md";
    await saveFile(outputFile, response);

    printJson({
      ok: true,
      action: "explain",
      message: `Explanation generated successfully and saved to ${outputFile}.`,
      file: outputFile,
    });
  };

export const useCommit: UseAction =
  (
    {
      getDiff,
      getRecentCommits,
      log,
      printJson,
      ask,
      readFile,
      replaceKeys,
      commit,
    }: Dependencies,
    config: Config,
  ) =>
  async (...args: string[]) => {
    const content = await getDiff();

    if (content.length === 0) {
      printJson({
        ok: true,
        action: "commit",
        message: "There are no changes to commit.",
      });
      return;
    }

    const recentCommits = await getRecentCommits();
    const path = __dirname + "/prompts/commit.prompt.xml";
    const file = await readFile(path);
    const language = config.COMMIT_LANGUAGE;
    const prompt = replaceKeys(file, { content, language, recentCommits });

    log("Asking the model for a commit message, this may take a while...");
    const commitMessage = await ask(prompt);

    await commit(commitMessage);

    printJson({
      ok: true,
      action: "commit",
      message: `Commit created successfully with message: "${commitMessage}".`,
    });
  };

export const usePullRequest: UseAction =
  (
    {
      getLogs,
      readFile,
      replaceKeys,
      ask,
      saveFile,
      log,
      printJson,
    }: Dependencies,
    config: Config,
  ) =>
  async (...args: string[]) => {
    const { branch } = parseArgs(args);

    log("Fetching commit logs...");
    const content = await getLogs(branch);
    const path = __dirname + "/prompts/pull-request.prompt.xml";
    const file = await readFile(path);
    const language = config.LANGUAGE;
    const templatePath =
      config.PULL_REQUEST_TEMPLATE || __dirname + "/templates/pull-request.md";
    const template = await readFile(templatePath);
    const prompt = replaceKeys(file, { content, language, template });

    log(
      "Asking the model for a pull request description, this may take a while...",
    );
    const response = await ask(prompt);

    const outputFile = "./tmp/pull-request.md";
    await saveFile(outputFile, response);

    printJson({
      ok: true,
      action: "pull-request",
      message: `Pull request description generated successfully and saved to ${outputFile}.`,
      file: outputFile,
    });
  };
