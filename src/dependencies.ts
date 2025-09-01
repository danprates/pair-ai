import { $ } from "bun";
import { useGemini } from "./artificial-inteligence/gemini";
import type { Config } from "./env";
import type { UseDependencies } from "./types";

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

const log = (message: string): void => console.log(message);

const getDiff = async (): Promise<string> => {
  const { stdout } =
    await $`git add . && git diff --cached --diff-filter=ACMR`.quiet();
  return stdout.toString().trim();
};

const commit = async (message: string): Promise<void> => {
  const sanitizedMessage = message.replaceAll("```", "").trim();
  await $`git add . && git commit -m "${sanitizedMessage}"`;
};

const getLogs = async (branch: string): Promise<string> => {
  const { stdout } =
    await $`git log --patch --graph ${branch}.. --diff-filter=ACMR`.quiet();
  return stdout.toString().trim();
};

export const useDependencies: UseDependencies = (config: Config) => ({
  readFile,
  saveFile,
  replaceKey,
  replaceKeys,
  log,
  getDiff,
  commit,
  getLogs,
  ask: useGemini(process.env.GEMINI_API_KEY || "", config.MODEL),
});
