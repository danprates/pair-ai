import { $ } from "bun";
import { useGemini } from "./artificial-inteligence/gemini";
import type { UseDependencies } from "./types";

export const readFile = async (file: string): Promise<string> => {
  return await Bun.file(file).text();
};

export const saveFile = async (
  file: string,
  content: string
): Promise<void> => {
  await Bun.write(file, content);
};

export const replaceKey = (
  content: string,
  key: string,
  value: string
): string => {
  const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
  return content.replace(regex, value);
};

export const log = (message: string): void => console.log(message);

export const getDiff = async (): Promise<string> => {
  const { stdout } =
    await $`git add . && git diff --cached --diff-filter=ACMR`.quiet();
  return stdout.toString().trim();
};

export const commit = async (message: string): Promise<void> => {
  const sanitizedMessage = message.replaceAll("```", "").trim();
  await $`git add . && git commit -m "${sanitizedMessage}"`;
};

export const getLogs = async (branch: string): Promise<string> => {
  const { stdout } =
    await $`git log --patch --graph ${branch}.. --diff-filter=ACMR`.quiet();
  return stdout.toString().trim();
};

export const useDependencies: UseDependencies = () => ({
  readFile,
  saveFile,
  replaceKey,
  log,
  getDiff,
  commit,
  getLogs,
  ask: useGemini(process.env.GEMINI_API_KEY || "", "gemini-2.0-flash"),
});
