import { parseArgs } from "./args";
import codeReviewPrompt from "./prompts/code-review.prompt.xml" with { type: "text" };
import commitPrompt from "./prompts/commit.prompt.xml" with { type: "text" };
import explainPrompt from "./prompts/explain.prompt.xml" with { type: "text" };
import pullRequestPrompt from "./prompts/pull-request.prompt.xml" with { type: "text" };
import defaultPullRequestTemplate from "./templates/pull-request.md" with { type: "text" };
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

    const customRules = config.CODE_REVIEW_RULES
      ? await readFile(config.CODE_REVIEW_RULES)
      : "";
    const prompt = replaceKeys(codeReviewPrompt, {
      content,
      language,
      customRules,
      severity,
    });

    log("Asking the model for a code review, this may take a while...");
    const start = Date.now();
    const response = await ask(prompt);
    const duration = Date.now() - start;

    const outputFile = "./tmp/code-review.md";
    await saveFile(outputFile, response.content);

    printJson({
      ok: true,
      action: "code-review",
      message: `Code review generated successfully and saved to ${outputFile}.`,
      file: outputFile,
      tokens: response.tokens,
      cost: response.cost,
      duration,
      model: config.MODEL,
    });
  };

export const useExplain: UseAction =
  (
    {
      getLogs,
      getPullRequestDiff,
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

    const prompt = replaceKeys(explainPrompt, { content, language });

    log("Asking the model for an explanation, this may take a while...");
    const start = Date.now();
    const response = await ask(prompt);
    const duration = Date.now() - start;

    const outputFile = "./tmp/explain.md";
    await saveFile(outputFile, response.content);

    printJson({
      ok: true,
      action: "explain",
      message: `Explanation generated successfully and saved to ${outputFile}.`,
      file: outputFile,
      tokens: response.tokens,
      cost: response.cost,
      duration,
      model: config.MODEL,
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
    const language = config.COMMIT_LANGUAGE;
    const prompt = replaceKeys(commitPrompt, {
      content,
      language,
      recentCommits,
    });

    log("Asking the model for a commit message, this may take a while...");
    const start = Date.now();
    const response = await ask(prompt);
    const duration = Date.now() - start;

    await commit(response.content);

    printJson({
      ok: true,
      action: "commit",
      message: `Commit created successfully with message: "${response.content}".`,
      tokens: response.tokens,
      cost: response.cost,
      duration,
      model: config.MODEL,
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
    const language = config.LANGUAGE;
    const template = config.PULL_REQUEST_TEMPLATE
      ? await readFile(config.PULL_REQUEST_TEMPLATE)
      : defaultPullRequestTemplate;
    const prompt = replaceKeys(pullRequestPrompt, {
      content,
      language,
      template,
    });

    log(
      "Asking the model for a pull request description, this may take a while...",
    );
    const start = Date.now();
    const response = await ask(prompt);
    const duration = Date.now() - start;

    const outputFile = "./tmp/pull-request.md";
    await saveFile(outputFile, response.content);

    printJson({
      ok: true,
      action: "pull-request",
      message: `Pull request description generated successfully and saved to ${outputFile}.`,
      file: outputFile,
      tokens: response.tokens,
      cost: response.cost,
      duration,
      model: config.MODEL,
    });
  };
