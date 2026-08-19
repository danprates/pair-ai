import { $ } from "bun";
import { useModel } from "./artificial-inteligence/model";
import { usePullRequestDiff } from "./source-control/provider";
import type { Config, UseDependencies } from "./types";

const readFile = async (file: string): Promise<string> => {
  return await Bun.file(file).text();
};

const saveFile = async (file: string, content: string): Promise<void> => {
  await Bun.write(file, content);
};

const replaceKey = (content: string, key: string, value: string): string => {
  const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
  return content.replace(regex, value);
};

const replaceKeys = (content: string, keys: Record<string, string>): string => {
  return Object.entries(keys).reduce(
    (acc, [key, value]) => replaceKey(acc, key, value),
    content
  );
};

const log = (message: string): void => console.error(message);

const printJson = (data: Record<string, unknown>): void =>
  console.log(JSON.stringify(data));

const getDiff = async (): Promise<string> => {
  const { stdout } =
    await $`git add . && git diff --cached --diff-filter=ACMR`.quiet();
  return stdout.toString().trim();
};

const commit = async (message: string): Promise<void> => {
  const sanitizedMessage = message.replaceAll("```", "").trim();
  await $`git add . && git commit -m "${sanitizedMessage}"`.quiet();
};

const getLogs = async (branch: string): Promise<string> => {
  const { stdout } =
    await $`git log --patch --graph ${branch}.. --diff-filter=ACMR`.quiet();
  return stdout.toString().trim();
};

const getRecentCommits = async (): Promise<string> => {
  try {
    const { stdout } = await $`git log -5 --pretty=format:%s`.quiet();
    return stdout.toString().trim();
  } catch {
    return "";
  }
};

export const useDependencies: UseDependencies = (config: Config) => ({
  readFile,
  saveFile,
  replaceKey,
  replaceKeys,
  log,
  printJson,
  getDiff,
  commit,
  getLogs,
  getRecentCommits,
  getPullRequestDiff: usePullRequestDiff(config),
  ask: useModel(config),
});
